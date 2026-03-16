import {mkdirSync, appendFileSync} from 'fs'
import {join} from 'path'

const LOG_DIR = join(import.meta.dir, '../storage/logs')
mkdirSync(LOG_DIR, {recursive: true})

function logFilePath(): string {
    const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    return join(LOG_DIR, `strafenbot-${date}.log`)
}

function timestamp(): string {
    return new Date().toISOString().replace('T', ' ').slice(0, 23)
}

function formatArgs(args: any[]): string {
    return args.map(a => typeof a === 'string' ? a : JSON.stringify(a, null, 2)).join(' ')
}

function write(level: string, args: any[]) {
    const line = `[${timestamp()}] [${level}] ${formatArgs(args)}\n`
    process.stdout.write(line)
    appendFileSync(logFilePath(), line)
}

const _error = console.error.bind(console)

console.log   = (...args) => write('INFO ', args)
console.info  = (...args) => write('INFO ', args)
console.warn  = (...args) => write('WARN ', args)
console.error = (...args) => write('ERROR', args)

process.on('uncaughtException', (err) => {
    write('FATAL', [`Uncaught exception: ${err.stack ?? err}`])
    process.exit(1)
})

process.on('unhandledRejection', (reason) => {
    write('FATAL', [`Unhandled rejection: ${reason instanceof Error ? reason.stack : reason}`])
})

export {}
