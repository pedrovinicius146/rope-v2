let map; // Variável global para o mapa Leaflet
let markers = []; // Armazena todos os marcadores adicionados no mapa
const API_URL = 'https://rope-v2-production.up.railway.app/api/occurrences'; // URL base da API de ocorrências

// =============================
// Inicialização ao carregar a página
// =============================
document.addEventListener('DOMContentLoaded', () => { // Executa quando o DOM termina de carregar
    // Cria o mapa centrado em Recife (latitude, longitude e zoom 13)
    map = L.map('map').setView([-8.04756, -34.8769], 13);

    // Adiciona camada base do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors' // Crédito obrigatório
    }).addTo(map);

    fetchOccurrences(); // Carrega todas as ocorrências inicialmente

    // Adiciona eventos de clique nos botões de filtro
    document.getElementById('applyFilters').addEventListener('click', applyFilters); // Aplica filtros
    document.getElementById('clearFilters').addEventListener('click', clearFilters); // Limpa filtros
});

// =============================
// Função: buscar ocorrências do backend
// =============================
async function fetchOccurrences(params = {}) {
    try {
        // Converte o objeto "params" em uma string de query (ex: ?type=Roubo&period=24h)
        const query = new URLSearchParams(params).toString();

        // Faz requisição GET para a API, incluindo os parâmetros de filtro (se houver)
        const res = await fetch(`${API_URL}?${query}`, {
            method: 'GET', // Requisição de leitura
            credentials: 'include', // ✅ Inclui cookies/sessões (necessário se backend usa autenticação por cookie)
            headers: {
                'Content-Type': 'application/json' // Informa que a resposta será JSON
            }
        });

        if (!res.ok) throw new Error(`Erro HTTP ${res.status}`); // Caso a resposta não seja 200~299, lança erro
        const data = await res.json(); // Converte resposta JSON para objeto JS
        displayOccurrences(data); // Exibe as ocorrências no mapa e na lista
    } catch (err) {
        console.error('Erro ao carregar ocorrências:', err); // Mostra erro no console
    }
}

// =============================
// Função: exibir ocorrências no mapa e na lista lateral
// =============================
function displayOccurrences(occurrences) {
    // Remove marcadores antigos do mapa
    markers.forEach(m => map.removeLayer(m));
    markers = []; // Limpa o array de marcadores

    // Limpa a lista HTML de ocorrências
    const listContainer = document.getElementById('occurrencesList');
    listContainer.innerHTML = '';

    // Percorre cada ocorrência retornada pelo backend
    occurrences.forEach(occ => {
        const [lng, lat] = occ.location.coordinates; // Extrai longitude e latitude (formato GeoJSON [lng, lat])

        // Cria marcador no mapa para essa ocorrência
        const marker = L.marker([lat, lng])
            .addTo(map) // Adiciona marcador ao mapa
            .bindPopup(`<b>${occ.type}</b><br>${occ.description}`); // Popup com tipo e descrição

        markers.push(marker); // Adiciona o marcador ao array para controle posterior

        // Cria item na lista lateral de ocorrências
        const item = document.createElement('div');
        item.className = 'occurrence-item'; // Classe CSS para estilização
        item.innerHTML = `<strong>${occ.type}</strong><p>${occ.description}</p>`; // Mostra tipo e descrição

        // Ao clicar no item da lista, centraliza o mapa e abre o popup
        item.addEventListener('click', () => {
            map.setView([lat, lng], 16); // Centraliza no marcador com zoom 16
            marker.openPopup(); // Abre o popup da ocorrência
        });

        // Adiciona o item à lista no HTML
        listContainer.appendChild(item);
    });
}

// =============================
// Função: aplicar filtros de tipo, data e raio
// =============================
function applyFilters() {
    // Pega valores dos filtros do formulário
    const type = document.getElementById('typeFilter').value;   // Tipo de ocorrência (ex: "Roubo")
    const period = document.getElementById('dateFilter').value; // Período (ex: "últimas 24h")
    const radius = document.getElementById('radiusFilter').value; // Raio em metros ou km (dependendo da API)

    // Pega o centro atual do mapa (para calcular o raio)
    const center = map.getCenter();
    const params = { type, period }; // Cria objeto de parâmetros básicos

    // Se o usuário definiu um raio, inclui posição e raio nos parâmetros
    if (radius) {
        params.centerLat = center.lat;
        params.centerLng = center.lng;
        params.radius = radius;
    }

    // Chama novamente a API com os filtros aplicados
    fetchOccurrences(params);
}

// =============================
// Função: limpar filtros e recarregar todas as ocorrências
// =============================
function clearFilters() {
    // Reseta campos de filtro no formulário
    document.getElementById('typeFilter').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('radiusFilter').value = '';

    // Recarrega todas as ocorrências (sem filtros)
    fetchOccurrences();
}
