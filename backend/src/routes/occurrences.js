const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Occurrence = require('../models/Occurrence');

// Config multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// =======================
// LISTAR OCORRÊNCIAS COM FILTROS
// =======================
router.get('/', async (req, res) => {
  try {
    const { type, period, radius, lat, lng } = req.query;
    let filter = {};

    // Tipo
    if (type) filter.type = type;

    // Período
    if (period) {
      const now = new Date();
      let startDate;
      if (period === '24h') startDate = new Date(now - 24*60*60*1000);
      if (period === '7d') startDate = new Date(now - 7*24*60*60*1000);
      if (period === '30d') startDate = new Date(now - 30*24*60*60*1000);
      if (startDate) filter.createdAt = { $gte: startDate };
    }

    // Raio
    if (radius && lat && lng) {
      filter.location = {
        $geoWithin: { $centerSphere: [[parseFloat(lng), parseFloat(lat)], parseFloat(radius)/6378.1] }
      };
    }

    const occurrences = await Occurrence.find(filter).sort({ createdAt: -1 });
    res.json(occurrences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao buscar ocorrências.' });
  }
});

// =======================
// CRIAR OCORRÊNCIA
// =======================
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { type, description, lat, lng } = req.body;
    if (!type || !description || !lat || !lng) {
      return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }

    const newOccurrence = new Occurrence({
      type,
      description,
      location: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
      photoUrl: req.file ? `/uploads/${req.file.filename}` : null
    });

    await newOccurrence.save();
    res.status(201).json(newOccurrence);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao criar ocorrência.' });
  }
});

module.exports = router;
