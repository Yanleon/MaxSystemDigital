const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;
const tableBody = document.getElementById('contactsTable');
const statusLine = document.getElementById('contactStatus');
const modal = document.getElementById('contactModal');
const modalMsg = document.getElementById('contactModalMsg');
const mName = document.getElementById('cName');
const mCountry = document.getElementById('cCountry');
const mPhone = document.getElementById('cPhone');
const mService = document.getElementById('cService');
const mStatus = document.getElementById('cStatus');
const mDate = document.getElementById('cDate');
const mMessage = document.getElementById('cMessage');
const closeModalBtn = document.getElementById('closeContactModal');
const saveModalBtn = document.getElementById('saveContactModal');
const waModalBtn = document.getElementById('waContactModal');
let currentContactId = null;
let currentPhone = '';
let currentName = '';
let currentService = '';

function setStatus(text, isError = false) {
    statusLine.textContent = text;
    statusLine.className = isError ? 'error' : 'success';
}

async function loadContacts() {
    tableBody.innerHTML = '<tr><td colspan="8">Cargando...</td></tr>';
    try {
        const res = await fetch(`${API}/contacts`);
        const data = await res.json();

        if (!data.contacts || data.contacts.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8">No hay contactos</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.contacts.forEach(c => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${c.name}</td>
                <td>${c.country}</td>
                <td>${c.phone}</td>
                <td>${c.service}</td>
                <td>${c.description}</td>
                <td>${renderStatus(c.status)}</td>
                <td>${c.created_at || ''}</td>
                <td>
                    <div class="actions">
                        <button class="btn secondary" onclick="openContactModal(${c.id}, '${encodeURIComponent(c.name)}', '${encodeURIComponent(c.country)}', '${encodeURIComponent(c.phone)}', '${encodeURIComponent(c.service)}', '${encodeURIComponent(c.description)}', '${encodeURIComponent(c.status||'abierto')}', '${encodeURIComponent(c.created_at||'')}')">Ver / Editar</button>
                        <button class="btn" onclick="openWhatsApp('${encodeURIComponent(c.phone)}','${encodeURIComponent(c.name)}','${encodeURIComponent(c.service)}')">WhatsApp</button>
                        <button class="btn danger" onclick="deleteContact(${c.id})">Eliminar</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        tableBody.innerHTML = '<tr><td colspan="7">Error al cargar contactos</td></tr>';
        setStatus('No se pudieron cargar los contactos', true);
    }
}

async function deleteContact(id) {
    if (!confirm('¿Eliminar este contacto?')) return;
    try {
        const res = await fetch(`${API}/contacts/${id}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            setStatus(data.error || 'No se pudo eliminar', true);
            return;
        }
        setStatus('Contacto eliminado');
        loadContacts();
    } catch (err) {
        setStatus('Error al eliminar', true);
    }
}

window.deleteContact = deleteContact;
window.openWhatsApp = openWhatsApp;
window.openContactModal = openContactModal;

loadContacts();

function openWhatsApp(phoneEnc, nameEnc, serviceEnc) {
    const phone = decodeURIComponent(phoneEnc).replace(/\D/g, '');
    const name = decodeURIComponent(nameEnc);
    const service = decodeURIComponent(serviceEnc);
    const text = encodeURIComponent(`Hola ${name}, soy de MaxSystemDigital respecto a tu solicitud de "${service}".`);
    const url = `https://wa.me/${phone}?text=${text}`;
    window.open(url, '_blank');
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

function openContactModal(id, nameEnc, countryEnc, phoneEnc, serviceEnc, msgEnc, statusEnc, dateEnc) {
    currentContactId = id;
    currentPhone = decodeURIComponent(phoneEnc);
    currentName = decodeURIComponent(nameEnc);
    currentService = decodeURIComponent(serviceEnc);

    mName.textContent = currentName;
    mCountry.textContent = decodeURIComponent(countryEnc);
    mPhone.textContent = currentPhone;
    mService.textContent = currentService;
    mMessage.textContent = decodeURIComponent(msgEnc);
    mStatus.value = decodeURIComponent(statusEnc) || 'abierto';
    mDate.textContent = decodeURIComponent(dateEnc);
    modalMsg.textContent = '';
    modal.style.display = 'flex';
}

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    currentContactId = null;
});

saveModalBtn.addEventListener('click', async () => {
    if (!currentContactId) return;
    const status = mStatus.value;
    try {
        const res = await fetch(`${API}/contacts/${currentContactId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            modalMsg.textContent = data.error || 'No se pudo actualizar';
            modalMsg.className = 'error';
            return;
        }
        modalMsg.textContent = 'Estado actualizado';
        modalMsg.className = 'success';
        modal.style.display = 'none';
        currentContactId = null;
        loadContacts();
    } catch (err) {
        modalMsg.textContent = 'Error al actualizar';
        modalMsg.className = 'error';
    }
});

waModalBtn.addEventListener('click', () => {
    if (!currentContactId) return;
    openWhatsApp(encodeURIComponent(currentPhone), encodeURIComponent(currentName), encodeURIComponent(currentService));
});

