// --- CONFIGURATION DATABASE ---
const SUPABASE_URL = 'https://zsviddljpkdumlxivyjhr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdmlkZGxqcGtkdW1seGl2eWpocCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzI3Njc3NzQ2LCJleHAiOjIwNDMyNTM3NDZ9.eJnb6GDLIUiu2I96lS1SfRcC181kgXVCJYMyQjc3WIk';

// Initialisation du client Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- GESTION DES ANNONCES ---

// Fonction pour récupérer et afficher les annonces
async function loadListings(searchQuery = '', selectedCity = '') {
    try {
        let query = supabaseClient
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });

        // Filtrer par ville si sélectionnée
        if (selectedCity && selectedCity !== '') {
            query = query.eq('city', selectedCity);
        }

        const { data, error } = await query;
        if (error) throw error;

        const container = document.getElementById('listings-container');
        if (!container) return;

        container.innerHTML = '';

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-400 py-8 text-xs">Aucune annonce trouvée.</p>';
            return;
        }

        // Filtrer localement par mot-clé si saisi
        const filteredData = data.filter(item => {
            const matchesKeyword = searchQuery === '' || 
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                item.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesKeyword;
        });

        if (filteredData.length === 0) {
            container.innerHTML = '<p class="col-span-full text-center text-gray-400 py-8 text-xs">Aucune annonce ne correspond à votre recherche.</p>';
            return;
        }

        filteredData.forEach(listing => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition';
            card.innerHTML = `
                <div>
                    <span class="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 uppercase tracking-wider">${escapeHtml(listing.category)}</span>
                    <h3 class="font-bold text-gray-800 text-sm mb-1">${escapeHtml(listing.title)}</h3>
                    <p class="text-xs text-gray-500 line-clamp-2 mb-3">${escapeHtml(listing.description)}</p>
                </div>
                <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span class="text-xs font-semibold text-gray-400">📍 ${escapeHtml(listing.city)}</span>
                    <span class="text-sm font-extrabold text-blue-600">${escapeHtml(listing.price)}</span>
                </div>
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
        
        // Recharger la liste
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

// --- INITIALISATION AU CHARGEMENT DE LA PAGE ---
document.addEventListener('DOMContentLoaded', () => {
    // Charger les annonces au démarrage
    loadListings();

    // Gestion de la soumission du formulaire
    const form = document.getElementById('ad-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    // Gestion de l'ouverture et de la fermeture de la modale de publication
    const openBtn = document.getElementById('open-modal-btn');
    const closeBtn = document.getElementById('close-modal-btn');
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

    // Fermer la modale en cliquant en dehors du contenu
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Gestion du bouton de recherche et des filtres
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    const citySelect = document.getElementById('city-select');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const keyword = searchInput ? searchInput.value : '';
            const city = citySelect ? citySelect.value : '';
            loadListings(keyword, city);
        });
    }

    // Recherche automatique lors de la frappe ou du changement de ville (optionnel mais fluide)
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const keyword = searchInput.value;
                const city = citySelect ? citySelect.value : '';
                loadListings(keyword, city);
            }
        });
    }
});
