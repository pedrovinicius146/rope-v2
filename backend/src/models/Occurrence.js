const mongoose = require('mongoose');

const OccurrenceSchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  photoUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

OccurrenceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Occurrence', OccurrenceSchema);
