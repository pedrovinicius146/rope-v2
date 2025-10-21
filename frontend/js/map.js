let map;
let markers = [];
const API_URL = 'https://rope-v2-backend.up.railway.app/api/occurrences';

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
        const res = await fetch(`${API_URL}?${query}`);
        const data = await res.json();
        displayOccurrences(data);
    } catch (err) {
        console.error('Erro ao carregar ocorrências:', err);
    }
}

function displayOccurrences(occurrences) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const listContainer = document.getElementById('occurrencesList');
    listContainer.innerHTML = '';

    occurrences.forEach(occ => {
        const marker = L.marker([occ.location.coordinates[1], occ.location.coordinates[0]])
            .addTo(map)
            .bindPopup(`<b>${occ.type}</b><br>${occ.description}`);
        markers.push(marker);

        const item = document.createElement('div');
        item.className = 'occurrence-item';
        item.innerHTML = `<strong>${occ.type}</strong><p>${occ.description}</p>`;
        item.addEventListener('click', () => {
            map.setView([occ.location.coordinates[1], occ.location.coordinates[0]], 16);
            marker.openPopup();
        });
        listContainer.appendChild(item);
    });
}

function applyFilters() {
    const type = document.getElementById('typeFilter').value;
    const period = document.getElementById('dateFilter').value;
    const radius = document.getElementById('radiusFilter').value;

    // Obter centro do mapa como referência
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
