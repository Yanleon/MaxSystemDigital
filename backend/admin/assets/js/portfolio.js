const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;
const table = document.getElementById('portfolioTable');
const statusLine = document.getElementById('portfolioStatus');
const formMsg = document.getElementById('portfolioFormMsg');
const modal = document.getElementById('portfolioModal');
const mTitle = document.getElementById('editPortfolioTitle');
const mImage = document.getElementById('editPortfolioImage');
const mImageFile = document.getElementById('editPortfolioImageFile');
const mDesc = document.getElementById('editPortfolioDesc');
const modalMsg = document.getElementById('portfolioModalMsg');
const closeModalBtn = document.getElementById('closePortfolioModal');
const saveModalBtn = document.getElementById('savePortfolioModal');
let editingId = null;

function setPortfolioStatus(text, isError = false) {
    statusLine.textContent = text;
    statusLine.className = isError ? 'error' : 'success';
}

async function loadPortfolio() {
    table.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    try {
        const res = await fetch(`${API}/portfolio`);
        const data = await res.json();
        if (!data.portfolio || data.portfolio.length === 0) {
            table.innerHTML = '<tr><td colspan="4">Sin proyectos</td></tr>';
            return;
        }
        table.innerHTML = '';
        data.portfolio.forEach(p => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.title}</td>
                <td>${p.description || ''}</td>
                <td>${renderImageCell(p.image)}</td>
                <td class="actions">
                    <button class="btn secondary" onclick="openPortfolioModal(${p.id}, '${encodeURIComponent(p.title)}', '${encodeURIComponent(p.description || '')}', '${encodeURIComponent(p.image || '')}')">Editar</button>
                    <button class="btn danger" onclick="deletePortfolio(${p.id})">Eliminar</button>
                </td>
            `;
            table.appendChild(row);
        });
    } catch (err) {
        table.innerHTML = '<tr><td colspan="4">Error al cargar</td></tr>';
        setPortfolioStatus('No se pudieron cargar los proyectos', true);
    }
}

document.getElementById('portfolioForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';
    const title = document.getElementById('portfolioTitle').value.trim();
    const desc = document.getElementById('portfolioDesc').value.trim();
    const image = document.getElementById('portfolioImage').value.trim();
    const imageFile = document.getElementById('portfolioImageFile').files[0];

    if (!title || !desc || (!image && !imageFile)) {
        formMsg.textContent = 'Título y descripción, más una imagen (URL o archivo) son requeridos';
        formMsg.className = 'error';
        return;
    }

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', desc);
        if (image) formData.append('image', image);
        if (imageFile) formData.append('image_file', imageFile);

        const res = await fetch(`${API}/portfolio`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        if (!res.ok) {
            formMsg.textContent = data.error || 'No se pudo guardar';
            formMsg.className = 'error';
            return;
        }
        formMsg.textContent = 'Guardado';
        formMsg.className = 'success';
        document.getElementById('portfolioForm').reset();
        loadPortfolio();
    } catch (err) {
        formMsg.textContent = 'Error al guardar';
        formMsg.className = 'error';
    }
});

async function deletePortfolio(id) {
    if (!confirm('¿Eliminar este proyecto?')) return;
    try {
        const res = await fetch(`${API}/portfolio/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setPortfolioStatus(data.error || 'No se pudo eliminar', true);
            return;
        }
        setPortfolioStatus('Proyecto eliminado');
        loadPortfolio();
    } catch (err) {
        setPortfolioStatus('Error al eliminar', true);
    }
}

function openPortfolioModal(id, titleEnc, descEnc, imageEnc) {
    editingId = id;
    mTitle.value = decodeURIComponent(titleEnc);
    mDesc.value = decodeURIComponent(descEnc);
    mImage.value = decodeURIComponent(imageEnc);
    mImageFile.value = '';
    modalMsg.textContent = '';
    modal.style.display = 'flex';
}

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    editingId = null;
});

saveModalBtn.addEventListener('click', async () => {
    if (!editingId) return;
    const title = mTitle.value.trim();
    const desc = mDesc.value.trim();
    const image = mImage.value.trim();
    const imageFile = mImageFile.files[0];

    if (!title || !desc || (!image && !imageFile)) {
        modalMsg.textContent = 'Título y descripción, más una imagen (URL o archivo) son requeridos';
        modalMsg.className = 'error';
        return;
    }

    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', desc);
        if (image) formData.append('image', image);
        if (imageFile) formData.append('image_file', imageFile);

        const res = await fetch(`${API}/portfolio/${editingId}`, {
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
        loadPortfolio();
    } catch (err) {
        modalMsg.textContent = 'Error al actualizar';
        modalMsg.className = 'error';
    }
});

window.deletePortfolio = deletePortfolio;
window.openPortfolioModal = openPortfolioModal;

loadPortfolio();

function renderImageCell(image) {
    if (!image) return '';
    const clean = image.trim();
    const url = clean.startsWith('http') ? clean : `${API}${clean.startsWith('/') ? '' : '/'}${clean}`;
    return `<img src="${url}" alt="portfolio" style="width:60px;height:60px;object-fit:cover;border-radius:10px;">`;
}
