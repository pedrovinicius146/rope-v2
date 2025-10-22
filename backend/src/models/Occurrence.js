const mongoose = require('mongoose'); // Importa o Mongoose para definir o schema e o model

// =============================
// Definição do Schema de Ocorrência
// =============================
const OccurrenceSchema = new mongoose.Schema({
  // Tipo de ocorrência (ex: "Roubo", "Acidente", "Incêndio")
  type: { type: String, required: true }, // Obrigatório

  // Descrição detalhada da ocorrência
  description: { type: String, required: true }, // Obrigatório

  // Localização geográfica da ocorrência, armazenada no formato GeoJSON
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' }, // Define tipo de geometria GeoJSON (apenas "Point" permitido)
    coordinates: { type: [Number], required: true } // Array [longitude, latitude]
  },

  // URL (relativa ou absoluta) da foto associada à ocorrência
  photoUrl: { type: String, default: null }, // Não obrigatória — nula se não tiver foto

  // Data/hora de criação da ocorrência
  createdAt: { type: Date, default: Date.now } // Gera automaticamente a data atual
});

// =============================
// Índice geoespacial
// =============================
// Cria índice 2dsphere para permitir consultas geográficas (ex: $geoWithin, $near)
OccurrenceSchema.index({ location: '2dsphere' });

// =============================
// Exporta o modelo para uso no backend
// =============================
module.exports = mongoose.model('Occurrence', OccurrenceSchema); 
// Cria o model 'Occurrence' (coleção 'occurrences' no MongoDB)
