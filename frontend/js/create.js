// Elementos do formulário
const createForm = document.getElementById('createForm');
const useCurrentLocation = document.getElementById('useCurrentLocation');
const selectOnMap = document.getElementById('selectOnMap');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photoPreview');

// Inicializa mapa para seleção manual (opcional)
let map, marker;
const mapContainer = document.getElementById('map');
if (mapContainer) {
    map = L.map('map').setView([-8.04756, -34.8769], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    map.on('click', e => {
        const { lat, lng } = e.latlng;
        latitudeInput.value = lat.toFixed(6);
        longitudeInput.value = lng.toFixed(6);

        if (marker) {
            marker.setLatLng([lat, lng]);
        } else {
            marker = L.marker([lat, lng], { draggable: true }).addTo(map);
            marker.on('dragend', e => {
                const pos = e.target.getLatLng();
                latitudeInput.value = pos.lat.toFixed(6);
                longitudeInput.value = pos.lng.toFixed(6);
            });
        }
    });
}

// Botão: usar localização atual
useCurrentLocation?.addEventListener('click', () => {
    if (!navigator.geolocation) return alert('Geolocalização não suportada');
    navigator.geolocation.getCurrentPosition(pos => {
        latitudeInput.value = pos.coords.latitude.toFixed(6);
        longitudeInput.value = pos.coords.longitude.toFixed(6);

        if (map) {
            const latlng = [pos.coords.latitude, pos.coords.longitude];
            map.setView(latlng, 16);
            if (marker) marker.setLatLng(latlng);
            else marker = L.marker(latlng, { draggable: true }).addTo(map);
        }
    }, err => alert('Erro ao obter localização: ' + err.message));
});

// Preview de foto
photoInput?.addEventListener('change', () => {
    if (photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = () => {
            photoPreview.innerHTML = `<img src="${reader.result}" alt="Preview" style="max-width: 200px;">`;
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        photoPreview.innerHTML = '';
    }
});

// Envio do formulário
createForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

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
        const res = await fetch('https://rope-v2-backend.up.railway.app/api/occurrences', {
            method: 'POST',
            body: formData
        });

        // Verifica se resposta é JSON
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
        latitudeInput.value = '';
        longitudeInput.value = '';
        photoPreview.innerHTML = '';

        // Remove marcador do mapa
        if (marker && map) {
            map.removeLayer(marker);
            marker = null;
        }

        // Atualiza lista/marcadores se função estiver disponível
        if (typeof fetchOccurrences === 'function') fetchOccurrences();
    } catch (err) {
        alert('❌ ' + err.message);
        console.error(err);
    }
});
