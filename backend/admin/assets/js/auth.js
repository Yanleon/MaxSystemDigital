document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const error = document.getElementById('error');

    error.textContent = '';

    try {
        const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
            ? window.location.pathname.split('/backend/admin/')[0]
            : '';
        const apiLogin = `${window.location.origin}${baseFromAdmin}/backend/public/login`;

        const response = await fetch(apiLogin, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const raw = await response.text();
        let data = {};
        try {
            data = raw ? JSON.parse(raw) : {};
        } catch (parseErr) {
            data = { error: raw || 'Respuesta no JSON del servidor' };
        }

        if (!response.ok) {
            error.textContent = data.error || `Error HTTP ${response.status}`;
            return;
        }

        // Login correcto
        window.location.href = 'dashboard.html';

    } catch (err) {
        error.textContent = `Error de conexión: ${err.message || 'servidor no disponible'}`;
    }
});
