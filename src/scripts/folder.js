document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('Folder').addEventListener('click', (event) => {
        event.preventDefault();
        window.electronAPI.FolderOpen()
    });
});