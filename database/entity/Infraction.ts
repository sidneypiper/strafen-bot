import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { Penalty } from "./Penalty"

@Entity()
export class Infraction {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    user_id: string

    @Column()
    guild_id: string

    @ManyToOne(() => Penalty, penalty => penalty.infractions)
    penalty: Penalty

    @CreateDateColumn()
    created_on: Date
}

