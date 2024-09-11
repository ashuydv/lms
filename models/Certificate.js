const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    uniqueId: String,
    name: String,
    filename: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', certificateSchema);