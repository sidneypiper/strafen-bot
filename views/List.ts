import satori from "satori"
import {Resvg} from "@resvg/resvg-js"
import Table from "./Table"

interface PenaltyRow {
    name: string
    description: string
    price: number
}

export default async function genImageOfList(penalties: PenaltyRow[]): Promise<Buffer> {
    const headers = ['Name', 'Description', 'Price']
    const rows = penalties.map(p => ({
        name: p.name,
        description: p.description,
        price: p.price
    }))

    const element = Table({headers, rows})

    const svg = await satori(element as any, {
        width: 1600,
        height: Math.max(200, 96 + rows.length * 96 + 48 * 2),
        fonts: [],
    })

    const resvg = new Resvg(svg)
    const pngData = resvg.render()
    return Buffer.from(pngData.asPng())
}
