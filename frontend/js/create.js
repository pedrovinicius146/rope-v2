const createForm = document.getElementById('createForm');
const useCurrentLocation = document.getElementById('useCurrentLocation');
const selectOnMap = document.getElementById('selectOnMap');
const latitudeInput = document.getElementById('latitude');
const longitudeInput = document.getElementById('longitude');
const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photoPreview');

useCurrentLocation.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            latitudeInput.value = pos.coords.latitude;
            longitudeInput.value = pos.coords.longitude;
        }, err => alert('Erro ao obter localização: ' + err.message));
    } else {
        alert('Geolocalização não suportada');
    }
});

createForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = Auth.getToken();
    if (!token) return Auth.logout();

    const formData = new FormData();
    formData.append('type', document.getElementById('occurrenceType').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('lat', latitudeInput.value);
    formData.append('lng', longitudeInput.value);
    if (photoInput.files[0]) formData.append('photo', photoInput.files[0]);

    try {
        const res = await fetch('http://localhost:3000/api/occurrences', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Erro ao criar ocorrência');

        alert('Ocorrência registrada com sucesso!');
        createForm.reset();
        latitudeInput.value = '';
        longitudeInput.value = '';
        photoPreview.innerHTML = '';
        fetchOccurrences(); // atualizar mapa/lista
    } catch (err) {
        alert(err.message);
        console.error(err);
    }
});
