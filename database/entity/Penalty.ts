export interface Penalty {
    id: string
    name: string
    description: string
    price: number
    guild_id: string
    cashed_out_on: string | null
    created_on: string
}
