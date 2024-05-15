import { Entity, Column, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { User } from "./User"
import { Guild } from "./Guild"

@Entity()
export class Penalty {

    @PrimaryGeneratedColumn('uuid')
    id: string
    
    @ManyToOne(() => User, user => user.penalties)
    user: User

    @ManyToOne(() => Guild, guild => guild.penalties)
    guild: Guild

    @CreateDateColumn()

    @UpdateDateColumn()
}

