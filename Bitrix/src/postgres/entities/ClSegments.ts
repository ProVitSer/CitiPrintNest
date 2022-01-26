import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClParticipants } from './ClParticipants';
import { ClCalls } from './ClCalls';

@Entity('cl_segments', { schema: 'public' })
export class ClSegments {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'call_id' })
  callId: number;

  @Column('integer', { name: 'seq_order' })
  seqOrder: number;

  @Column('integer', { name: 'seq_group' })
  seqGroup: number;

  @Column('integer', { name: 'src_part_id' })
  srcPartId: number;

  @Column('integer', { name: 'dst_part_id' })
  dstPartId: number;

  @Column('timestamp with time zone', { name: 'start_time' })
  startTime: Date;

  @Column('timestamp with time zone', { name: 'end_time' })
  endTime: Date;

  @Column('integer', { name: 'type' })
  type: number;

  @Column('integer', { name: 'action_id' })
  actionId: number;

  @Column('integer', { name: 'action_party_id', nullable: true })
  actionPartyId: number | null;
}
