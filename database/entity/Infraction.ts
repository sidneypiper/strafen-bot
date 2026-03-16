import type {Penalty} from "./Penalty"

export interface Infraction {
    id: string
    user_id: string
    guild_id: string
    penalty_id: string
    created_on: string
    penalty?: Penalty
}
