import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClParticipants } from './ClParticipants';

@Entity('cl_party_info', { schema: 'public' })
export class ClPartyInfo {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('integer', { name: 'dn_type', nullable: true })
  dnType: number | null;

  @Column('character varying', { name: 'dn', nullable: true, length: 255 })
  dn: string | null;

  @Column('character varying', {
    name: 'caller_number',
    nullable: true,
    length: 255,
  })
  callerNumber: string | null;

  @Column('character varying', {
    name: 'display_name',
    nullable: true,
    length: 255,
  })
  displayName: string | null;

  @Column('integer', { name: 'dn_class', default: () => '0' })
  dnClass: number;

  @Column('character varying', {
    name: 'firstlastname',
    nullable: true,
    length: 255,
  })
  firstlastname: string | null;

  @Column('character varying', {
    name: 'did_number',
    nullable: true,
    length: 255,
    default: () => 'NULL::character varying',
  })
  didNumber: string | null;
}
