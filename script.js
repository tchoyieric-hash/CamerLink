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
        container.innerHTML = '<p class="no-results" style="grid-column: 1 / -1; text-align: center; color: #666;">Aucune annonce trouvée.</p>';
        return;
    }

    listingsToDisplay.forEach(item => {
        const card = document.createElement('div');
        card.className = 'listing-card';
        card.style.cssText = "background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);";
        card.innerHTML = `
            <span class="card-category" style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${item.category}</span>
            <h3 style="margin: 10px 0 5px 0; font-size: 18px; color: #333;">${item.title}</h3>
            <p class="card-price" style="font-weight: bold; color: #2e7d32; font-size: 16px; margin-bottom: 8px;">${item.price}</p>
            <p class="card-city" style="color: #666; font-size: 14px; margin-bottom: 8px;">📍 ${item.city}</p>
            <p class="card-desc" style="color: #444; font-size: 14px; line-height: 1.4;">${item.description}</p>
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

// 4. Gestion de l'ouverture/fermeture de la modale et de l'ajout d'annonces
function setupModalAndPublish() {
    const openModalBtn = document.getElementById('open-modal-btn');
    const modal = document.getElementById('ad-modal');
    const closeModal = document.getElementById('close-modal');
    const adForm = document.getElementById('ad-form');

    if (openModalBtn && modal) {
        openModalBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (adForm) {
        adForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newAd = {
                id: Date.now(),
                title: document.getElementById('ad-title').value,
                category: document.getElementById('ad-category').value,
                city: document.getElementById('ad-city').value,
                price: document.getElementById('ad-price').value,
                description: document.getElementById('ad-desc').value,
                date: new Date().toISOString().split('T')[0]
            };

            listings.unshift(newAd);
            localStorage.setItem('camerlink_listings', JSON.stringify(listings));

            displayListings(listings);
            modal.style.display = 'none';
            adForm.reset();
            alert('Annonce publiée avec succès !');
        });
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    displayListings(listings);
    setupSearch();
    setupModalAndPublish();
});
