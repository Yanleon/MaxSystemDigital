const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;
const msg = document.getElementById('footerFormMsg');

async function loadFooter() {
    try {
        const res = await fetch(`${API}/footer`);
        const data = await res.json();
        if (!data.footer) return;
        const f = data.footer;
        setVal('brandTitle', f.brand_title);
        setVal('tagline', f.tagline);
        setVal('facebook', f.facebook);
        setVal('instagram', f.instagram);
        setVal('twitter', f.twitter);
        setVal('whatsapp', f.whatsapp);
        setVal('email', f.email);
        setVal('address', f.address);
        setVal('phone', f.phone);
        setVal('footerNote', f.footer_note);
        setVal('linkInicio', f.link_inicio);
        setVal('linkNosotros', f.link_nosotros);
        setVal('linkServicios', f.link_servicios);
        setVal('linkTrabajos', f.link_trabajos);
        setVal('linkTienda', f.link_tienda);
    } catch (err) {
        msg.textContent = 'No se pudo cargar el footer';
        msg.className = 'error';
    }
}

document.getElementById('footerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';

    const payload = {
        brand_title: val('brandTitle'),
        tagline: val('tagline'),
        facebook: val('facebook'),
        instagram: val('instagram'),
        twitter: val('twitter'),
        whatsapp: val('whatsapp'),
        email: val('email'),
        address: val('address'),
        phone: val('phone'),
        footer_note: val('footerNote'),
        link_inicio: val('linkInicio'),
        link_nosotros: val('linkNosotros'),
        link_servicios: val('linkServicios'),
        link_trabajos: val('linkTrabajos'),
        link_tienda: val('linkTienda')
    };

    if (!payload.brand_title || !payload.tagline || !payload.email || !payload.address || !payload.phone || !payload.footer_note) {
        msg.textContent = 'Campos obligatorios faltantes';
        msg.className = 'error';
        return;
    }

    try {
        const res = await fetch(`${API}/footer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-HTTP-Method-Override': 'PUT' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            msg.textContent = data.error || 'No se pudo guardar';
            msg.className = 'error';
            return;
        }
        msg.textContent = 'Guardado';
        msg.className = 'success';
        loadFooter();
    } catch (err) {
        msg.textContent = 'Error al guardar';
        msg.className = 'error';
    }
});

function val(id) { return document.getElementById(id).value.trim(); }
function setVal(id, v) { if (document.getElementById(id)) document.getElementById(id).value = v || ''; }

loadFooter();
