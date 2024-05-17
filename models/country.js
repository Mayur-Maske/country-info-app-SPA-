const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
    name: String,
    capital: String,
    population: Number,
    languages: [String],
    latlng: [Number],
    borders: [String],
    gdpGrowth: [Number]
});

module.exports = mongoose.model('Country', countrySchema);