import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { EmailService } from '../services/EmailService';

const router = Router();
const userRepository = AppDataSource.getRepository(User);

const authMiddleware = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  (req as any).userId = 'e05684ba-4ee2-4dea-a51f-c2f0a0bc55c0';
  next();
};

router.put('/alert-email', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { alertEmail } = req.body;

    if (!alertEmail || !alertEmail.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.alertEmail = alertEmail;
    await userRepository.save(user);

    res.json({ success: true, alertEmail });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/test-alert', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const emailTo = user.alertEmail || user.email;
    await EmailService.sendDownAlert(emailTo, 'Test Monitor', 'https://example.com', 999);

    res.json({ success: true, sentTo: emailTo });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;