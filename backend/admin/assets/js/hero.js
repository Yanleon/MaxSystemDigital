const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;
const formMsg = document.getElementById('heroFormMsg');

async function loadHero() {
    try {
        const res = await fetch(`${API}/hero`);
        const data = await res.json();
        if (!data.hero) return;

        const h = data.hero;
        document.getElementById('brandName').value = h.brand_name || '';
        document.getElementById('logoUrl').value = h.logo || '';
        document.getElementById('heroBadge').value = h.badge || '';
        document.getElementById('heroTitle').value = h.title || '';
        document.getElementById('heroSubtitle').value = h.subtitle || '';
        document.getElementById('heroImage').value = h.image || '';
        document.getElementById('ctaPrimaryText').value = h.cta_primary_text || '';
        document.getElementById('ctaPrimaryLink').value = h.cta_primary_link || '';
        document.getElementById('ctaSecondaryText').value = h.cta_secondary_text || '';
        document.getElementById('ctaSecondaryLink').value = h.cta_secondary_link || '';
        document.getElementById('metricTopValue').value = h.metric_top_value || '';
        document.getElementById('metricTopText').value = h.metric_top_text || '';
        document.getElementById('metricBottomValue').value = h.metric_bottom_value || '';
        document.getElementById('metricBottomText').value = h.metric_bottom_text || '';
    } catch (_) {
        formMsg.textContent = 'No se pudo cargar Hero';
        formMsg.className = 'error';
    }
}

document.getElementById('heroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';

    const payload = {
        brand_name: document.getElementById('brandName').value.trim(),
        logo: document.getElementById('logoUrl').value.trim(),
        badge: document.getElementById('heroBadge').value.trim(),
        title: document.getElementById('heroTitle').value.trim(),
        subtitle: document.getElementById('heroSubtitle').value.trim(),
        image: document.getElementById('heroImage').value.trim(),
        cta_primary_text: document.getElementById('ctaPrimaryText').value.trim(),
        cta_primary_link: document.getElementById('ctaPrimaryLink').value.trim(),
        cta_secondary_text: document.getElementById('ctaSecondaryText').value.trim(),
        cta_secondary_link: document.getElementById('ctaSecondaryLink').value.trim(),
        metric_top_value: document.getElementById('metricTopValue').value.trim(),
        metric_top_text: document.getElementById('metricTopText').value.trim(),
        metric_bottom_value: document.getElementById('metricBottomValue').value.trim(),
        metric_bottom_text: document.getElementById('metricBottomText').value.trim()
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

    const logoFile = document.getElementById('logoFile').files[0];
    const heroImageFile = document.getElementById('heroImageFile').files[0];
    if (logoFile) formData.append('logo_file', logoFile);
    if (heroImageFile) formData.append('image_file', heroImageFile);

    try {
        const res = await fetch(`${API}/hero`, {
            method: 'POST',
            headers: {
                'X-HTTP-Method-Override': 'PUT'
            },
            body: formData
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            formMsg.textContent = data.error || 'No se pudo guardar';
            formMsg.className = 'error';
            return;
        }

        formMsg.textContent = 'Guardado';
        formMsg.className = 'success';
        loadHero();
    } catch (_) {
        formMsg.textContent = 'Error al guardar';
        formMsg.className = 'error';
    }
});

loadHero();
