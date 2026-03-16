import {Colors} from '../core/Colors'
import {renderToBuffer} from './render'
import Table from './Table'

function h(type: string, props: Record<string, any> | null, ...children: any[]): any {
    return {type, props: {...props, children: children.length === 1 ? children[0] : children}}
}

async function fetchAvatarBase64(url: string | null): Promise<string | null> {
    if (!url) return null
    try {
        const res = await fetch(url + '?size=128')
        const buf = await res.arrayBuffer()
        const mime = res.headers.get('content-type') ?? 'image/png'
        return `data:${mime};base64,${Buffer.from(buf).toString('base64')}`
    } catch {
        return null
    }
}

export interface UserStatRow {
    penaltyName: string
    count: number
    total: number
}

export async function genUserStatsImage(
    displayName: string,
    avatarUrl: string | null,
    totalFines: number,
    stats: UserStatRow[]
): Promise<Buffer> {
    const avatarData = await fetchAvatarBase64(avatarUrl)

    const header = h('div', {
        style: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '20px 24px 16px',
            gap: '20px',
        }
    },
        // Avatar
        h('div', {style: {display: 'flex', width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${Colors.cornflowerBlue}`, backgroundColor: Colors.jetBlack}},
            avatarData
                ? h('img', {src: avatarData, width: 72, height: 72, style: {borderRadius: '50%'}})
                : h('div', {style: {display: 'flex', width: '100%', height: '100%', backgroundColor: Colors.cornflowerBlue, alignItems: 'center', justifyContent: 'center'}},
                    h('span', {style: {color: Colors.white, fontSize: '28px', fontWeight: 700}}, displayName[0].toUpperCase())
                  )
        ),
        // Name + total
        h('div', {style: {display: 'flex', flexDirection: 'column'}},
            h('span', {style: {color: Colors.white, fontSize: '32px', fontWeight: 700}}, displayName),
            h('span', {style: {color: Colors.cornflowerBlue, fontSize: '24px', fontWeight: 700}}, `Total: ${totalFines.toFixed(2)}€`)
        )
    )

    const rows = stats.length > 0
        ? stats.map(s => ({penalty: s.penaltyName, count: `${s.count}x`, total: `${s.total.toFixed(2)}€`}))
        : [{penalty: 'No infractions', count: '-', total: '-'}]

    const table = Table({headers: ['Penalty', 'Count', 'Total'], rows, colWidths: ['60%', '20%', '20%']})

    const root = h('div', {style: {display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: Colors.chatBackground}},
        header,
        h('div', {style: {display: 'flex', flexDirection: 'column', padding: '8px 12px 12px'}},
            h('div', {style: {display: 'flex', flexDirection: 'column', width: '100%', borderRadius: '12px', border: `1px solid ${Colors.coolSteel}22`, overflow: 'hidden'}},
                table
            )
        )
    )

    return renderToBuffer(root, 800)
}
