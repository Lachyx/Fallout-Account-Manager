document.getElementById('import-btn').addEventListener('click', function() {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = function(e) {
            window.electronAPI.SaveFile(file.name, e.target.result);
        };
        reader.readAsText(file);
    } else {
        alert('Please select a valid JSON file.');
    }
});
