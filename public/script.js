
const searchInput = document.getElementById('search');
const dropdown = document.getElementById('dropdown');
const capital = document.getElementById('capital');
const population = document.getElementById('population');
const languages = document.getElementById('languages');
const neighborList = document.getElementById('neighbor-list');
const chartContainer = document.getElementById('chart');
let map;

// Initialize the map
function initializeMap(lat, lng) {
    if (map) {
        map.setView([lat, lng], 5);
    } else {
        map = L.map('map').setView([lat, lng], 5);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
}

// Fetch countries data
async function fetchCountries(query) {
    const response = await fetch(`/api/countries?query=${query}`);
    const countries = await response.json();
    return countries;
}

// Fetch country details
async function fetchCountryDetails(name) {
    const response = await fetch(`/api/countries/${name}`);
    const country = await response.json();
    return country;
}

// Fetch GDP data
async function fetchGDPData(countryCode) {
    const response = await fetch(`/api/gdp/${countryCode}`);
    const gdpData = await response.json();
    return gdpData;
}

// Display country details
async function displayCountryDetails(country) {
    capital.textContent = country.capital ? country.capital[0] : 'N/A';
    population.textContent = country.population ? country.population.toLocaleString() : 'N/A';
    languages.textContent = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
    
    // Initialize map
    const { latlng } = country;
    if (latlng) {
        initializeMap(latlng[0], latlng[1]);
    } else {
        console.error('Latitude and Longitude not available for this country.');
    }

    // Fetch and display GDP data
    const gdpData = await fetchGDPData(country.cca2); // cca2 is the 2-letter country code
    displayGDPChart(gdpData);

    // Fetch neighboring countries
    const neighbors = await fetchNeighbors(country.borders);
    neighborList.innerHTML = '';
    if (neighbors.length > 0) {
        neighbors.forEach(neighbor => {
            const li = document.createElement('li');
            li.textContent = neighbor.name.common;
            neighborList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No neighboring countries';
        neighborList.appendChild(li);
    }
}

// Fetch neighbors
async function fetchNeighbors(codes) {
    if (!codes || codes.length === 0) return [];
    const response = await fetch(`https://restcountries.com/v3.1/alpha?codes=${codes.join(',')}`);
    const neighbors = await response.json();
    return neighbors;
}

// Display GDP chart
function displayGDPChart(data) {
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(entry => entry.year),
            datasets: [{
                label: 'GDP Growth',
                data: data.map(entry => entry.value),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Event listener for search input
searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    if (query.length < 2) {
        dropdown.innerHTML = '';
        return;
    }

    const countries = await fetchCountries(query);
    dropdown.innerHTML = '';
    countries.forEach(country => {
        const div = document.createElement('div');
        div.textContent = country.name.common;
        div.addEventListener('click', async () => {
            dropdown.innerHTML = '';
            searchInput.value = country.name.common;
            const countryDetails = await fetchCountryDetails(country.name.common);
            displayCountryDetails(countryDetails);
        });
        dropdown.appendChild(div);
    });
});