const baseFromAdmin = window.location.pathname.includes('/backend/admin/')
    ? window.location.pathname.split('/backend/admin/')[0]
    : '';
const API = `${window.location.origin}${baseFromAdmin}/backend/public`;

const plansTable = document.getElementById('plansTable');
const planStatus = document.getElementById('planStatus');
const planFormMsg = document.getElementById('planFormMsg');
const plansFilter = document.getElementById('plansFilter');

const planModal = document.getElementById('planModal');
const editPlanName = document.getElementById('editPlanName');
const editPlanDescription = document.getElementById('editPlanDescription');
const editPlanBenefits = document.getElementById('editPlanBenefits');
const editPlanPrice = document.getElementById('editPlanPrice');
const editPlanActive = document.getElementById('editPlanActive');
const planModalMsg = document.getElementById('planModalMsg');

let editingPlanId = null;

function setPlanStatus(text, isError = false) {
    planStatus.textContent = text;
    planStatus.className = isError ? 'error' : 'success';
}

function normalizeBenefitsToArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value !== 'string') return [];

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
    } catch (_) {
        // fallback plain text
    }

    return value
        .split('\n')
        .map(v => v.trim())
        .filter(Boolean);
}

function normalizeBenefitsToText(value) {
    return normalizeBenefitsToArray(value).join('\n');
}

async function loadPlans() {
    plansTable.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
    try {
        const res = await fetch(`${API}/plans`);
        const data = await res.json();

        if (!Array.isArray(data.plans) || data.plans.length === 0) {
            plansTable.innerHTML = '<tr><td colspan="5">Sin planes</td></tr>';
            return;
        }

        plansTable.innerHTML = '';
        const filter = plansFilter ? plansFilter.value : 'all';
        const filteredPlans = data.plans.filter(plan => {
            const isActive = Number(plan.is_active) === 1;
            if (filter === 'active') return isActive;
            if (filter === 'inactive') return !isActive;
            return true;
        });

        if (filteredPlans.length === 0) {
            plansTable.innerHTML = '<tr><td colspan="5">Sin resultados para el filtro</td></tr>';
            return;
        }

        filteredPlans.forEach(plan => {
            const row = document.createElement('tr');
            const isActive = Number(plan.is_active) === 1;
            row.innerHTML = `
                <td>${plan.name || ''}</td>
                <td>${plan.description || ''}</td>
                <td>${plan.price_text || ''}</td>
                <td>${isActive ? '<span class="badge badge-contacted">Activo</span>' : '<span class="badge badge-pending">Inactivo</span>'}</td>
                <td class="actions">
                    <button class="btn secondary" onclick="openPlanModal(${plan.id}, '${encodeURIComponent(plan.name || '')}', '${encodeURIComponent(plan.description || '')}', '${encodeURIComponent(plan.benefits || '')}', '${encodeURIComponent(plan.price_text || '')}', ${isActive ? 1 : 0})">Editar</button>
                    <button class="btn danger" onclick="deletePlan(${plan.id})">Eliminar</button>
                </td>
            `;
            plansTable.appendChild(row);
        });
    } catch (error) {
        plansTable.innerHTML = '<tr><td colspan="5">Error al cargar</td></tr>';
        setPlanStatus('No se pudieron cargar los planes', true);
    }
}

document.getElementById('planForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    planFormMsg.textContent = '';

    const payload = {
        name: document.getElementById('planName').value.trim(),
        description: document.getElementById('planDescription').value.trim(),
        benefits: normalizeBenefitsToArray(document.getElementById('planBenefits').value),
        price_text: document.getElementById('planPrice').value.trim() || 'Cotizacion personalizada',
        is_active: document.getElementById('planActive').checked ? 1 : 0
    };

    if (!payload.name || !payload.description) {
        planFormMsg.textContent = 'Nombre y descripcion son requeridos';
        planFormMsg.className = 'error';
        return;
    }

    try {
        const res = await fetch(`${API}/plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            planFormMsg.textContent = data.error || 'No se pudo guardar el plan';
            planFormMsg.className = 'error';
            return;
        }

        planFormMsg.textContent = 'Plan guardado';
        planFormMsg.className = 'success';
        document.getElementById('planForm').reset();
        document.getElementById('planActive').checked = true;
        loadPlans();
    } catch (error) {
        planFormMsg.textContent = 'Error al guardar el plan';
        planFormMsg.className = 'error';
    }
});

function openPlanModal(id, nameEnc, descEnc, benefitsEnc, priceEnc, active) {
    editingPlanId = id;
    editPlanName.value = decodeURIComponent(nameEnc);
    editPlanDescription.value = decodeURIComponent(descEnc);
    editPlanBenefits.value = normalizeBenefitsToText(decodeURIComponent(benefitsEnc));
    editPlanPrice.value = decodeURIComponent(priceEnc);
    editPlanActive.checked = Number(active) === 1;
    planModalMsg.textContent = '';
    planModal.style.display = 'flex';
}

window.openPlanModal = openPlanModal;

document.getElementById('closePlanModal').addEventListener('click', () => {
    planModal.style.display = 'none';
    editingPlanId = null;
});

document.getElementById('savePlanModal').addEventListener('click', async () => {
    if (!editingPlanId) return;

    const payload = {
        name: editPlanName.value.trim(),
        description: editPlanDescription.value.trim(),
        benefits: normalizeBenefitsToArray(editPlanBenefits.value),
        price_text: editPlanPrice.value.trim() || 'Cotizacion personalizada',
        is_active: editPlanActive.checked ? 1 : 0
    };

    if (!payload.name || !payload.description) {
        planModalMsg.textContent = 'Nombre y descripcion son requeridos';
        planModalMsg.className = 'error';
        return;
    }

    try {
        const res = await fetch(`${API}/plans/${editingPlanId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            planModalMsg.textContent = data.error || 'No se pudo actualizar';
            planModalMsg.className = 'error';
            return;
        }

        planModal.style.display = 'none';
        editingPlanId = null;
        setPlanStatus('Plan actualizado');
        loadPlans();
    } catch (error) {
        planModalMsg.textContent = 'Error al actualizar';
        planModalMsg.className = 'error';
    }
});

async function deletePlan(id) {
    if (!confirm('¿Eliminar este plan?')) return;

    try {
        const res = await fetch(`${API}/plans/${id}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            setPlanStatus(data.error || 'No se pudo eliminar', true);
            return;
        }
        setPlanStatus('Plan eliminado');
        loadPlans();
    } catch (error) {
        setPlanStatus('Error al eliminar', true);
    }
}

window.deletePlan = deletePlan;

loadPlans();

if (plansFilter) {
    plansFilter.addEventListener('change', loadPlans);
}
