const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;
const servicesTable = document.getElementById('servicesTable');
const serviceStatus = document.getElementById('serviceStatus');
const serviceFormMsg = document.getElementById('serviceFormMsg');
const modal = document.getElementById('serviceModal');
const modalName = document.getElementById('editServiceName');
const modalIcon = document.getElementById('editServiceIcon');
const modalIconFile = document.getElementById('editServiceIconFile');
const modalDesc = document.getElementById('editServiceDesc');
const modalMsg = document.getElementById('serviceModalMsg');
const closeModalBtn = document.getElementById('closeServiceModal');
const saveModalBtn = document.getElementById('saveServiceModal');
let editingId = null;
let editingExistingIcon = '';

function setServiceStatus(text, isError = false) {
    serviceStatus.textContent = text;
    serviceStatus.className = isError ? 'error' : 'success';
}

async function loadServices() {
    servicesTable.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    try {
        const res = await fetch(`${API}/services`);
        const data = await res.json();
        if (!data.services || data.services.length === 0) {
            servicesTable.innerHTML = '<tr><td colspan="4">Sin servicios</td></tr>';
            return;
        }
        servicesTable.innerHTML = '';
        data.services.forEach(s => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${s.name}</td>
                <td>${s.description || ''}</td>
                <td>${renderIconCell(s.icon)}</td>
                <td class="actions">
                    <button class="btn secondary" onclick="openServiceModal(${s.id}, '${encodeURIComponent(s.name)}', '${encodeURIComponent(s.description || '')}', '${encodeURIComponent(s.icon || '')}')">Editar</button>
                    <button class="btn danger" onclick="deleteService(${s.id})">Eliminar</button>
                </td>
            `;
            servicesTable.appendChild(row);
        });
    } catch (err) {
        servicesTable.innerHTML = '<tr><td colspan="4">Error al cargar</td></tr>';
        setServiceStatus('No se pudieron cargar los servicios', true);
    }
}

document.getElementById('serviceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    serviceFormMsg.textContent = '';
    const name = document.getElementById('serviceName').value.trim();
    const description = document.getElementById('serviceDesc').value.trim();
    const icon = document.getElementById('serviceIcon').value.trim();
    const iconFile = document.getElementById('serviceIconFile').files[0];

    if (!name || !description || (!icon && !iconFile)) {
        serviceFormMsg.textContent = 'Título y descripción, más un ícono (clase o archivo) son requeridos';
        serviceFormMsg.className = 'error';
        return;
    }

    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        if (icon) formData.append('icon', icon);
        if (iconFile) formData.append('icon_file', iconFile);

        const res = await fetch(`${API}/services`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (!res.ok) {
            serviceFormMsg.textContent = data.error || 'No se pudo guardar';
            serviceFormMsg.className = 'error';
            return;
        }
        serviceFormMsg.textContent = 'Guardado';
        serviceFormMsg.className = 'success';
        document.getElementById('serviceForm').reset();
        loadServices();
    } catch (err) {
        serviceFormMsg.textContent = 'Error al guardar';
        serviceFormMsg.className = 'error';
    }
});

async function deleteService(id) {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
        const res = await fetch(`${API}/services/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setServiceStatus(data.error || 'No se pudo eliminar', true);
            return;
        }
        setServiceStatus('Servicio eliminado');
        loadServices();
    } catch (err) {
        setServiceStatus('Error al eliminar', true);
    }
}

window.deleteService = deleteService;
window.openServiceModal = openServiceModal;

loadServices();

function renderIconCell(icon) {
    if (!icon) return '';
    const clean = icon.trim();
    if (clean.startsWith('http')) {
        return `<img src="${clean}" alt="icon" style="width:32px;height:32px;border-radius:6px;object-fit:cover;">`;
    }
    return `<i class="${clean}" style="font-size:20px;"></i>`;
}

function openServiceModal(id, nameEnc, descEnc, iconEnc) {
    editingId = id;
    modalName.value = decodeURIComponent(nameEnc);
    modalDesc.value = decodeURIComponent(descEnc);
    editingExistingIcon = decodeURIComponent(iconEnc);
    modalIcon.value = editingExistingIcon;
    modalIconFile.value = '';
    modalMsg.textContent = '';
    modal.style.display = 'flex';
}

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    editingId = null;
    editingExistingIcon = '';
});

saveModalBtn.addEventListener('click', async () => {
    if (!editingId) return;
    const newName = modalName.value.trim();
    const newDesc = modalDesc.value.trim();
    const newIcon = modalIcon.value.trim();
    const newIconFile = modalIconFile.files[0];

    if (!newName || !newDesc || (!newIcon && !newIconFile)) {
        modalMsg.textContent = 'Título y descripción, más un ícono (clase o archivo) son requeridos';
        modalMsg.className = 'error';
        return;
    }

    try {
        const formData = new FormData();
        formData.append('name', newName);
        formData.append('description', newDesc);
        if (newIcon) formData.append('icon', newIcon);
        if (newIconFile) formData.append('icon_file', newIconFile);

        const res = await fetch(`${API}/services/${editingId}`, {
            method: 'POST',
            headers: { 'X-HTTP-Method-Override': 'PUT' },
            body: formData
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
        editingExistingIcon = '';
        loadServices();
    } catch (err) {
        modalMsg.textContent = 'Error al actualizar';
        modalMsg.className = 'error';
    }
});
