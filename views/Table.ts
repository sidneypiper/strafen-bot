interface TableData {
    headers: string[]
    rows: { [key: string]: any }[]
}

function h(type: string, props: Record<string, any> | null, ...children: any[]): any {
    return {type, props: {...props, children: children.length === 1 ? children[0] : children}}
}

export default function Table(props: TableData): any {
    return h('div', {
        style: {
            display: 'flex',
            flexDirection: 'column',
            padding: '48px',
            backgroundColor: '#1f2937',
            borderRadius: '16px',
        }
    },
        // Header row
        h('div', {
            style: {
                display: 'flex',
                flexDirection: 'row',
                backgroundColor: '#374151',
                borderRadius: '24px',
                marginBottom: '8px',
            }
        },
            ...props.headers.map(header =>
                h('div', {
                    style: {
                        display: 'flex',
                        flex: 1,
                        padding: '24px 48px',
                        color: '#9ca3af',
                        fontSize: '48px',
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
                    borderBottom: i < props.rows.length - 1 ? '4px solid #374151' : 'none',
                }
            },
                ...Object.keys(row).map((key, j) =>
                    h('div', {
                        style: {
                            display: 'flex',
                            flex: 1,
                            padding: '24px 48px',
                            color: '#ffffff',
                            fontSize: '48px',
                            fontWeight: j === 0 ? 500 : 400,
                        }
                    }, String(row[key]))
                )
            )
        )
    )
}
