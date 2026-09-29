// Configuration Supabase
const SUPABASE_URL = 'https://lviddptduhaalnxvsykt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonctions globales pour la modale (appelées depuis le HTML)
function openModal() {
    const modal = document.getElementById('adModal');
    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('adModal');
    if (modal) modal.classList.add('hidden');
}

// Gestion de la soumission du formulaire
async function handleFormSubmit(e) {
    e.preventDefault();

    // Récupération des valeurs du formulaire
    const newAd = {
        title: document.getElementById('adTitle').value,
        description: document.getElementById('adDescription').value,
        price: document.getElementById('adPrice').value,
        image_url: document.getElementById('adImage').value || '',
        category: 'Général', // Valeur par défaut
        city: 'Cameroun'     // Valeur par défaut
    };

    try {
        // Insertion dans la table Supabase 'listings'
        const { data, error } = await supabaseClient
            .from('listings')
            .insert([newAd]);

        if (error) throw error;

        alert('Annonce publiée avec succès !');
        document.getElementById('adForm').reset();
        closeModal();

        // Recharge les annonces pour afficher la nouvelle
        fetchListings();

    } catch (err) {
        console.error('Erreur détaillée :', err);
        alert('Erreur lors de la publication : ' + (err.message || JSON.stringify(err)));
    }
}

// Chargement initial des annonces au démarrage
document.addEventListener('DOMContentLoaded', () => {
    fetchListings();
});

// Fonction pour récupérer et afficher les annonces depuis Supabase
async function fetchListings() {
    try {
        const { data, error } = await supabaseClient
            .from('listings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const container = document.getElementById('listingsGrid');
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-10">Aucune annonce pour le moment.</p>';
            return;
        }

        container.innerHTML = data.map(ad => `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                ${ad.image_url ? `<img src="${escapeHtml(ad.image_url)}" alt="${escapeHtml(ad.title)}" class="w-full h-48 object-cover" onerror="this.style.display='none'">` : '<div class="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Aucune image</div>'}
                <div class="p-4 flex flex-col flex-grow">
                    <div class="flex justify-between items-start mb-2">
                        <span class="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-md">${escapeHtml(ad.category || 'Général')}</span>
                        <span class="text-xs text-gray-500">📍 ${escapeHtml(ad.city || 'Cameroun')}</span>
                    </div>
                    <h3 class="font-bold text-gray-900 text-lg mb-1">${escapeHtml(ad.title)}</h3>
                    <p class="text-gray-600 text-sm mb-4 flex-grow">${escapeHtml(ad.description)}</p>
                    <div class="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                        <span class="text-green-600 font-bold text-base">${escapeHtml(String(ad.price))} FCFA</span>
                        <span class="text-xs text-gray-400">CamerLink MVP</span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Erreur lors du chargement des annonces :', err);
    }
}

// Fonction de sécurité anti-XSS
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
