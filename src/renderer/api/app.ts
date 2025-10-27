export async function getAppTitleBar() {
    return window.electron.ipc.invoke<string>('app/titlebar')
}
