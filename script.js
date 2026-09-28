 // CONFIGURATION SUPABASE ...
const SUPABASE_URL = 'https://zvviddipduhueislvvykr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2dmlkZGlwZHVodWVpc2x2dmlrciIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzI3Njg2NTc5LCJleHAiOjIwNDMyNDY1Nzl9.jvIskwern5l9jQv27rKq9aR91XlM...'; // (garde ta clé complète actuelle)

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
                <p class="price">💰 ${escapeHtml(String(listing.price))} FCFA</p>
                <p class="description">${escapeHtml(listing.description)}</p>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error('Erreur lors du chargement des annonces :', err.message);
    }
}

// Fonction pour ajouter une nouvelle annonce (correspondant aux IDs du HTML : ad-title, ad-category, ad-city, ad-price, ad-desc)
async function handleFormSubmit(event) {
    event.preventDefault();

    const title = document.getElementById('ad-title').value;
    const category = document.getElementById('ad-category').value;
    const city = document.getElementById('ad-city').value;
    const price = document.getElementById('ad-price').value;
    const description = document.getElementById('ad-desc').value;

    try {
        const { error } = await supabaseClient
            .from('listings')
            .insert([{ title, category, city, price, description }]);

        if (error) throw error;

        alert('Annonce publiée avec succès !');
        document.getElementById('ad-form').reset();
        
        // Fermer la modale après publication
        document.getElementById('ad-modal').style.display = 'none';
        
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

    const form = document.getElementById('ad-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Gestion de l'ouverture et la fermeture de la modale de publication
    const openBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.getElementById('close-modal');
    const modal = document.getElementById('ad-modal');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
});
