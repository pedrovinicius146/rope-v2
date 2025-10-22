// =============================
// create.js – RO-PE
// =============================

// URL base do backend hospedado no Railway
const BACKEND_URL = 'https://rope-v2-production.up.railway.app';

// =============================
// Seleciona elementos do formulário no DOM
// =============================
const createForm = document.getElementById('createForm');      // Formulário principal de criação de ocorrência
const latitudeInput = document.getElementById('latitude');     // Campo de entrada de latitude
const longitudeInput = document.getElementById('longitude');   // Campo de entrada de longitude
const photoInput = document.getElementById('photo');           // Input de arquivo (foto)
const photoPreview = document.getElementById('photoPreview');  // Div onde a imagem de pré-visualização será mostrada
const occurrencesList = document.getElementById('occurrencesList'); // Container onde as ocorrências são listadas

// =============================
// Inicializa o mapa Leaflet
// =============================
const map = L.map('map').setView([-8.04756, -34.8769], 13); // Cria mapa centrado em Recife (lat/long e zoom 13)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { // Camada base com tiles do OpenStreetMap
    attribution: '&copy; OpenStreetMap contributors' // Atribuição de créditos obrigatória
}).addTo(map); // Adiciona a camada ao mapa

let marker = null; // Variável para guardar o marcador atual no mapa

// =============================
// Clique no mapa para selecionar localização
// =============================
map.on('click', e => { // Evento de clique no mapa
    const { lat, lng } = e.latlng; // Extrai latitude e longitude do ponto clicado
    latitudeInput.value = lat.toFixed(6); // Atualiza o input de latitude com 6 casas decimais
    longitudeInput.value = lng.toFixed(6); // Atualiza o input de longitude

    if (marker) { // Se já existe marcador
        marker.setLatLng([lat, lng]); // Move marcador para nova posição
    } else { // Se ainda não existe
        marker = L.marker([lat, lng], { draggable: true }).addTo(map); // Cria marcador arrastável
        marker.on('dragend', e => { // Evento ao terminar de arrastar o marcador
            const pos = e.target.getLatLng(); // Pega a nova posição
            latitudeInput.value = pos.lat.toFixed(6); // Atualiza inputs
            longitudeInput.value = pos.lng.toFixed(6);
        });
    }
});

// =============================
// Pré-visualizar foto selecionada
// =============================
photoInput.addEventListener('change', () => { // Evento ao escolher imagem
    if (photoInput.files[0]) { // Se há arquivo selecionado
        const reader = new FileReader(); // Cria leitor de arquivo
        reader.onload = () => { // Quando leitura terminar
            photoPreview.innerHTML = `<img src="${reader.result}" alt="Preview" style="max-width: 200px;">`; // Mostra preview
        };
        reader.readAsDataURL(photoInput.files[0]); // Lê arquivo como base64 (data URL)
    } else {
        photoPreview.innerHTML = ''; // Limpa preview se nenhum arquivo selecionado
    }
});

// =============================
// Função para buscar ocorrências existentes
// =============================
async function fetchOccurrences() {
    try {
        const token = Auth.getToken(); // Obtém token do usuário logado
        if (!token) return Auth.logout(); // Se não há token, força logout

        const res = await fetch(`${BACKEND_URL}/api/occurrences`, { // Faz GET na rota de ocorrências
            headers: { 'Authorization': `Bearer ${token}` } // Envia token JWT no cabeçalho
        });

        if (!res.ok) { // Se resposta não for 200~299
            const data = await res.json();
            throw new Error(data.message || 'Erro ao buscar ocorrências');
        }

        const data = await res.json(); // Converte resposta JSON
        occurrencesList.innerHTML = ''; // Limpa lista antes de renderizar

        // Percorre cada ocorrência retornada
        data.forEach(occ => {
            const item = document.createElement('div'); // Cria div para a ocorrência
            item.classList.add('occurrence-item'); // Adiciona classe CSS
            item.innerHTML = `
                <h3>${occ.type}</h3> <!-- Tipo de ocorrência -->
                <p>${occ.description}</p> <!-- Descrição -->
                <p>Local: ${occ.location.coordinates[1].toFixed(6)}, ${occ.location.coordinates[0].toFixed(6)}</p> <!-- Lat/Lng -->
                ${occ.photoUrl ? `<img src="${BACKEND_URL}${occ.photoUrl}" style="max-width:200px;">` : ''} <!-- Mostra foto se existir -->
                <hr>
            `;
            occurrencesList.appendChild(item); // Adiciona item à lista
        });

    } catch (err) {
        console.error(err); // Log no console
        alert('❌ ' + err.message); // Mostra erro ao usuário
    }
}

// =============================
// Envio do formulário (criar ocorrência)
// =============================
createForm.addEventListener('submit', async e => {
    e.preventDefault(); // Impede recarregamento da página
    const token = Auth.getToken(); // Obtém token do usuário
    if (!token) return Auth.logout(); // Se não autenticado, redireciona pro login

    // Pega valores dos campos
    const type = document.getElementById('occurrenceType').value;
    const description = document.getElementById('description').value;
    const lat = latitudeInput.value;
    const lng = longitudeInput.value;

    // Validação básica
    if (!type || !description || !lat || !lng) {
        return alert('Preencha todos os campos obrigatórios!');
    }

    // Cria objeto FormData para enviar texto + arquivo
    const formData = new FormData();
    formData.append('type', type);
    formData.append('description', description);
    formData.append('lat', lat);
    formData.append('lng', lng);
    if (photoInput.files[0]) formData.append('photo', photoInput.files[0]); // Adiciona foto se houver

    try {
        const res = await fetch(`${BACKEND_URL}/api/occurrences`, { // Faz POST para criar ocorrência
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // Autenticação via token
            body: formData // Envia dados do formulário
        });

        // Verifica tipo de resposta
        const contentType = res.headers.get('content-type');
        let data = {};
        if (contentType && contentType.includes('application/json')) {
            data = await res.json(); // Se for JSON, converte
        } else {
            const text = await res.text(); // Caso contrário, lê como texto
            console.error('Resposta inesperada do servidor:', text);
            throw new Error('Erro inesperado do servidor.');
        }

        if (!res.ok) throw new Error(data.message || 'Erro ao criar ocorrência'); // Erro se status != 2xx

        // Sucesso
        alert('✅ Ocorrência registrada com sucesso!');
        createForm.reset(); // Limpa o formulário
        photoPreview.innerHTML = ''; // Remove preview
        if (marker) map.removeLayer(marker); // Remove marcador do mapa

        // Atualiza lista de ocorrências
        fetchOccurrences();

    } catch (err) {
        alert('❌ ' + err.message); // Mostra erro ao usuário
        console.error(err);
    }
});

// =============================
// Carrega ocorrências ao abrir a página
// =============================
document.addEventListener('DOMContentLoaded', () => { // Quando DOM terminar de carregar
    if (!Auth.isAuthenticated()) window.location.href = 'login.html'; // Se não estiver logado, redireciona
    fetchOccurrences(); // Busca e exibe ocorrências do usuário
});
