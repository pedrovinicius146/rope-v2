const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Occurrence = require('../models/Occurrence');

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET /api/occurrences?type=&period=&centerLat=&centerLng=&radius=
router.get('/', async (req, res) => {
  try {
    const { type, period, centerLat, centerLng, radius } = req.query;
    const filter = {};

    // Filtro por tipo
    if (type) filter.type = type;

    // Filtro por período
    if (period) {
      let dateFrom = new Date();
      switch (period) {
        case '24h': dateFrom.setHours(dateFrom.getHours() - 24); break;
        case '7d': dateFrom.setDate(dateFrom.getDate() - 7); break;
        case '30d': dateFrom.setDate(dateFrom.getDate() - 30); break;
        default: dateFrom = null;
      }
      if (dateFrom) filter.createdAt = { $gte: dateFrom };
    }

    // Filtro geográfico
    if (centerLat && centerLng && radius) {
      filter.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(centerLng), parseFloat(centerLat)] },
          $maxDistance: parseFloat(radius) * 1000 // km -> metros
        }
      };
    }

    const occurrences = await Occurrence.find(filter).sort({ createdAt: -1 });
    res.json(occurrences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar ocorrências.' });
  }
});

// POST /api/occurrences
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { type, description, lat, lng } = req.body;

    if (!type || !description || !lat || !lng) {
      return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const newOccurrence = new Occurrence({
      type,
      description,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      photoUrl: req.file ? `/uploads/${req.file.filename}` : ''
    });

    const savedOccurrence = await newOccurrence.save();
    res.status(201).json(savedOccurrence);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar ocorrência.' });
  }
});

module.exports = router;
