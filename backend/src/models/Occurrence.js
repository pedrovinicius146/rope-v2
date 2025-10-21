const mongoose = require('mongoose');

const occurrenceSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['Assalto','Acidente','Vandalismo','Incêndio','Buraco na via','Falta de iluminação','Acúmulo de lixo','Alagamento','Outro'] },
    description: { type: String, required: true, minlength: 10, maxlength: 2000 },
    location: {
        type: { type: String, enum: ['Point'], required: true, default: 'Point' },
        coordinates: { type: [Number], required: true } // [lng, lat]
    },
    photoUrl: { type: String, default: '' }
}, { timestamps: true });

occurrenceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Occurrence', occurrenceSchema);
