import {Colors} from '../core/Colors'
import {renderToBuffer} from "./render"
import Table from "./Table"

function h(type: string, props: Record<string, any> | null, ...children: any[]): any {
    return {type, props: {...props, children: children.length === 1 ? children[0] : children}}
}

interface PenaltyRow {
    name: string
    description: string
    price: number
}

export default async function genImageOfList(penalties: PenaltyRow[]): Promise<Buffer> {
    const rows = penalties.length > 0
        ? penalties.map(p => ({name: p.name, description: p.description, price: `${p.price}€`}))
        : [{name: 'No penalties', description: '-', price: '-'}]

    const header = h('div', {style: {display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '20px 24px 16px'}},
        h('span', {style: {color: Colors.white, fontSize: '32px', fontWeight: 700}}, 'All Infractions')
    )

    const root = h('div', {style: {display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: Colors.chatBackground}},
        header,
        h('div', {style: {display: 'flex', flexDirection: 'column', padding: '8px 12px 12px'}},
            h('div', {style: {display: 'flex', flexDirection: 'column', width: '100%', borderRadius: '12px', border: `1px solid ${Colors.coolSteel}22`, overflow: 'hidden'}},
                Table({headers: ['Name', 'Description', 'Price'], rows, colWidths: ['30%', '61%', '9%'], colColors: [undefined, undefined, Colors.cornflowerBlue], boldLastCol: true})
            )
        )
    )

    return renderToBuffer(root, 1280)
}
