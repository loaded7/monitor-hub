import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Check } from '../models/Check';
import { CheckHistory } from '../models/CheckHistory';
import { CheckService } from '../services/CheckService';

const router = Router();
const checkRepository = AppDataSource.getRepository(Check);
const historyRepository = AppDataSource.getRepository(CheckHistory);

// Middleware: verificar autenticação
const authMiddleware = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // TODO: verificar JWT
  (req as any).userId = 'e05684ba-4ee2-4dea-a51f-c2f0a0bc55c0'; // UUID do seu usuário de teste
  next();
};

// GET /api/checks - listar checks do usuário
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const checks = await checkRepository.find({ where: { userId } });
    res.json(checks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/checks - criar novo check
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, type, url, method, expectedStatusCode, port, timeoutMs, intervalSeconds } = req.body;

    if (!name || !type || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const check = checkRepository.create({
      userId,
      name,
      type,
      url,
      method: method || 'GET',
      expectedStatusCode: expectedStatusCode || 200,
      port,
      timeoutMs: timeoutMs || 5000,
      intervalSeconds: intervalSeconds || 300,
    });

    await checkRepository.save(check);

// Agendar o check
const { SchedulerService } = await import('../services/SchedulerService');
await SchedulerService.scheduleCheck(check);

res.status(201).json(check);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/checks/:id - detalhes do check
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const check = await checkRepository.findOneBy({ id: req.params.id });
    if (!check) {
      return res.status(404).json({ error: 'Check not found' });
    }
    res.json(check);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/checks/:id - atualizar check
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const check = await checkRepository.findOneBy({ id: req.params.id });
    if (!check) {
      return res.status(404).json({ error: 'Check not found' });
    }

    Object.assign(check, req.body);
    await checkRepository.save(check);
    res.json(check);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/checks/:id - deletar check
// DELETE /api/checks/:id - deletar check
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const check = await checkRepository.findOneBy({ id: req.params.id });
    if (!check) {
      return res.status(404).json({ error: 'Check not found' });
    }

    await checkRepository.remove(check);

    // Desagendar o check
    const { SchedulerService } = await import('../services/SchedulerService');
    await SchedulerService.unscheduleCheck(check.id);

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/checks/:id/test - testar check manualmente
router.post('/:id/test', authMiddleware, async (req: Request, res: Response) => {
  try {
    const check = await checkRepository.findOneBy({ id: req.params.id });
    if (!check) {
      return res.status(404).json({ error: 'Check not found' });
    }

    const result = await CheckService.executeCheck(check.type, check.url, {
      method: check.method,
      expectedStatusCode: check.expectedStatusCode,
      port: check.port,
      timeoutMs: check.timeoutMs,
    });

    check.responseTimeMs = result.responseTimeMs ?? 0;
    check.lastCheckedAt = new Date();
    check.status = result.success ? 'ok' : 'down';
    await checkRepository.save(check);

    const history = historyRepository.create({
      checkId: check.id,
      status: result.success ? 'success' : 'failure',
      responseTimeMs: result.responseTimeMs,
      errorMessage: result.errorMessage,
    });
    await historyRepository.save(history);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/checks/:id/history - histórico do check
router.get('/:id/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const history = await historyRepository.find({
      where: { checkId: req.params.id },
      order: { checkedAt: 'DESC' },
      take: 100,
    });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;