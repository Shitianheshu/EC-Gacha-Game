import './forcecolors'
import ansis from 'ansis'

type LogFunc = (...data: any[]) => void
type LogLevel = 'info' | 'warn' | 'error'

let originalLogFunc: LogFunc = null
let originalInfoFunc: LogFunc = null
let originalWarnFunc: LogFunc = null
let originalErrorFunc: LogFunc = null

export function hookConsole() {
    if (isHooked()) {
        throw new Error('Console is already hooked')
    }

    originalLogFunc = console.log
    originalInfoFunc = console.info
    originalWarnFunc = console.warn
    originalErrorFunc = console.error

    console.log = (...data: any[]) => log('info', originalLogFunc, ...data)
    console.info = (...data: any[]) => log('info', originalInfoFunc, ...data)
    console.warn = (...data: any[]) => log('warn', originalWarnFunc, ...data)
    console.error = (...data: any[]) => log('error', originalErrorFunc, ...data)
}

export function unhookConsole() {
    if (!isHooked()) {
        throw new Error('Console is not hooked')
    }

    console.log = originalLogFunc
    console.info = originalInfoFunc
    console.warn = originalWarnFunc
    console.error = originalErrorFunc

    originalLogFunc = null
    originalInfoFunc = null
    originalWarnFunc = null
    originalErrorFunc = null
}

function isHooked() {
    return (
        originalLogFunc !== null || originalInfoFunc !== null || originalWarnFunc !== null || originalErrorFunc !== null
    )
}

function log(level: LogLevel, func: LogFunc, ...data: any[]) {
    const date = new Date()
    const pad = (num: number) => String(num).padStart(2, '0')
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`

    let levelText: string

    switch (level) {
        case 'info':
            levelText = ansis.cyanBright('info')
            break
        case 'warn':
            levelText = ansis.yellowBright('warn')
            break
        case 'error':
            levelText = ansis.redBright('error')
            break
        default:
            levelText = ansis.white('log')
            break
    }

    func(ansis.gray(time), ansis.bold(levelText), ...data)
}
