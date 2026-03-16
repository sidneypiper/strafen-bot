import satori from "satori"
import {Resvg} from "@resvg/resvg-js"
import {readFileSync} from "fs"
import {join} from "path"

const interRegular = readFileSync(join(import.meta.dir, "../assets/Inter-Regular.ttf"))
const interBold = readFileSync(join(import.meta.dir, "../assets/Inter-Bold.ttf"))

export const FONTS = [
    {name: 'Inter', data: new Uint8Array(interRegular).buffer, weight: 400 as const, style: 'normal' as const},
    {name: 'Inter', data: new Uint8Array(interBold).buffer, weight: 700 as const, style: 'normal' as const},
]

const MAX_HEIGHT = 16000

export async function renderToBuffer(element: any, width: number): Promise<Buffer> {
    // First pass: measure real content height
    const svg = await satori(element, {width, height: MAX_HEIGHT, fonts: FONTS})
    const bbox = new Resvg(svg).innerBBox()
    const contentHeight = Math.ceil((bbox?.y ?? 0) + (bbox?.height ?? MAX_HEIGHT)) + 48

    // Second pass: render at exact height
    const croppedSvg = await satori(element, {width, height: contentHeight, fonts: FONTS})
    const pngData = new Resvg(croppedSvg, {background: 'rgba(0,0,0,0)'}).render()
    return Buffer.from(pngData.asPng())
}
