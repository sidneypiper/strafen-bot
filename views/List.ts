import satori from "satori"
import {Resvg} from "@resvg/resvg-js"
import {readFileSync} from "fs"
import {join} from "path"
import Table from "./Table"

const interFont = readFileSync(join(import.meta.dir, "../assets/Inter-Regular.ttf"))

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
        fonts: [{
            name: 'Inter',
            data: interFont,
            weight: 400,
            style: 'normal',
        }],
    })

    const resvg = new Resvg(svg)
    const pngData = resvg.render()
    return Buffer.from(pngData.asPng())
}
