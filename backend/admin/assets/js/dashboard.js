const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;

async function loadStats() {
    try {
        const res = await fetch(`${API}/dashboard`);
        const data = await res.json();

        if (!res.ok) throw new Error();

        const stats = data.stats || {};
        document.getElementById('statContacts').textContent = stats.contacts ?? '-';
        document.getElementById('statServices').textContent = stats.services ?? '-';
        document.getElementById('statClients').textContent = stats.clients ?? '-';
    } catch (err) {
        document.getElementById('statContacts').textContent = 'Err';
        document.getElementById('statServices').textContent = 'Err';
        document.getElementById('statClients').textContent = 'Err';
    }
}

loadStats();

const navGroupToggles = document.querySelectorAll('.nav-group-toggle');
navGroupToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
        const group = toggle.closest('.nav-group');
        if (!group) return;

        const isOpen = group.getAttribute('data-open') === 'true';
        group.setAttribute('data-open', isOpen ? 'false' : 'true');
        toggle.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
});

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch(`${API}/logout`, { method: 'POST' });
            window.location.href = 'login.html';
        } catch (err) {
            window.location.href = 'login.html';
        }
    });
}
