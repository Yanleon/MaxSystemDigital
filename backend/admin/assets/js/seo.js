(() => {
const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;

const fields = {
    meta_title: document.getElementById('metaTitle'),
    meta_description: document.getElementById('metaDescription'),
    meta_keywords: document.getElementById('metaKeywords'),
    og_title: document.getElementById('ogTitle'),
    og_description: document.getElementById('ogDescription'),
    canonical_url: document.getElementById('canonicalUrl'),
    robots: document.getElementById('robots'),
    schema_json: document.getElementById('schemaJson')
};

const msg = document.getElementById('seoMsg');

function setMessage(text, ok = true) {
    msg.textContent = text;
    msg.className = ok ? 'success' : 'error';
}

function fillForm(seo = {}) {
    Object.keys(fields).forEach((key) => {
        fields[key].value = seo[key] || '';
    });
}

async function loadSeo() {
    try {
        const res = await fetch(`${API}/seo`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo cargar SEO');
        fillForm(data.seo || {});
        setMessage('SEO cargado correctamente', true);
    } catch (err) {
        setMessage(err.message || 'Error cargando SEO', false);
    }
}

async function saveSeo() {
    const payload = {};
    Object.keys(fields).forEach((key) => {
        payload[key] = fields[key].value.trim();
    });

    try {
        const res = await fetch(`${API}/seo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
        setMessage('Configuracion SEO guardada', true);
    } catch (err) {
        setMessage(err.message || 'Error guardando SEO', false);
    }
}

document.getElementById('saveSeoBtn').addEventListener('click', saveSeo);
document.getElementById('resetSeoBtn').addEventListener('click', loadSeo);

loadSeo();
})();
