import satori from "satori"
import {Resvg} from "@resvg/resvg-js"
import {readFileSync} from "fs"
import {join} from "path"
import Table from "./Table"

const interRegular = readFileSync(join(import.meta.dir, "../assets/Inter-Regular.ttf"))
const interBold = readFileSync(join(import.meta.dir, "../assets/Inter-Bold.ttf"))

interface PenaltyRow {
    name: string
    description: string
    price: number
}

// 2560:1799 ratio ≈ 10:7, scaled down
const WIDTH = 1280
const MAX_HEIGHT = 16000

const FONTS = [
    {name: 'Inter', data: new Uint8Array(interRegular).buffer, weight: 400 as const, style: 'normal' as const},
    {name: 'Inter', data: new Uint8Array(interBold).buffer, weight: 700 as const, style: 'normal' as const},
]

export default async function genImageOfList(penalties: PenaltyRow[]): Promise<Buffer> {
    const headers = ['Name', 'Description', 'Price']
    const rows = penalties.length > 0
        ? penalties.map(p => ({name: p.name, description: p.description, price: p.price}))
        : [{name: 'No penalties', description: '-', price: 0}]

    const element = Table({headers, rows})

    // Render at generous height first to measure real content height
    const svg = await satori(element as any, {width: WIDTH, height: MAX_HEIGHT, fonts: FONTS})

    const bbox = new Resvg(svg).innerBBox()
    const contentHeight = Math.ceil((bbox?.y ?? 0) + (bbox?.height ?? MAX_HEIGHT)) + 48

    const croppedSvg = await satori(element as any, {width: WIDTH, height: contentHeight, fonts: FONTS})

    const pngData = new Resvg(croppedSvg, {background: 'rgba(0,0,0,0)'}).render()
    return Buffer.from(pngData.asPng())
}
