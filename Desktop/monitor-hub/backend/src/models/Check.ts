import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export type CheckType = 'http' | 'tcp' | 'dns';
export type CheckStatus = 'ok' | 'down' | 'degraded';

@Entity('checks')
export class Check {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: CheckType; // 'http', 'tcp', 'dns'

  @Column({ type: 'varchar', length: 500 })
  url: string; // URL ou hostname

  @Column({ type: 'varchar', length: 10, default: 'GET' })
  method: string; // Para HTTP

  @Column({ type: 'int', default: 200 })
  expectedStatusCode: number; // Para HTTP

  @Column({ type: 'int', nullable: true })
  port: number; // Para TCP

  @Column({ type: 'int', default: 5000 })
  timeoutMs: number;

  @Column({ type: 'int', default: 300 })
  intervalSeconds: number; // Frequência de check

  @Column({ type: 'varchar', length: 20, default: 'ok' })
  status: CheckStatus;

  @Column({ type: 'int', nullable: true })
  responseTimeMs: number;

  @Column({ type: 'timestamp', nullable: true })
  lastCheckedAt: Date;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}