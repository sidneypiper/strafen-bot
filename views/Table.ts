import {Colors} from '../core/Colors'

interface TableData {
    headers: string[]
    rows: { [key: string]: any }[]
    colWidths?: string[]
    colColors?: (string | undefined)[]
    boldLastCol?: boolean
}

function h(type: string, props: Record<string, any> | null, ...children: any[]): any {
    return {type, props: {...props, children: children.length === 1 ? children[0] : children}}
}

// Default: Name 28%, Description 54%, Price 18%
const DEFAULT_COL_WIDTHS = ['28%', '54%', '18%']

export default function Table(props: TableData): any {
    const COL_WIDTHS = props.colWidths ?? DEFAULT_COL_WIDTHS
    const COL_COLORS = props.colColors ?? []
    return h('div', {
        style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
        }
    },
        h('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
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
                                color: COL_COLORS[j] ?? (j === 0 ? Colors.white : Colors.coolSteel),
                                fontSize: '28px',
                                fontWeight: (props.boldLastCol && j === Object.keys(row).length - 1) ? 700 : (j === 0 ? 400 : 400),
                                overflowWrap: 'break-word',
                            }
                        }, String(row[key]))
                    )
                )
            )
        )
    )
}
