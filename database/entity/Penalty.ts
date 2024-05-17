import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { Infraction } from "./Infraction"

@Entity()
export class Penalty {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    name: string

    @Column()
    description: string

    @Column({ type: 'float', precision: 2 })
    price: number
    
    @Column()
    guild_id: string

    @OneToMany(() => Infraction, infraction => infraction.penalty)
    infractions: Infraction[]

    @CreateDateColumn()
    created_on: Date
}

