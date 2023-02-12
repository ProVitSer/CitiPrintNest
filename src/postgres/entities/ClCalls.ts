import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClParticipants } from './ClParticipants';
import { ClSegments } from './ClSegments';

@Entity('cl_calls', { schema: 'public' })
export class ClCalls {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('timestamp with time zone', { name: 'start_time' })
  startTime: Date;

  @Column('timestamp with time zone', { name: 'end_time' })
  endTime: Date;

  @Column('boolean', { name: 'is_answered' })
  isAnswered: boolean;

  @Column('interval', { name: 'ringing_dur', nullable: true })
  ringingDur: any | null;

  @Column('interval', { name: 'talking_dur', nullable: true })
  talkingDur: any | null;

  @Column('interval', { name: 'q_wait_dur', nullable: true })
  qWaitDur: any | null;
}
