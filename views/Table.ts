import {Colors} from '../core/Colors'

interface TableData {
    headers: string[]
    rows: { [key: string]: any }[]
}

function h(type: string, props: Record<string, any> | null, ...children: any[]): any {
    return {type, props: {...props, children: children.length === 1 ? children[0] : children}}
}

// Name 28%, Description 54%, Price 18%
const COL_WIDTHS = ['28%', '54%', '18%']

export default function Table(props: TableData): any {
    return h('div', {
        style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '12px',
        }
    },
        // Outer card
        h('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                backgroundColor: Colors.chatBackground,
                borderRadius: '12px',
                border: `1px solid ${Colors.coolSteel}22`,
                overflow: 'hidden',
            }
        },
            // Header row
            h('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    padding: '0 8px',
                    borderBottom: `1px solid ${Colors.coolSteel}33`,
                }
            },
                ...props.headers.map((header, i) =>
                    h('div', {
                        style: {
                            display: 'flex',
                            width: COL_WIDTHS[i],
                            padding: '16px 20px',
                            color: Colors.coolSteel,
                            fontSize: '22px',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase' as const,
                        }
                    }, header)
                )
            ),
            // Data rows
            ...props.rows.map((row, i) =>
                h('div', {
                    style: {
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        padding: '0 8px',
                        borderBottom: i < props.rows.length - 1 ? `1px solid ${Colors.coolSteel}22` : 'none',
                    }
                },
                    ...Object.keys(row).map((key, j) =>
                        h('div', {
                            style: {
                                display: 'flex',
                                width: COL_WIDTHS[j],
                                padding: '20px',
                                color: j === 0 ? Colors.white : Colors.coolSteel,
                                fontSize: '28px',
                                fontWeight: j === 0 ? 400 : 400,
                                overflowWrap: 'break-word',
                            }
                        }, String(row[key]))
                    )
                )
            )
        )
    )
}
