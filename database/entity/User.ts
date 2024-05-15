import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm"
import { Penalty } from "./Penalty"

@Entity()
export class User {

    @PrimaryColumn()
    id: string

    @Column()
    username: string

    @Column()
    name: string

    @OneToMany(() => Penalty, penalty => penalty.user)
    penalties: Penalty[]

}
