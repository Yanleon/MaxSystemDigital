(() => {
if (document.body && document.body.classList.contains('admin-v2')) {
    document.body.style.visibility = 'hidden';
}
const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API_BASE = `${window.location.origin}${baseFromAdmin}/backend/public`;
const API_LOGOUT = `${API_BASE}/logout`;
const API_ME = `${API_BASE}/me`;
const FRONT_HOME = `${window.location.origin}${baseFromAdmin}/`;

function openSidebar() {
    document.body.classList.add('sidebar-open');
}

function closeSidebar() {
    document.body.classList.remove('sidebar-open');
}

function toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
}

function setupGroupedSidebar() {
    const sideNav = document.querySelector('.side-nav');
    if (!sideNav || sideNav.querySelector('.nav-group')) return;

    const links = Array.from(sideNav.querySelectorAll('a'));
    if (!links.length) return;

    const findLink = (keys) => links.find((link) => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        return keys.some((k) => href.includes(k));
    });

    const groups = [
        { title: 'GENERAL', open: true, keys: ['dashboard.html'] },
        { title: 'CONTENIDO', open: false, keys: ['contacts.html', 'clients.html', 'services.html', 'portfolio.html', 'hero.html', 'plans.html', 'testimonials.html', 'about.html', 'seo.html', 'footer.html'] },
        { title: 'SISTEMA', open: false, keys: ['users.html', 'profile.html', 'support.html', '#'] }
    ];

    sideNav.innerHTML = '';

    groups.forEach((group) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'nav-group';

        const items = document.createElement('div');
        items.className = 'nav-group-items';

        group.keys.forEach((key) => {
            const match = findLink([key]);
            if (match && !items.contains(match)) {
                items.appendChild(match);
            }
        });

        if (!items.children.length) return;

        const hasActive = !!items.querySelector('a.active');
        wrapper.setAttribute('data-open', hasActive || group.open ? 'true' : 'false');

        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'nav-group-toggle';
        toggle.textContent = group.title;
        toggle.setAttribute('aria-expanded', wrapper.getAttribute('data-open'));
        toggle.addEventListener('click', () => {
            const isOpen = wrapper.getAttribute('data-open') === 'true';
            wrapper.setAttribute('data-open', isOpen ? 'false' : 'true');
            toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });

        wrapper.appendChild(toggle);
        wrapper.appendChild(items);
        sideNav.appendChild(wrapper);
    });

    sideNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => closeSidebar());
    });
}

function attachLogout(buttonId) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener('click', async () => {
        try {
            await fetch(API_LOGOUT, { method: 'POST' });
        } catch (err) {
            // ignorar
        }
        window.location.replace(FRONT_HOME);
    });
}

function setupMobileSidebar() {
    const body = document.body;
    if (!body.classList.contains('admin-v2')) return;

    let backdrop = document.getElementById('sidebarBackdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'sidebarBackdrop';
        backdrop.className = 'sidebar-backdrop';
        const layout = document.querySelector('.dashboard-layout');
        if (layout && layout.parentNode) {
            layout.parentNode.insertBefore(backdrop, layout);
        }
    }

    let menuBtn = document.getElementById('mobileMenuBtn');
    if (!menuBtn) {
        const host = document.querySelector('.admin-topbar') || document.querySelector('.dash-header') || document.querySelector('.dashboard-main');
        if (host) {
            menuBtn = document.createElement('button');
            menuBtn.type = 'button';
            menuBtn.id = 'mobileMenuBtn';
            menuBtn.className = 'mobile-menu-btn';
            menuBtn.textContent = '☰';
            menuBtn.setAttribute('aria-label', 'Abrir menu');
            host.insertBefore(menuBtn, host.firstChild);
        }
    }

    if (menuBtn && !menuBtn.dataset.bound) {
        menuBtn.dataset.bound = '1';
        menuBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        };
    }

    if (backdrop && !backdrop.dataset.bound) {
        backdrop.dataset.bound = '1';
        backdrop.onclick = () => closeSidebar();
    }

    if (!window.__adminSidebarResizeBound) {
        window.__adminSidebarResizeBound = true;
        window.addEventListener('resize', () => {
            if (window.innerWidth > 760) {
                closeSidebar();
            }
        });
    }

    document.querySelectorAll('.mobile-menu-btn').forEach((btn) => {
        if (btn.dataset.boundGlobal) return;
        btn.dataset.boundGlobal = '1';
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSidebar();
        };
    });
}

