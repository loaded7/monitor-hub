import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Check } from './Check';

@Entity('check_history')
export class CheckHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  checkId: string;

  @ManyToOne(() => Check)
  @JoinColumn({ name: 'checkId' })
  check: Check;

  @Column({ type: 'varchar', length: 20 })
  status: 'success' | 'failure';

  @Column({ type: 'int', nullable: true })
  responseTimeMs: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  checkedAt: Date;
}