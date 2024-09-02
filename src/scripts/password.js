document.addEventListener('DOMContentLoaded', function () {
    const passwordSpan = document.getElementById('password');
    const togglePasswordIcon = document.getElementById('toggle-password');
    const copyPasswordIcon = document.getElementById('copy-password');

    togglePasswordIcon.addEventListener('click', function () {
        const isPasswordVisible = passwordSpan.textContent !== '********';
        if (isPasswordVisible) {
            passwordSpan.textContent = '********';
            togglePasswordIcon.classList.remove('fa-eye-slash');
            togglePasswordIcon.classList.add('fa-eye');
        } else {
            passwordSpan.textContent = 'N/A';
            togglePasswordIcon.classList.remove('fa-eye');
            togglePasswordIcon.classList.add('fa-eye-slash');
        }
    });

    copyPasswordIcon.addEventListener('click', function () {
        const passwordText = passwordSpan.textContent === '********' ? 'N/A' : passwordSpan.textContent;
        navigator.clipboard.writeText(passwordText).then(() => {
            alert('Password copied to clipboard!');
        }, (err) => {
            console.error('Failed to copy password: ', err);
        });
    });
});
