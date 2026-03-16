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

const WIDTH = 900
const MAX_HEIGHT = 16000

export default async function genImageOfList(penalties: PenaltyRow[]): Promise<Buffer> {
    const headers = ['Name', 'Description', 'Price']
    const rows = penalties.length > 0
        ? penalties.map(p => ({name: p.name, description: p.description, price: p.price}))
        : [{name: 'No penalties', description: '-', price: 0}]

    const element = Table({headers, rows})

    // Render at generous height first
    const svg = await satori(element as any, {
        width: WIDTH,
        height: MAX_HEIGHT,
        fonts: [{
            name: 'Inter',
            data: new Uint8Array(interFont).buffer,
            weight: 400,
            style: 'normal',
        }],
    })

    // Use innerBBox to find the real content height, then crop
    const resvg = new Resvg(svg)
    const bbox = resvg.innerBBox()
    const contentHeight = Math.ceil((bbox?.y ?? 0) + (bbox?.height ?? MAX_HEIGHT)) + 48

    const croppedSvg = await satori(element as any, {
        width: WIDTH,
        height: contentHeight,
        fonts: [{
            name: 'Inter',
            data: new Uint8Array(interFont).buffer,
            weight: 400,
            style: 'normal',
        }],
    })

    const pngData = new Resvg(croppedSvg).render()
    return Buffer.from(pngData.asPng())
}
