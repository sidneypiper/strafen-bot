import {Colors} from '../core/Colors'
import {renderToBuffer} from './render'

export interface LeaderboardEntry {
    userId: string
    displayName: string
    avatarUrl: string | null
    totalFines: number
    count: number
}

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

const MEDAL_COLORS = ['#C9B037', '#B4B4B4', '#AD8A56'] // gold, silver, bronze
const MEDAL_LABELS = ['#1', '#2', '#3']
const PODIUM_HEIGHTS = ['160px', '120px', '100px']
const PODIUM_ORDER = [1, 0, 2] // silver, gold, bronze (visual left-to-right)

function PodiumCard(entry: LeaderboardEntry, rank: number, avatarData: string | null): any {
    const medalColor = MEDAL_COLORS[rank]
    const isFirst = rank === 0

    return h('div', {
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '220px',
            marginTop: isFirst ? '0' : rank === 1 ? '40px' : '60px',
        }
    },
        // Avatar
        h('div', {
            style: {
                display: 'flex',
                width: isFirst ? '110px' : '90px',
                height: isFirst ? '110px' : '90px',
                borderRadius: '50%',
                border: `3px solid ${medalColor}`,
                overflow: 'hidden',
                marginBottom: '10px',
                backgroundColor: Colors.jetBlack,
            }
        },
            avatarData
                ? h('img', {src: avatarData, width: isFirst ? 110 : 90, height: isFirst ? 110 : 90, style: {borderRadius: '50%'}})
                : h('div', {style: {display: 'flex', width: '100%', height: '100%', backgroundColor: Colors.cornflowerBlue, alignItems: 'center', justifyContent: 'center'}},
                    h('span', {style: {color: Colors.white, fontSize: '36px', fontWeight: 700}}, entry.displayName[0].toUpperCase())
                )
        ),
        // Medal label
        h('div', {style: {display: 'flex', backgroundColor: medalColor, borderRadius: '999px', padding: '4px 14px', marginBottom: '8px'}},
            h('span', {style: {color: Colors.shadowGrey, fontSize: '20px', fontWeight: 700}}, MEDAL_LABELS[rank])
        ),
        // Name
        h('span', {style: {color: Colors.white, fontSize: isFirst ? '26px' : '22px', fontWeight: 700, textAlign: 'center', overflowWrap: 'break-word', maxWidth: '200px'}}, entry.displayName),
        // Total
        h('span', {style: {color: medalColor, fontSize: '22px', fontWeight: 700, marginTop: '4px'}}, `${entry.totalFines.toFixed(2)}€`),
        h('span', {style: {color: Colors.coolSteel, fontSize: '18px'}}, `${entry.count} infraction${entry.count !== 1 ? 's' : ''}`)
    )
}

function RestRow(entry: LeaderboardEntry, rank: number, isLast: boolean): any {
    return h('div', {
        style: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '14px 20px',
            borderBottom: isLast ? 'none' : `1px solid ${Colors.coolSteel}22`,
        }
    },
        // Rank number
        h('span', {style: {color: Colors.coolSteel, fontSize: '22px', fontWeight: 700, width: '40px'}}, `#${rank + 1}`),
        // Name
        h('span', {style: {color: Colors.white, fontSize: '24px', fontWeight: 400, flex: 1, overflowWrap: 'break-word'}}, entry.displayName),
        // Count
        h('span', {style: {color: Colors.coolSteel, fontSize: '22px', marginRight: '24px'}}, `${entry.count} infraction${entry.count !== 1 ? 's' : ''}`),
        // Total
        h('span', {style: {color: Colors.cornflowerBlue, fontSize: '22px', fontWeight: 700, width: '90px', textAlign: 'right'}}, `${entry.totalFines.toFixed(2)}€`)
    )
}

export async function genLeaderboardImage(entries: LeaderboardEntry[]): Promise<Buffer> {
    if (entries.length === 0) {
        const empty = h('div', {style: {display: 'flex', padding: '40px', width: '100%', alignItems: 'center', justifyContent: 'center'}},
            h('span', {style: {color: Colors.coolSteel, fontSize: '28px'}}, 'No fines recorded yet.')
        )
        return renderToBuffer(empty, 700)
    }

    const top3 = entries.slice(0, 3)
    const rest = entries.slice(3)

    // Fetch avatars for top 3 in parallel
    const avatars = await Promise.all(top3.map(e => fetchAvatarBase64(e.avatarUrl)))

    // Podium section — visually ordered silver/gold/bronze
    const podiumSection = h('div', {
        style: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-end',
            padding: '32px 32px 24px',
            gap: '24px',
        }
    },
        ...PODIUM_ORDER
            .filter(i => i < top3.length)
            .map(i => PodiumCard(top3[i], i, avatars[i]))
    )

    // Rest table
    const restSection = rest.length > 0
        ? h('div', {style: {display: 'flex', padding: '0 16px 16px'}},
            h('div', {style: {display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: Colors.chatBackground, borderRadius: '12px', border: `1px solid ${Colors.coolSteel}22`, overflow: 'hidden'}},
                ...rest.map((e, i) => RestRow(e, i + 3, i === rest.length - 1))
            )
          )
        : null

    const totalFines = entries.reduce((sum, e) => sum + e.totalFines, 0)
    const totalCount = entries.reduce((sum, e) => sum + e.count, 0)
    const dot = () => h('span', {style: {color: Colors.coolSteel, fontSize: '20px', margin: '0 12px'}}, '·')
    const summarySection = h('div', {
        style: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px 32px 24px',
        }
    },
        h('span', {style: {color: Colors.white, fontSize: '20px', fontWeight: 700}}, `${entries.length}`),
        h('span', {style: {color: Colors.coolSteel, fontSize: '20px', marginLeft: '6px'}}, 'members'),
        dot(),
        h('span', {style: {color: Colors.white, fontSize: '20px', fontWeight: 700}}, `${totalCount}`),
        h('span', {style: {color: Colors.coolSteel, fontSize: '20px', marginLeft: '6px'}}, `infraction${totalCount !== 1 ? 's' : ''}`),
        dot(),
        h('span', {style: {color: Colors.cornflowerBlue, fontSize: '20px', fontWeight: 700}}, `${totalFines.toFixed(2)}€`),
        h('span', {style: {color: Colors.coolSteel, fontSize: '20px', marginLeft: '6px'}}, 'total'),
    )

    const root = h('div', {style: {display: 'flex', flexDirection: 'column', width: '100%', backgroundColor: Colors.shadowGrey}},
        podiumSection,
        ...(restSection ? [restSection] : []),
        summarySection,
    )

    return renderToBuffer(root, 860)
}
