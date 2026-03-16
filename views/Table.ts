interface TableData {
    headers: string[]
    rows: { [key: string]: any }[]
}

function h(type: string, props: Record<string, any> | null, ...children: any[]): any {
    return {type, props: {...props, children: children.length === 1 ? children[0] : children}}
}

// Name 25%, Description 55%, Price 20%
const COL_WIDTHS = ['25%', '55%', '20%']

export default function Table(props: TableData): any {
    return h('div', {
        style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            padding: '24px',
            backgroundColor: '#1f2937',
        }
    },
        // Header row
        h('div', {
            style: {
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                backgroundColor: '#374151',
                borderRadius: '12px',
                marginBottom: '8px',
            }
        },
            ...props.headers.map((header, i) =>
                h('div', {
                    style: {
                        display: 'flex',
                        width: COL_WIDTHS[i] ?? `${100 / props.headers.length}%`,
                        padding: '14px 24px',
                        color: '#9ca3af',
                        fontSize: '28px',
                        fontWeight: 700,
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
                    borderBottom: i < props.rows.length - 1 ? '4px solid #374151' : 'none',
                }
            },
                ...Object.keys(row).map((key, j) =>
                    h('div', {
                        style: {
                            display: 'flex',
                            width: COL_WIDTHS[j] ?? `${100 / props.headers.length}%`,
                            padding: '14px 24px',
                            color: '#ffffff',
                            fontSize: '28px',
                            fontWeight: j === 0 ? 500 : 400,
                        }
                    }, String(row[key]))
                )
            )
        )
    )
}
