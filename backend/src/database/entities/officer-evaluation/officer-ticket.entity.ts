import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('officer_ticket_tb')
export class OfficerTicketEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'bigint' })
  member_id: number;

  @Column({ type: 'int', default: 0 })
  ticket_count: number;
}
