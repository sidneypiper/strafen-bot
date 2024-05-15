import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm"
import { Penalty } from "./Penalty"

@Entity()
export class Guild {

    @PrimaryColumn()
    id: string

    @Column()
    currency: string
    
    @OneToMany(() => Penalty, penalty => penalty.guild)
    penalties: Penalty[]

}
