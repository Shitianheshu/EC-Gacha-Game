export async function minimizeWindow() {
    await window.electron.ipc.invoke('window/minimize')
}

export async function maximizeWindow() {
    await window.electron.ipc.invoke('window/maximize')
}

export async function closeWindow() {
    await window.electron.ipc.invoke('window/close')
}
