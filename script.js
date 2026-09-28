// --- CONFIGURATION SUPABASE ---
const SUPABASE_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';

// Initialisation du client Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- GESTION DES ANNONCES ---

// Fonction pour récupérer et afficher les annonces
async function loadListings() {
    try {
        const { data, error } = await supabaseClient
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const container = document.getElementById('listings-container');
        if (!container) return;

        container.innerHTML = '';

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="no-listings">Aucune annonce pour le moment.</p>';
            return;
        }

        data.forEach(listing => {
            const card = document.createElement('div');
            card.className = 'listing-card';
            card.innerHTML = `
                <h3>${escapeHtml(listing.title)}</h3>
                <span class="category">${escapeHtml(listing.category)}</span>
                <p class="city">📍 ${escapeHtml(listing.city)}</p>
                <p class="price">💰 ${escapeHtml(listing.price)} FCFA</p>
                <p class="description">${escapeHtml(listing.description)}</p>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Erreur lors du chargement des annonces :', err.message);
    }
}

// Fonction pour ajouter une nouvelle annonce
async function handleFormSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const city = document.getElementById('city').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;

    try {
        const { error } = await supabaseClient
            .from('listings')
            .insert([{ title, category, city, price, description }]);

        if (error) throw error;

        alert('Annonce publiée avec succès !');
        document.getElementById('listing-form').reset();
        loadListings();
    } catch (err) {
        console.error('Erreur lors de l\'ajout :', err.message);
        alert('Erreur lors de la publication de l\'annonce.');
    }
}

// Sécurité basique pour éviter les failles XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadListings();
    
    const form = document.getElementById('listing-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});
