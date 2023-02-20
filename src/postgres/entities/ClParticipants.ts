import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClCalls } from './ClCalls';
import { ClPartyInfo } from './ClPartyInfo';
import { ClSegments } from './ClSegments';


@Entity('cl_participants', { schema: 'public' })
export class ClParticipants {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'call_id' })
  callId: number;

  @Column('integer', { name: 'info_id' })
  infoId: number;

  @Column('integer', { name: 'role', nullable: true, default: () => '1' })
  role: number | null;

  @Column('boolean', {
    name: 'is_inbound',
    nullable: true,
    default: () => 'false',
  })
  isInbound: boolean | null;

  @Column('integer', { name: 'end_status', default: () => '0' })
  endStatus: number;

  @Column('integer', { name: 'forward_reason', nullable: true })
  forwardReason: number | null;

  @Column('integer', { name: 'failure_reason', nullable: true })
  failureReason: number | null;

  @Column('timestamp with time zone', { name: 'start_time', nullable: true })
  startTime: Date | null;

  @Column('timestamp with time zone', { name: 'answer_time', nullable: true })
  answerTime: Date | null;

  @Column('timestamp with time zone', { name: 'end_time', nullable: true })
  endTime: Date | null;

  @Column('character varying', {
    name: 'billing_code',
    nullable: true,
    length: 20,
  })
  billingCode: string | null;

  @Column('character varying', {
    name: 'billing_ratename',
    nullable: true,
    length: 255,
  })
  billingRatename: string | null;

  @Column('numeric', { name: 'billing_rate', nullable: true })
  billingRate: string | null;

  @Column('numeric', { name: 'billing_cost', nullable: true })
  billingCost: string | null;

  @Column('interval', { name: 'billing_duration', nullable: true })
  billingDuration: any | null;

  @Column('character varying', {
    name: 'recording_url',
    nullable: true,
    length: 511,
  })
  recordingUrl: string | null;

  @Column('character varying', {
    name: 'billing_group',
    nullable: true,
    length: 255,
  })
  billingGroup: string | null;
}
