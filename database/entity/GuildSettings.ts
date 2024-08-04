import {Column, CreateDateColumn, Entity, PrimaryColumn} from "typeorm"

@Entity()
export class GuildSettings {

    @PrimaryColumn()
    id: string

    @Column()
    currency: string

    @CreateDateColumn()
    created_on: Date
}