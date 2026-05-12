document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
        ? window.location.pathname.split('/backend/admin/')[0]
        : '';
    const apiLogin = `${window.location.origin}${baseFromAdmin}/backend/public/login`;

    fetch(apiLogin, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'OK') {
            window.location.href = 'dashboard.html';
        } else {
            alert(data.error);
        }
    })
    .catch(() => alert('Error de conexión con el servidor'));
});
