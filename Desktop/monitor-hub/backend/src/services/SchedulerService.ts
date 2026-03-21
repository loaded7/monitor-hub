import Queue from 'bull';
import { AppDataSource } from '../config/database';
import { Check } from '../models/Check';
import { CheckHistory } from '../models/CheckHistory';
import { CheckService } from './CheckService';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Criar fila para health checks
const checkQueue = new Queue('health-checks', REDIS_URL);

const checkRepository = AppDataSource.getRepository(Check);
const historyRepository = AppDataSource.getRepository(CheckHistory);

export class SchedulerService {
  static async initialize() {
    console.log('📅 Initializing job scheduler...');

    // Processar jobs da fila
    checkQueue.process(async (job) => {
      const checkId = job.data.checkId;
      const check = await checkRepository.findOneBy({ id: checkId });

      if (!check || !check.enabled) {
        return { skipped: true };
      }

      // Executar check
      const result = await CheckService.executeCheck(check.type, check.url, {
        method: check.method,
        expectedStatusCode: check.expectedStatusCode,
        port: check.port,
        timeoutMs: check.timeoutMs,
      });

      // Salvar histórico
      const history = historyRepository.create({
        checkId: check.id,
        status: result.success ? 'success' : 'failure',
        responseTimeMs: result.responseTimeMs,
        errorMessage: result.errorMessage,
      });
      await historyRepository.save(history);

      // Atualizar status do check
      const oldStatus = check.status;
      check.status = result.success ? 'ok' : 'down';
      check.responseTimeMs = result.responseTimeMs;
      check.lastCheckedAt = new Date();
      await checkRepository.save(check);

      // Log se status mudou
      if (oldStatus !== check.status) {
        console.log(`⚠️  Check "${check.name}" changed from ${oldStatus} to ${check.status}`);
      }

      return { success: result.success, responseTimeMs: result.responseTimeMs };
    });

    // Event listeners
    checkQueue.on('completed', (job) => {
      console.log(`✅ Check completed: ${job.data.checkId}`);
    });

    checkQueue.on('failed', (job, err) => {
      console.error(`❌ Check failed: ${job.data.checkId}`, err.message);
    });

    console.log('✅ Job scheduler initialized');
  }

  static async scheduleCheck(check: Check) {
    // Agendar job recorrente
    await checkQueue.add(
      { checkId: check.id },
      {
        repeat: {
          every: check.intervalSeconds * 1000, // converter para ms
        },
        removeOnComplete: false,
        removeOnFail: false,
      }
    );

    console.log(`📌 Check scheduled: "${check.name}" every ${check.intervalSeconds}s`);
  }

  static async unscheduleCheck(checkId: string) {
  const jobs = await checkQueue.getRepeatableJobs();
  for (const job of jobs) {
    if ((job as any).data?.checkId === checkId) {
      await checkQueue.removeRepeatableByKey(job.key);
      console.log(`🗑️  Check unscheduled: ${checkId}`);
    }
  }
}

  static async scheduleAllChecks() {
    const checks = await checkRepository.find({ where: { enabled: true } });

    for (const check of checks) {
      await this.scheduleCheck(check);
    }

    console.log(`📅 Scheduled ${checks.length} checks`);
  }

  static getQueue() {
    return checkQueue;
  }
}