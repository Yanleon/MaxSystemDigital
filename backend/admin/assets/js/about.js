const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;
const formMsg = document.getElementById('aboutFormMsg');

async function loadAbout() {
    try {
        const res = await fetch(`${API}/about`);
        const data = await res.json();
        if (!data.about) return;
        const a = data.about;
        document.getElementById('aboutTitle').value = a.title || '';
        document.getElementById('aboutP1').value = a.paragraph1 || '';
        document.getElementById('aboutP2').value = a.paragraph2 || '';
        document.getElementById('aboutImage').value = a.image || '';
        document.getElementById('f1Icon').value = a.feature1_icon || '';
        document.getElementById('f1Title').value = a.feature1_title || '';
        document.getElementById('f2Icon').value = a.feature2_icon || '';
        document.getElementById('f2Title').value = a.feature2_title || '';
        document.getElementById('f3Icon').value = a.feature3_icon || '';
        document.getElementById('f3Title').value = a.feature3_title || '';
        document.getElementById('f4Icon').value = a.feature4_icon || '';
        document.getElementById('f4Title').value = a.feature4_title || '';
    } catch (err) {
        formMsg.textContent = 'No se pudo cargar Sobre Nosotros';
        formMsg.className = 'error';
    }
}

document.getElementById('aboutForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';

    const formData = new FormData();
    formData.append('title', document.getElementById('aboutTitle').value.trim());
    formData.append('paragraph1', document.getElementById('aboutP1').value.trim());
    formData.append('paragraph2', document.getElementById('aboutP2').value.trim());
    const img = document.getElementById('aboutImage').value.trim();
    if (img) formData.append('image', img);
    const imgFile = document.getElementById('aboutImageFile').files[0];
    if (imgFile) formData.append('image_file', imgFile);

    formData.append('feature1_icon', document.getElementById('f1Icon').value.trim());
    formData.append('feature1_title', document.getElementById('f1Title').value.trim());
    formData.append('feature2_icon', document.getElementById('f2Icon').value.trim());
    formData.append('feature2_title', document.getElementById('f2Title').value.trim());
    formData.append('feature3_icon', document.getElementById('f3Icon').value.trim());
    formData.append('feature3_title', document.getElementById('f3Title').value.trim());
    formData.append('feature4_icon', document.getElementById('f4Icon').value.trim());
    formData.append('feature4_title', document.getElementById('f4Title').value.trim());

    try {
        const res = await fetch(`${API}/about`, {
            method: 'POST',
            headers: { 'X-HTTP-Method-Override': 'PUT' },
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
        loadAbout();
    } catch (err) {
        formMsg.textContent = 'Error al guardar';
        formMsg.className = 'error';
    }
});

loadAbout();
