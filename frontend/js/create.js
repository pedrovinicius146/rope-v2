const BACKEND_URL = 'https://rope-v2-production.up.railway.app';

// Elementos do formulário
const createForm = document.getElementById('createForm');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photoPreview');
const occurrencesList = document.getElementById('occurrencesList');

// Inicializa mapa
let map = L.map('map').setView([-8.04756, -34.8769], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker = null;
map.on('click', e => {
  const { lat, lng } = e.latlng;
  latitudeInput.value = lat.toFixed(6);
  longitudeInput.value = lng.toFixed(6);
  if (marker) marker.setLatLng([lat, lng]);
  else {
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on('dragend', e => {
      const pos = e.target.getLatLng();
      latitudeInput.value = pos.lat.toFixed(6);
      longitudeInput.value = pos.lng.toFixed(6);
    });
  }
});

// Preview de foto
photoInput.addEventListener('change', () => {
  if (photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      photoPreview.innerHTML = `<img src="${reader.result}" alt="Preview" style="max-width:200px;">`;
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else photoPreview.innerHTML = '';
});

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
createForm.addEventListener('submit', async e => {
  e.preventDefault();
  const token = Auth.getToken();
  if (!token) return Auth.logout();

  const type = document.getElementById('occurrenceType').value;
  const description = document.getElementById('description').value;
  const lat = latitudeInput.value;
  const lng = longitudeInput.value;

  if (!type || !description || !lat || !lng) return alert('Preencha todos os campos obrigatórios!');

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
    if (contentType && contentType.includes('application/json')) data = await res.json();
    else {
      const text = await res.text();
      console.error('Resposta inesperada do servidor:', text);
      throw new Error('Erro inesperado do servidor.');
    }

    if (!res.ok) throw new Error(data.message || 'Erro ao criar ocorrência');

    alert('✅ Ocorrência registrada com sucesso!');
    createForm.reset();
    photoPreview.innerHTML = '';
    if (marker) { map.removeLayer(marker); marker = null; }

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
