const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;
const clientsTable = document.getElementById('clientsTable');
const statusClient = document.getElementById('clientStatus');
const formMsg = document.getElementById('clientFormMsg');
const modal = document.getElementById('clientModal');
const modalName = document.getElementById('editClientName');
const modalLogo = document.getElementById('editClientLogo');
const modalMsg = document.getElementById('clientModalMsg');
const clientsSectionMsg = document.getElementById('clientsSectionMsg');
const closeModalBtn = document.getElementById('closeClientModal');
const saveModalBtn = document.getElementById('saveClientModal');
let editingId = null;

function setClientStatus(text, isError = false) {
    statusClient.textContent = text;
    statusClient.className = isError ? 'error' : 'success';
}

async function loadClients() {
    clientsTable.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';
    try {
        const res = await fetch(`${API}/clients`);
        const data = await res.json();
        if (!data.clients || data.clients.length === 0) {
            clientsTable.innerHTML = '<tr><td colspan="3">Sin clientes</td></tr>';
            return;
        }
        clientsTable.innerHTML = '';
        data.clients.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${c.name}</td>
                <td><a href="${c.logo}" target="_blank">Ver logo</a></td>
                <td class="actions">
                    <button class="btn secondary" onclick="openClientModal(${c.id}, '${encodeURIComponent(c.name)}', '${encodeURIComponent(c.logo || '')}')">Editar</button>
                    <button class="btn danger" onclick="deleteClient(${c.id})">Eliminar</button>
                </td>
            `;
            clientsTable.appendChild(row);
        });
    } catch (err) {
        clientsTable.innerHTML = '<tr><td colspan="3">Error al cargar</td></tr>';
        setClientStatus('No se pudieron cargar los clientes', true);
    }
}

async function loadClientsSection() {
    try {
        const res = await fetch(`${API}/clients-section`);
        const data = await res.json();
        if (!res.ok || !data.section) return;

        document.getElementById('clientsKicker').value = data.section.kicker || '';
        document.getElementById('clientsTitle').value = data.section.title || '';
        document.getElementById('clientsSubtitle').value = data.section.subtitle || '';
    } catch (_) {
        clientsSectionMsg.textContent = 'No se pudo cargar textos';
        clientsSectionMsg.className = 'error';
    }
}

document.getElementById('clientsSectionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clientsSectionMsg.textContent = '';

    const payload = {
        kicker: document.getElementById('clientsKicker').value.trim(),
        title: document.getElementById('clientsTitle').value.trim(),
        subtitle: document.getElementById('clientsSubtitle').value.trim()
    };

    try {
        const res = await fetch(`${API}/clients-section`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            clientsSectionMsg.textContent = data.error || 'No se pudo guardar';
            clientsSectionMsg.className = 'error';
            return;
        }
        clientsSectionMsg.textContent = 'Textos guardados';
        clientsSectionMsg.className = 'success';
    } catch (_) {
        clientsSectionMsg.textContent = 'Error al guardar';
        clientsSectionMsg.className = 'error';
    }
});

document.getElementById('clientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';
    const name = document.getElementById('clientName').value.trim();
    const logo = document.getElementById('clientLogo').value.trim();

    if (!name || !logo) {
        formMsg.textContent = 'Nombre y logo son requeridos';
        formMsg.className = 'error';
        return;
    }

    try {
        const res = await fetch(`${API}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, logo })
        });
        const data = await res.json();
        if (!res.ok) {
            formMsg.textContent = data.error || 'No se pudo guardar';
            formMsg.className = 'error';
            return;
        }
        formMsg.textContent = 'Guardado';
        formMsg.className = 'success';
        document.getElementById('clientForm').reset();
        loadClients();
    } catch (err) {
        formMsg.textContent = 'Error al guardar';
        formMsg.className = 'error';
    }
});

async function deleteClient(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
        const res = await fetch(`${API}/clients/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setClientStatus(data.error || 'No se pudo eliminar', true);
            return;
        }
        setClientStatus('Cliente eliminado');
        loadClients();
    } catch (err) {
        setClientStatus('Error al eliminar', true);
    }
}

window.deleteClient = deleteClient;
window.openClientModal = openClientModal;

loadClients();
loadClientsSection();

function openClientModal(id, nameEnc, logoEnc) {
    editingId = id;
    modalName.value = decodeURIComponent(nameEnc);
    modalLogo.value = decodeURIComponent(logoEnc);
    modalMsg.textContent = '';
    modal.style.display = 'flex';
}

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    editingId = null;
});

saveModalBtn.addEventListener('click', async () => {
    if (!editingId) return;
    const newName = modalName.value.trim();
    const newLogo = modalLogo.value.trim();
    if (!newName || !newLogo) {
        modalMsg.textContent = 'Nombre y logo son requeridos';
        modalMsg.className = 'error';
        return;
    }
    try {
        const res = await fetch(`${API}/clients/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, logo: newLogo })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            modalMsg.textContent = data.error || 'No se pudo actualizar';
            modalMsg.className = 'error';
            return;
        }
        modalMsg.textContent = 'Actualizado';
        modalMsg.className = 'success';
        modal.style.display = 'none';
        editingId = null;
        loadClients();
    } catch (err) {
        modalMsg.textContent = 'Error al actualizar';
        modalMsg.className = 'error';
    }
});
