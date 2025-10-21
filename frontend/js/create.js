const BACKEND_URL = 'https://rope-v2-production.up.railway.app';

// =============================
// Buscar ocorrências
// =============================
async function fetchOccurrences(params = {}) {
    try {
        const query = new URLSearchParams(params).toString();
        const url = query ? `${BACKEND_URL}/api/occurrences?${query}` : `${BACKEND_URL}/api/occurrences`;

        const token = Auth.getToken();
        if (!token) return Auth.logout();

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'Erro ao buscar ocorrências');
        }

        const data = await res.json();
        occurrencesList.innerHTML = '';
        data.forEach(occ => {
            const item = document.createElement('div');
            item.classList.add('occurrence-item');
            item.innerHTML = `
                <h3>${occ.type}</h3>
                <p>${occ.description}</p>
                <p>Local: ${occ.location.coordinates[1].toFixed(6)}, ${occ.location.coordinates[0].toFixed(6)}</p>
                ${occ.photoUrl ? `<img src="${BACKEND_URL}${occ.photoUrl}" style="max-width:200px;">` : ''}
                <hr>
            `;
            occurrencesList.appendChild(item);
        });

    } catch (err) {
        console.error(err);
        alert('❌ ' + err.message);
    }
}

// =============================
// Criar ocorrência
// =============================
createForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const token = Auth.getToken();
    if (!token) return Auth.logout();

    const type = document.getElementById('occurrenceType')?.value;
    const description = document.getElementById('description')?.value;
    const lat = latitudeInput.value;
    const lng = longitudeInput.value;

    if (!type || !description || !lat || !lng) {
        return alert('Preencha todos os campos obrigatórios!');
    }

    const formData = new FormData();
    formData.append('type', type);
    formData.append('description', description);
    formData.append('lat', lat);
    formData.append('lng', lng);
    if (photoInput.files[0]) formData.append('photo', photoInput.files[0]);

    try {
        const res = await fetch(`${BACKEND_URL}/api/occurrences`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const contentType = res.headers.get('content-type');
        let data = {};
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            const text = await res.text();
            console.error('Resposta inesperada do servidor:', text);
            throw new Error('Erro inesperado do servidor.');
        }

        if (!res.ok) throw new Error(data.message || 'Erro ao criar ocorrência');

        alert('✅ Ocorrência registrada com sucesso!');
        createForm.reset();
        photoPreview.innerHTML = '';
        if (marker && map) {
            map.removeLayer(marker);
            marker = null;
        }

        fetchOccurrences();

    } catch (err) {
        alert('❌ ' + err.message);
        console.error(err);
    }
});

// =============================
// Carregar ocorrências ao iniciar
// =============================
document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isAuthenticated()) window.location.href = 'login.html';
    fetchOccurrences();
});