if (!window.__adminSidebarClickBound) {
    window.__adminSidebarClickBound = true;
    document.addEventListener('click', (e) => {
        const menuButton = e.target.closest('#mobileMenuBtn');
        if (menuButton) {
            toggleSidebar();
            return;
        }

        if (e.target.id === 'sidebarBackdrop') {
            closeSidebar();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupMobileSidebar);
} else {
    setupMobileSidebar();
}

window.addEventListener('pageshow', (event) => {
    if (!document.body.classList.contains('admin-v2')) return;
    if (event.persisted) {
        document.body.style.visibility = 'hidden';
        guard();
    }
});

// Enlaces con clase logout-link
document.querySelectorAll('.logout-link').forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        try { await fetch(API_LOGOUT, { method: 'POST' }); } catch (err) {}
        window.location.replace(FRONT_HOME);
    });
});

attachLogout('logoutBtn');

// Guard: si usuario es soporte y está en páginas no-soporte, redirigir
function initAdminShell(user) {
    if (!document.body.classList.contains('admin-v2')) return;

    setupMobileSidebar();
    setupGroupedSidebar();
    document.body.style.visibility = 'visible';

    // Topbar auto-injection disabled: each view controls its own header markup.

    const savedTheme = localStorage.getItem('admin_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('admin-theme-dark');
    }

    const themeBtn = document.getElementById('adminThemeToggle');
    if (themeBtn && !themeBtn.dataset.bound) {
        themeBtn.dataset.bound = '1';
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('admin-theme-dark');
            const mode = document.body.classList.contains('admin-theme-dark') ? 'dark' : 'light';
            localStorage.setItem('admin_theme', mode);
        });
    }

    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = '1';
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.trim().toLowerCase();
            const navLinks = document.querySelectorAll('.side-nav a');
            navLinks.forEach(link => {
                const text = (link.textContent || '').toLowerCase();
                link.style.display = !q || text.includes(q) ? '' : 'none';
            });

            document.querySelectorAll('.nav-group-label').forEach(label => {
                let hasVisible = false;
                let el = label.nextElementSibling;
                while (el && !el.classList.contains('nav-group-label')) {
                    if (el.matches('a') && el.style.display !== 'none') {
                        hasVisible = true;
                        break;
                    }
                    el = el.nextElementSibling;
                }
                label.style.display = hasVisible || !q ? '' : 'none';
            });
        });
    }

}

const guard = async () => {
    try {
        const res = await fetch(API_ME);
        if (res.status === 401) {
            window.location.replace('login.html');
            return;
        }
        if (!res.ok) {
            document.body.style.visibility = 'visible';
            console.error('Error en /me:', res.status);
            return;
        }
        const raw = await res.text();
        let data = {};
        try {
            data = raw ? JSON.parse(raw) : {};
        } catch (e) {
            document.body.style.visibility = 'visible';
            console.error('Respuesta invalida en /me:', raw);
            return;
        }
        const role = data.user?.role;
        initAdminShell(data.user || null);
        const path = window.location.pathname;
        const isSupportPage = path.includes('support.html');
        const isProfile = path.includes('profile.html');
        if (role === 'soporte') {
            document.body.classList.add('role-soporte');
        }
        if (role === 'soporte' && !isSupportPage && !isProfile) {
            window.location.href = 'support.html';
        }
    } catch (err) {
        document.body.style.visibility = 'visible';
        console.error('Error de red en guard:', err);
    }
};

guard();
})();
