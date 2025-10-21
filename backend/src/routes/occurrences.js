const express = require('express');
const router = express.Router();
const Occurrence = require('../models/Occurrence');

// GET /api/occurrences?type=&period=&centerLat=&centerLng=&radius=
router.get('/', async (req, res) => {
    try {
        const { type, period, centerLat, centerLng, radius } = req.query;
        const filter = {};

        // Tipo
        if (type) filter.type = type;

        // Período
        if (period) {
            let dateFrom = new Date();
            switch (period) {
                case '24h':
                    dateFrom.setHours(dateFrom.getHours() - 24);
                    break;
                case '7d':
                    dateFrom.setDate(dateFrom.getDate() - 7);
                    break;
                case '30d':
                    dateFrom.setDate(dateFrom.getDate() - 30);
                    break;
                default:
                    dateFrom = null;
            }
            if (dateFrom) filter.createdAt = { $gte: dateFrom };
        }

        // Raio geográfico
        if (centerLat && centerLng && radius) {
            filter.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(centerLng), parseFloat(centerLat)]
                    },
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

module.exports = router;
