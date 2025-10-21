let map;
let markers = [];
const API_URL = 'https://rope-v2-production.up.railway.app/api/occurrences';

document.addEventListener('DOMContentLoaded', () => {
    map = L.map('map').setView([-8.04756, -34.8769], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    fetchOccurrences();

    // Eventos de filtro
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
});

async function fetchOccurrences(params = {}) {
    try {
        const query = new URLSearchParams(params).toString();

        const res = await fetch(`${API_URL}?${query}`, {
            method: 'GET',
            credentials: 'include', // ✅ Permite cookies/session no CORS
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
        const data = await res.json();
        displayOccurrences(data);
    } catch (err) {
        console.error('Erro ao carregar ocorrências:', err);
    }
}

function displayOccurrences(occurrences) {
    // Remove marcadores antigos
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const listContainer = document.getElementById('occurrencesList');
    listContainer.innerHTML = '';

    occurrences.forEach(occ => {
        const [lng, lat] = occ.location.coordinates;

        const marker = L.marker([lat, lng])
            .addTo(map)
            .bindPopup(`<b>${occ.type}</b><br>${occ.description}`);

        markers.push(marker);

        const item = document.createElement('div');
        item.className = 'occurrence-item';
        item.innerHTML = `<strong>${occ.type}</strong><p>${occ.description}</p>`;
        item.addEventListener('click', () => {
            map.setView([lat, lng], 16);
            marker.openPopup();
        });
        listContainer.appendChild(item);
    });
}

function applyFilters() {
    const type = document.getElementById('typeFilter').value;
    const period = document.getElementById('dateFilter').value;
    const radius = document.getElementById('radiusFilter').value;

    const center = map.getCenter();
    const params = { type, period };

    if (radius) {
        params.centerLat = center.lat;
        params.centerLng = center.lng;
        params.radius = radius;
    }

    fetchOccurrences(params);
}

function clearFilters() {
    document.getElementById('typeFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('radiusFilter').value = '';
    fetchOccurrences();
}
