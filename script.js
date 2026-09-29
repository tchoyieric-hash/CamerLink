// Configuration Supabase (assurez-vous que vos clés correspondent bien à votre projet)
const SUPABASE_URL = 'VOTRE_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'VOTRE_SUPABASE_ANON_KEY';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Gestion de la modale et du formulaire
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('adModal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('adForm');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => modal.style.display = 'flex');
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Récupération des valeurs du formulaire
            const newAd = {
                title: document.getElementById('adTitle').value,
                category: document.getElementById('adCategory').value,
                city: document.getElementById('adCity').value,
                price: document.getElementById('adPrice').value,
                description: document.getElementById('adDescription').value
            };

            try {
                // Insertion dans la table Supabase 'listings'
                const { data, error } = await supabaseClient
                    .from('listings')
                    .insert([newAd]);

                if (error) throw error;

                alert('Annonce publiée avec succès !');
                form.reset();
                if (modal) modal.style.display = 'none';
                
                // Recharge les annonces pour afficher la nouvelle
                fetchListings();

            } catch (err) {
                console.error('Erreur détaillée :', err);
                alert('Erreur lors de la publication : ' + (err.message || JSON.stringify(err)));
            }
        });
    }

    // Chargement initial des annonces
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

        const container = document.getElementById('listingsContainer');
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px;">Aucune annonce pour le moment.</p>';
            return;
        }

        container.innerHTML = data.map(ad => `
            <div class="ad-card" style="background: white; padding: 15px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <span class="category-badge" style="background: #eef2ff; color: #4f46e5; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${escapeHtml(ad.category)}</span>
                <h3 style="margin: 10px 0 5px 0; font-size: 18px;">${escapeHtml(ad.title)}</h3>
                <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">${escapeHtml(ad.description)}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; font-weight: bold;">
                    <span style="color: #059669;">${escapeHtml(ad.price)} FCFA</span>
                    <span style="color: #9ca3af; font-size: 13px;">📍 ${escapeHtml(ad.city)}</span>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Erreur lors du chargement des annonces :', err);
    }
}

// Petite fonction de sécurité pour éviter les failles XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}
