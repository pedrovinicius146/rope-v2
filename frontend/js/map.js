// Classe para gerenciar o mapa
class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.userMarker = null;
        this.selectingLocation = false;
        this.tempMarker = null;
    }

    init() {
        // Coordenadas de Olinda, PE (centro padrão)
        const defaultLat = -8.0089;
        const defaultLng = -34.8553;

        // Inicializar mapa
        this.map = L.map('map').setView([defaultLat, defaultLng], 13);

        // Adicionar camada de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Tentar obter localização do usuário
        this.getUserLocation();

        return this;
    }

    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Mover mapa para localização do usuário
                    this.map.setView([lat, lng], 14);

                    // Adicionar marcador do usuário
                    this.userMarker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            className: 'user-location-marker',
                            html: '📍',
                            iconSize: [30, 30]
                        })
                    }).addTo(this.map).bindPopup('Você está aqui');
                },
                (error) => {
                    console.warn('Erro ao obter localização:', error);
                }
            );
        }
    }

    addOccurrence(occurrence) {
        const [lng, lat] = occurrence.location.coordinates;
        
        // Escolher emoji baseado no tipo
        const emoji = this.getTypeEmoji(occurrence.type);

        const marker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'occurrence-marker',
                html: emoji,
                iconSize: [30, 30]
            })
        }).addTo(this.map);

        // Popup com informações básicas
        const popupContent = `
            <div class="marker-popup">
                <h3>${occurrence.type}</h3>
                <p>${occurrence.description.substring(0, 100)}...</p>
                <small>${new Date(occurrence.createdAt).toLocaleString('pt-BR')}</small>
                <br>
                <button onclick="viewOccurrenceDetails('${occurrence._id}')" class="btn btn-primary btn-small">
                    Ver Detalhes
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);

        this.markers.push({ id: occurrence._id, marker });
    }

    clearMarkers() {
        this.markers.forEach(({ marker }) => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    getTypeEmoji(type) {
        const emojis = {
            'Assalto': '🚨',
            'Acidente': '🚗',
            'Vandalismo': '💥',
            'Incêndio': '🔥',
            'Buraco na via': '🕳️',
            'Falta de iluminação': '💡',
            'Acúmulo de lixo': '🗑️',
            'Alagamento': '🌊',
            'Outro': '⚠️'
        };
        return emojis[type] || '📌';
    }

    enableLocationSelection(callback) {
        this.selectingLocation = true;
        this.map.getContainer().style.cursor = 'crosshair';

        // Remover marcador temporário anterior
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
        }

        const clickHandler = (e) => {
            const { lat, lng } = e.latlng;

            // Adicionar marcador temporário
            if (this.tempMarker) {
                this.map.removeLayer(this.tempMarker);
            }

            this.tempMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'temp-marker',
                    html: '📍',
                    iconSize: [30, 30]
                })
            }).addTo(this.map);

            this.selectingLocation = false;
            this.map.getContainer().style.cursor = '';
            this.map.off('click', clickHandler);

            callback(lat, lng);
        };

        this.map.on('click', clickHandler);
    }

    removeTempMarker() {
        if (this.tempMarker) {
            this.map.removeLayer(this.tempMarker);
            this.tempMarker = null;
        }
    }

    centerOnOccurrence(lat, lng, zoom = 16) {
        this.map.setView([lat, lng], zoom);
    }
}

// Exportar para uso global
window.MapManager = MapManager;