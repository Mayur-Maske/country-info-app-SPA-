
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Serve the main page
router.get('/', (req, res) => {
    res.render('index');
});

// Endpoint to fetch countries based on search query
router.get('/api/countries', async (req, res) => {
    const { query } = req.query;
    try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countries = response.data.filter(country => 
            country.name.common.toLowerCase().includes(query.toLowerCase())
        );
        res.json(countries);
    } catch (error) {
        console.error('Error fetching countries:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to fetch details of a specific country by name
router.get('/api/countries/:name', async (req, res) => {
    const { name } = req.params;
    try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${name}`);
        const country = response.data[0];
        res.json(country);
    } catch (error) {
        console.error('Error fetching country details:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to fetch GDP data
router.get('/api/gdp/:countryCode', async (req, res) => {
    const { countryCode } = req.params;
    try {
        const response = await axios.get(`http://api.worldbank.org/v2/country/${countryCode}/indicator/NY.GDP.MKTP.CD?format=json&date=2012:2021`);
        const gdpData = response.data[1]; // The data is in the second element of the array
        const gdpGrowth = gdpData.map(entry => ({
            year: entry.date,
            value: entry.value
        })).reverse(); // Ensure the data is in chronological order
        res.json(gdpGrowth);
    } catch (error) {
        console.error('Error fetching GDP data:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;