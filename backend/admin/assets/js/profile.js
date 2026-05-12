const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;
const profileMsg = document.getElementById('profileMsg');
let currentUserId = null;

function setMsg(text, isError = false) {
    profileMsg.textContent = text;
    profileMsg.className = isError ? 'error' : 'success';
}

async function loadMe() {
    try {
        const res = await fetch(`${API}/me`);
        if (!res.ok) {
            window.location.href = 'login.html';
            return;
        }
        const data = await res.json();
        const u = data.user;
        currentUserId = u.id;
        document.getElementById('profileName').value = u.name || '';
        document.getElementById('profileEmail').value = u.email || '';
    } catch (err) {
        setMsg('No se pudo cargar el perfil', true);
    }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUserId) return;
    setMsg('');
    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const password = document.getElementById('profilePass').value.trim();

    if (!name || !email) {
        setMsg('Nombre y email son requeridos', true);
        return;
    }

    const payload = { name, email };
    if (password) payload.password = password;

    try {
        const res = await fetch(`${API}/users/${currentUserId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-HTTP-Method-Override': 'PUT' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            setMsg(data.error || 'No se pudo guardar', true);
            return;
        }
        setMsg('Perfil actualizado');
        document.getElementById('profilePass').value = '';
    } catch (err) {
        setMsg('Error al guardar', true);
    }
});

loadMe();
