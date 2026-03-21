import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Check } from '../models/Check';
import { CheckHistory } from '../models/CheckHistory';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'monitorhub',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Check, CheckHistory],
  migrations: [],
  subscribers: [],
});

export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connection established');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}