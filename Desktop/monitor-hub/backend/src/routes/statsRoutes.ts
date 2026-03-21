import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Check } from '../models/Check';
import { CheckHistory } from '../models/CheckHistory';

const router = Router();
const checkRepository = AppDataSource.getRepository(Check);
const historyRepository = AppDataSource.getRepository(CheckHistory);

// Middleware: verificar autenticação
const authMiddleware = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  (req as any).userId = 'e05684ba-4ee2-4dea-a51f-c2f0a0bc55c0';
  next();
};

// GET /api/stats/dashboard - dados gerais do dashboard
router.get('/dashboard', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // Total de checks
    const totalChecks = await checkRepository.count({ where: { userId } });
    
    // Checks por status
    const checks = await checkRepository.find({ where: { userId } });
    const okCount = checks.filter(c => c.status === 'ok').length;
    const downCount = checks.filter(c => c.status === 'down').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    // Uptime médio (últimas 24h)
    const recentHistory = await historyRepository.find({
    order: { checkedAt: 'DESC' },
    take: 288,
    });

    let uptime = 100;
    if (recentHistory.length > 0) {
      const successCount = recentHistory.filter(h => h.status === 'success').length;
      uptime = Math.round((successCount / recentHistory.length) * 100);
    }

    // Tempo de resposta médio
    const avgResponseTime = recentHistory.length > 0
      ? Math.round(
          recentHistory.reduce((sum, h) => sum + (h.responseTimeMs || 0), 0) /
          recentHistory.length
        )
      : 0;

    res.json({
      totalChecks,
      okCount,
      downCount,
      degradedCount,
      uptime,
      avgResponseTime,
      lastUpdate: new Date(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats/checks/:id - estatísticas de um check específico
router.get('/checks/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const check = await checkRepository.findOneBy({ id: req.params.id });
    if (!check) {
      return res.status(404).json({ error: 'Check not found' });
    }

    // Histórico das últimas 24h
    const history = await historyRepository.find({
    where: { checkId: req.params.id },
    order: { checkedAt: 'DESC' as any },
    take: 288, // 24h em intervalos de 5min
    });

    // Calcular uptime
    const successCount = history.filter(h => h.status === 'success').length;
    const uptime24h = history.length > 0 ? Math.round((successCount / history.length) * 100) : 100;

    // Tempo de resposta médio
    const avgResponseTime = history.length > 0
      ? Math.round(
          history.reduce((sum, h) => sum + (h.responseTimeMs || 0), 0) /
          history.length
        )
      : 0;

    // Min/Max response time
    const responseTimes = history
      .filter(h => h.responseTimeMs)
      .map(h => h.responseTimeMs as number);
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

    res.json({
      check,
      uptime24h,
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      lastCheck: check.lastCheckedAt,
      history: history.reverse(), // Ordenar por tempo ascendente
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;