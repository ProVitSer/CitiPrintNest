import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("callcent_queuecalls", { schema: "public" })
export class CallcentQueuecalls {
  @PrimaryGeneratedColumn({ type: "integer", name: "idcallcent_queuecalls" })
  idcallcentQueuecalls: number;

  @Column("character varying", { name: "q_num", nullable: true, length: 255 })
  qNum: string | null;

  @Column("timestamp without time zone", { name: "time_start" })
  timeStart: Date;

  @Column("timestamp without time zone", { name: "time_end" })
  timeEnd: Date;

  @Column("interval", {
    name: "ts_waiting",
    nullable: true,
    default: () => "'00:00:00'",
  })
  tsWaiting: any | null;

  @Column("interval", {
    name: "ts_polling",
    nullable: true,
    default: () => "'00:00:00'",
  })
  tsPolling: any | null;

  @Column("interval", {
    name: "ts_servicing",
    nullable: true,
    default: () => "'00:00:00'",
  })
  tsServicing: any | null;

  @Column("interval", {
    name: "ts_locating",
    nullable: true,
    default: () => "'00:00:00'",
  })
  tsLocating: any | null;

  @Column("integer", { name: "count_polls" })
  countPolls: number;

  @Column("integer", { name: "count_dialed" })
  countDialed: number;

  @Column("integer", { name: "count_rejected" })
  countRejected: number;

  @Column("integer", { name: "count_dials_timed" })
  countDialsTimed: number;

  @Column("integer", { name: "reason_noanswercode" })
  reasonNoanswercode: number;

  @Column("integer", { name: "reason_failcode" })
  reasonFailcode: number;

  @Column("character varying", {
    name: "reason_noanswerdesc",
    nullable: true,
    length: 255,
    default: () => "''",
  })
  reasonNoanswerdesc: string | null;

  @Column("character varying", {
    name: "reason_faildesc",
    nullable: true,
    length: 255,
    default: () => "''",
  })
  reasonFaildesc: string | null;

  @Column("character varying", {
    name: "call_history_id",
    nullable: true,
    length: 255,
  })
  callHistoryId: string | null;

  @Column("character varying", {
    name: "q_cal",
    nullable: true,
    length: 255,
    default: () => "''",
  })
  qCal: string | null;

  @Column("character varying", {
    name: "from_userpart",
    nullable: true,
    length: 255,
    default: () => "''",
  })
  fromUserpart: string | null;

  @Column("character varying", {
    name: "from_displayname",
    nullable: true,
    length: 255,
    default: () => "''",
  })
  fromDisplayname: string | null;

  @Column("character varying", {
    name: "to_dialednum",
    nullable: true,
    length: 255,
    default: () => "''",
  })
  toDialednum: string | null;

  @Column("character varying", {
    name: "to_dn",
    nullable: true,
    length: 255,
    default: () => "''",
  })
  toDn: string | null;

  @Column("integer", { name: "to_dntype" })
  toDntype: number;

  @Column("character varying", {
    name: "cb_num",
    nullable: true,
    length: 255,
    default: () => "''",
  })
  cbNum: string | null;

  @Column("text", { name: "call_result", nullable: true, default: () => "''" })
  callResult: string | null;

  @Column("integer", { name: "deal_status", default: () => "0" })
  dealStatus: number;

  @Column("boolean", { name: "is_visible", default: () => "true" })
  isVisible: boolean;

  @Column("boolean", { name: "is_agent", default: () => "true" })
  isAgent: boolean;
}
