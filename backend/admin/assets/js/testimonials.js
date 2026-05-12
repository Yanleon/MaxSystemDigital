const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;

const testimonialsTable = document.getElementById('testimonialsTable');
const testimonialStatus = document.getElementById('testimonialStatus');
const testimonialFormMsg = document.getElementById('testimonialFormMsg');
const testimonialsFilter = document.getElementById('testimonialsFilter');

const testimonialModal = document.getElementById('testimonialModal');
const editTAuthor = document.getElementById('editTAuthor');
const editTRole = document.getElementById('editTRole');
const editTContent = document.getElementById('editTContent');
const editTActive = document.getElementById('editTActive');
const testimonialModalMsg = document.getElementById('testimonialModalMsg');

let editingId = null;

function setStatus(text, isError = false) {
    testimonialStatus.textContent = text;
    testimonialStatus.className = isError ? 'error' : 'success';
}

async function loadTestimonials() {
    testimonialsTable.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
    try {
        const res = await fetch(`${API}/testimonials`);
        const data = await res.json();

        if (!Array.isArray(data.testimonials) || data.testimonials.length === 0) {
            testimonialsTable.innerHTML = '<tr><td colspan="5">Sin testimonios</td></tr>';
            return;
        }

        testimonialsTable.innerHTML = '';
        const filter = testimonialsFilter ? testimonialsFilter.value : 'all';
        const filteredTestimonials = data.testimonials.filter(item => {
            const isActive = Number(item.is_active) === 1;
            if (filter === 'active') return isActive;
            if (filter === 'inactive') return !isActive;
            return true;
        });

        if (filteredTestimonials.length === 0) {
            testimonialsTable.innerHTML = '<tr><td colspan="5">Sin resultados para el filtro</td></tr>';
            return;
        }

        filteredTestimonials.forEach(item => {
            const isActive = Number(item.is_active) === 1;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.author_name || ''}</td>
                <td>${item.author_role || ''}</td>
                <td>${item.content || ''}</td>
                <td>${isActive ? '<span class="badge badge-contacted">Activo</span>' : '<span class="badge badge-pending">Inactivo</span>'}</td>
                <td class="actions">
                    <button class="btn secondary" onclick="openModal(${item.id}, '${encodeURIComponent(item.author_name || '')}', '${encodeURIComponent(item.author_role || '')}', '${encodeURIComponent(item.content || '')}', ${isActive ? 1 : 0})">Editar</button>
                    <button class="btn danger" onclick="deleteTestimonial(${item.id})">Eliminar</button>
                </td>
            `;
            testimonialsTable.appendChild(row);
        });
    } catch (error) {
        testimonialsTable.innerHTML = '<tr><td colspan="5">Error al cargar</td></tr>';
        setStatus('No se pudieron cargar testimonios', true);
    }
}

document.getElementById('testimonialForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    testimonialFormMsg.textContent = '';

    const payload = {
        author_name: document.getElementById('tAuthor').value.trim(),
        author_role: document.getElementById('tRole').value.trim(),
        content: document.getElementById('tContent').value.trim(),
        is_active: document.getElementById('tActive').checked ? 1 : 0
    };

    if (!payload.author_name || !payload.content) {
        testimonialFormMsg.textContent = 'Autor y contenido son requeridos';
        testimonialFormMsg.className = 'error';
        return;
    }

    try {
        const res = await fetch(`${API}/testimonials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            testimonialFormMsg.textContent = data.error || 'No se pudo guardar';
            testimonialFormMsg.className = 'error';
            return;
        }

        testimonialFormMsg.textContent = 'Testimonio guardado';
        testimonialFormMsg.className = 'success';
        document.getElementById('testimonialForm').reset();
        document.getElementById('tActive').checked = true;
        loadTestimonials();
    } catch (error) {
        testimonialFormMsg.textContent = 'Error al guardar';
        testimonialFormMsg.className = 'error';
    }
});

function openModal(id, authorEnc, roleEnc, contentEnc, active) {
    editingId = id;
    editTAuthor.value = decodeURIComponent(authorEnc);
    editTRole.value = decodeURIComponent(roleEnc);
    editTContent.value = decodeURIComponent(contentEnc);
    editTActive.checked = Number(active) === 1;
    testimonialModalMsg.textContent = '';
    testimonialModal.style.display = 'flex';
}

window.openModal = openModal;

document.getElementById('closeTestimonialModal').addEventListener('click', () => {
    testimonialModal.style.display = 'none';
    editingId = null;
});

document.getElementById('saveTestimonialModal').addEventListener('click', async () => {
    if (!editingId) return;

    const payload = {
        author_name: editTAuthor.value.trim(),
        author_role: editTRole.value.trim(),
        content: editTContent.value.trim(),
        is_active: editTActive.checked ? 1 : 0
    };

    if (!payload.author_name || !payload.content) {
        testimonialModalMsg.textContent = 'Autor y contenido son requeridos';
        testimonialModalMsg.className = 'error';
        return;
    }

    try {
        const res = await fetch(`${API}/testimonials/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            testimonialModalMsg.textContent = data.error || 'No se pudo actualizar';
            testimonialModalMsg.className = 'error';
            return;
        }

        testimonialModal.style.display = 'none';
        editingId = null;
        setStatus('Testimonio actualizado');
        loadTestimonials();
    } catch (error) {
        testimonialModalMsg.textContent = 'Error al actualizar';
        testimonialModalMsg.className = 'error';
    }
});

async function deleteTestimonial(id) {
    if (!confirm('¿Eliminar este testimonio?')) return;
    try {
        const res = await fetch(`${API}/testimonials/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setStatus(data.error || 'No se pudo eliminar', true);
            return;
        }
        setStatus('Testimonio eliminado');
        loadTestimonials();
    } catch (error) {
        setStatus('Error al eliminar', true);
    }
}

window.deleteTestimonial = deleteTestimonial;

loadTestimonials();

if (testimonialsFilter) {
    testimonialsFilter.addEventListener('change', loadTestimonials);
}
