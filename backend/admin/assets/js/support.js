const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;
const table = document.getElementById('supportTable');
const statusLine = document.getElementById('supportStatus');
let supportUsers = [];
let currentUser = null;

function setStatus(text, isError = false) {
    statusLine.textContent = text;
    statusLine.className = isError ? 'error' : 'success';
}

async function loadSupportUsers() {
    try {
        const res = await fetch(`${API}/users`);
        const data = await res.json();
        if (res.ok && data.users) {
            supportUsers = data.users.filter(u => u.role === 'soporte');
        }
    } catch (err) {
        supportUsers = [];
    }
}

async function loadContacts() {
    table.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';
    try {
        const res = await fetch(`${API}/contacts`);
        const data = await res.json();
        if (!res.ok || !data.contacts || data.contacts.length === 0) {
            table.innerHTML = '<tr><td colspan="6">Sin contactos</td></tr>';
            return;
        }
        table.innerHTML = '';

        let list = data.contacts;
        if (currentUser && currentUser.role === 'soporte') {
            list = list.filter(c => Number(c.support_id) === Number(currentUser.id));
        }

        if (list.length === 0) {
            table.innerHTML = '<tr><td colspan="6">Sin contactos asignados</td></tr>';
            return;
        }

        list.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${c.name}</td>
                <td>${c.phone}</td>
                <td>${c.service}</td>
                <td>${renderStatus(c.status)}</td>
                <td>${renderSelect(c.id, c.support_id)}</td>
                <td>${renderActions(c)}</td>
            `;
            table.appendChild(row);
        });
    } catch (err) {
        table.innerHTML = '<tr><td colspan="6">Error al cargar</td></tr>';
        setStatus('No se pudieron cargar los contactos', true);
    }
}

function renderSelect(id, current) {
    if (currentUser && currentUser.role === 'soporte') {
        const name = supportUsers.find(u => Number(u.id) === Number(currentUser.id))?.name || 'Asignado';
        return `<span class="badge badge-contacted">${name}</span>`;
    }
    let opts = '<option value="">Sin asignar</option>';
    supportUsers.forEach(u => {
        const selected = current && Number(current) === Number(u.id) ? 'selected' : '';
        opts += `<option value="${u.id}" ${selected}>${u.name}</option>`;
    });
    return `<select id="support_${id}">${opts}</select>`;
}

function renderAssignBtn(id) {
    if (currentUser && currentUser.role === 'soporte') return '';
    return `<button class="btn" onclick="assign(${id})">Asignar</button>`;
}

function renderActions(c) {
    const select = `<select id="status_${c.id}">
        ${['abierto','contactado','pendiente','finalizado'].map(s => `<option value="${s}" ${c.status===s?'selected':''}>${s}</option>`).join('')}
    </select>`;
    const btnStatus = `<button class="btn" onclick="updateStatus(${c.id})">Estado</button>`;
    const btnAssign = renderAssignBtn(c.id);
    if (currentUser && currentUser.role === 'soporte') {
        return `${select} ${btnStatus}`;
    }
    return `${select} ${btnStatus} ${btnAssign}`;
}

function renderStatus(status) {
    const s = (status || 'abierto').toLowerCase();
    const map = {
        abierto: 'badge badge-open',
        contactado: 'badge badge-contacted',
        pendiente: 'badge badge-pending',
        finalizado: 'badge badge-done'
    };
    const cls = map[s] || map.abierto;
    const label = s.charAt(0).toUpperCase() + s.slice(1);
    return `<span class="${cls}">${label}</span>`;
}

async function assign(contactId) {
    const select = document.getElementById(`support_${contactId}`);
    if (!select) return;
    const support_id = select.value;
    try {
        const res = await fetch(`${API}/contacts/${contactId}/support`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ support_id })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setStatus(data.error || 'No se pudo asignar', true);
            return;
        }
        setStatus('Asignado');
    } catch (err) {
        setStatus('Error al asignar', true);
    }
}

window.assign = assign;
window.updateStatus = updateStatus;

(async function init() {
    // Obtener user actual
    try {
        const res = await fetch(`${API}/me`);
        if (res.ok) {
            const data = await res.json();
            currentUser = data.user;
        }
    } catch (err) {
        currentUser = null;
    }

    await loadSupportUsers();
    await loadContacts();
})();

async function updateStatus(contactId) {
    const select = document.getElementById(`status_${contactId}`);
    if (!select) return;
    const status = select.value;
    try {
        const res = await fetch(`${API}/contacts/${contactId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setStatus(data.error || 'No se pudo actualizar', true);
            return;
        }
        setStatus('Estado actualizado');
        loadContacts();
    } catch (err) {
        setStatus('Error al actualizar', true);
    }
}
