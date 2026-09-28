// --- CONFIGURATION SUPABASE ---
const SUPABASE_URL = 'VOTRE_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'VOTRE_SUPABASE_ANON_KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let listings = [];

// 1. Récupérer les annonces depuis Supabase
async function fetchListings() {
    const { data, error } = await supabaseClient
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erreur lors du chargement des annonces:', error);
        return;
    }

    listings = data || [];
    displayListings(listings);
}

// 2. Afficher les annonces sur la page
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
        card.style.cssText = "background: #fff; border: 1px solid #eaeaea; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);";
        card.innerHTML = `
            <span class="card-category" style="background: #e8f0fe; color: #1a73e8; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${item.category}</span>
            <h3 style="margin: 10px 0 8px 0; font-size: 17px; color: #222;">${item.title}</h3>
            <p class="card-price" style="font-weight: 800; color: #2e7d32; font-size: 18px; margin-bottom: 10px;">${item.price}</p>
            <p class="card-city" style="color: #666; font-size: 13px; margin-bottom: 12px; font-weight: 500;">📍 ${item.city}</p>
            <p class="card-desc" style="color: #555; font-size: 14px; line-height: 1.5; border-top: 1px solid #f1f3f4; padding-top: 10px;">${item.description}</p>
        `;
        container.appendChild(card);
    });
}

// 3. Fonction de recherche et filtrage
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

// 4. Gestion de la modale et enregistrement vers Supabase
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
        adForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newAd = {
                title: document.getElementById('ad-title').value,
                category: document.getElementById('ad-category').value,
                city: document.getElementById('ad-city').value,
                price: document.getElementById('ad-price').value,
                description: document.getElementById('ad-desc').value
            };

            const { error } = await supabaseClient.from('listings').insert([newAd]);

            if (error) {
                console.error('Erreur lors de l\'insertion:', error);
                alert('Erreur lors de la publication de l\'annonce.');
                return;
            }

            await fetchListings();
            modal.style.display = 'none';
            adForm.reset();
            alert('Annonce publiée avec succès sur Supabase !');
        });
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    fetchListings();
    setupSearch();
    setupModalAndPublish();
});
