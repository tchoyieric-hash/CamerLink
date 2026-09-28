// 1. Liste initiale des annonces (stockées en mémoire / localStorage)
let listings = JSON.parse(localStorage.getItem('camerlink_listings')) || [
    {
        id: 1,
        title: "Toyota Corolla Clean - Climatisée",
        category: "vehicules",
        city: "Yaoundé",
        price: "3 500 000 FCFA",
        description: "Véhicule en très bon état, papiers à jour.",
        date: "2026-09-28"
    },
    {
        id: 2,
        title: "Appartement Meublé Moderne",
        category: "immobilier",
        city: "Douala",
        price: "150 000 FCFA / mois",
        description: "Situé dans un quartier calme et sécurisé.",
        date: "2026-09-27"
    }
];

// 2. Fonction pour afficher les annonces sur la page
function displayListings(listingsToDisplay) {
    const container = document.getElementById('listings-container');
    if (!container) return;

    container.innerHTML = '';

    if (listingsToDisplay.length === 0) {
        container.innerHTML = '<p class="no-results">Aucune annonce trouvée.</p>';
        return;
    }

    listingsToDisplay.forEach(item => {
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.innerHTML = `
            <div class="card-content">
                <span class="card-category">${item.category}</span>
                <h3>${item.title}</h3>
                <p class="card-price">${item.price}</p>
                <p class="card-city">📍 ${item.city}</p>
                <p class="card-desc">${item.description}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. Fonction de recherche et filtrage par mot-clé et ville
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const citySelect = document.getElementById('city-select');
    const searchBtn = document.getElementById('search-btn');

    if (!searchBtn) return;

    searchBtn.addEventListener('click', () => {
        const query = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCity = citySelect ? citySelect.value : '';

        const filtered = listings.filter(item => {
            const matchesQuery = item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query);
            const matchesCity = selectedCity === '' || item.city === selectedCity;
            return matchesQuery && matchesCity;
        });

        displayListings(filtered);
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    displayListings(listings);
    setupSearch();
});
