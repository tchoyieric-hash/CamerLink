const SUPABASE_URL = 'https://lviddptduhaalnxvsykt.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function openModal() {
    const modal = document.getElementById('adModal');
    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('adModal');
    if (modal) modal.classList.add('hidden');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const newAd = {
        title: document.getElementById('adTitle').value,
        description: document.getElementById('adDescription').value,
        price: parseFloat(document.getElementById('adPrice').value),
        image_url: document.getElementById('adImage').value || '',
        category: 'Général',
        city: 'Cameroun'
    };

    try {
        // Correction : Utilisation de la table 'annonces' (à adapter si votre table s'appelle 'listings' dans Supabase)
        const { error } = await supabaseClient
            .from('annonces')
            .insert([newAd]);

        if (error) throw error;

        alert('Annonce publiée avec succès !');
        document.getElementById('adForm').reset();
        closeModal();
        fetchListings();

    } catch (err) {
        console.error('Erreur :', err);
        alert('Erreur lors de la publication : ' + (err.message || JSON.stringify(err)));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchListings();
});

async function fetchListings() {
    const container = document.getElementById('listingsgrid');
    if (!container) return;

    try {
        const { data, error } = await supabaseClient
            .from('annonces')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="text-gray-500 col-span-full text-center py-10">Aucune annonce pour le moment.</p>';
            return;
        }

        container.innerHTML = data.map(ad => `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                ${ad.image_url ? `<img src="${escapeHTML(ad.image_url)}" alt="${escapeHTML(ad.title)}" class="w-full h-48 object-cover">` : `<div class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">Pas d'image</div>`}
                <div class="p-4 flex flex-col flex-grow">
                    <div class="flex justify-between items-start mb-2">
                        <span class="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">${escapeHTML(ad.category || 'Général')}</span>
                        <span class="text-xs text-gray-500">${escapeHTML(ad.city || 'Cameroun')}</span>
                    </div>
                    <h3 class="font-bold text-gray-800 text-lg mb-1">${escapeHTML(ad.title)}</h3>
                    <p class="text-gray-600 text-sm mb-4 flex-grow">${escapeHTML(ad.description)}</p>
                    <div class="mt-auto pt-3 border-t border-gray-50 flex justify-between items-center">
                        <span class="text-green-600 font-bold text-base">${escapeHTML(String(ad.price))} FCFA</span>
                        <span class="text-xs text-gray-400">CamerLink</span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Erreur chargement :', err);
        container.innerHTML = `<p class="text-red-500 col-span-full text-center py-10 font-bold">Erreur de chargement des annonces.</p>`;
    }
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
