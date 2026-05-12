const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;
const usersTable = document.getElementById('usersTable');
const userStatus = document.getElementById('userStatus');
const userFormMsg = document.getElementById('userFormMsg');
const logoutBtn = document.getElementById('logoutBtn');

function setStatus(el, text, isError = false) {
    el.textContent = text;
    el.className = isError ? 'error' : 'success';
}

async function loadUsers() {
    usersTable.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        if (!res.ok || !data.users || data.users.length === 0) {
            usersTable.innerHTML = '<tr><td colspan="4">Sin usuarios</td></tr>';
            return;
        }
        usersTable.innerHTML = '';
        data.users.forEach(u => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td class="actions">
                    <button class="btn danger" onclick="deleteUser(${u.id})">Eliminar</button>
                </td>
            `;
            usersTable.appendChild(row);
        });
    } catch (err) {
        usersTable.innerHTML = '<tr><td colspan="4">Error al cargar</td></tr>';
        setStatus(userStatus, 'No se pudieron cargar los usuarios', true);
    }
}

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    userFormMsg.textContent = '';
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPass').value.trim();
    const role = document.getElementById('userRole').value;

    if (!name || !email || !password) {
        setStatus(userFormMsg, 'Todos los campos son obligatorios', true);
        return;
    }

    try {
        const res = await fetch(`${API}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (!res.ok) {
            setStatus(userFormMsg, data.error || 'No se pudo guardar', true);
            return;
        }
        setStatus(userFormMsg, 'Guardado');
        document.getElementById('userForm').reset();
        loadUsers();
    } catch (err) {
        setStatus(userFormMsg, 'Error al guardar', true);
    }
});

async function deleteUser(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
        const res = await fetch(`${API}/users/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setStatus(userStatus, data.error || 'No se pudo eliminar', true);
            return;
        }
        setStatus(userStatus, 'Usuario eliminado');
        loadUsers();
    } catch (err) {
        setStatus(userStatus, 'Error al eliminar', true);
    }
}

logoutBtn?.addEventListener('click', async () => {
    try {
        await fetch(`${API}/logout`, { method: 'POST' });
        window.location.href = 'login.html';
    } catch (err) {
        // ignorar
    }
});

window.deleteUser = deleteUser;

loadUsers();
