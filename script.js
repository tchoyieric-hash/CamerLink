const SUPABASE_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const VILLES = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Bertoua', 'Limbé', 'Kribi', 'Maroua', 'Ebolowa'];
let toutes = [];

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function openModal() { document.getElementById('modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('modal').classList.add('hidden'); }

function remplirVilles() {
    const options = VILLES.map(v => `<option>${v}</option>`).join('');
    document.getElementById('adCity').innerHTML = options;
    document.getElementById('cityFilter').innerHTML = '<option value="">Toutes les villes</option>' + options;
}

function photoEnTexte(file, max = 800) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const r = Math.min(1, max / Math.max(img.width, img.height));
            const c = document.createElement('canvas');
            c.width = Math.round(img.width * r);
            c.height = Math.round(img.height * r);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            resolve(c.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => reject(new Error('Image illisible'));
        img.src = url;
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Publication...';

    try {
        const file = document.getElementById('adImage').files[0];
        const imageUrl = file ? await photoEnTexte(file) : null;

        const annonce = {
            title: document.getElementById('adTitle').value.trim(),
            category: document.getElementById('adCategory').value,
            city: document.getElementById('adCity').value,
            price: parseFloat(document.getElementById('adPrice').value),
            description: document.getElementById('adDescription').value.trim(),
            contact: document.getElementById('adContact').value.trim() || null,
            image_url: imageUrl
        };

        const { error } = await supabaseClient.from('annonces').insert([annonce]);
        if (error) throw error;
        alert('Annonce publiée avec succès !');
        document.getElementById('adForm').reset();
        closeModal();
        await fetchListings();
    } catch (err) {
        console.error('Erreur :', err);
        alert('Erreur lors de la publication : ' + (err.message || JSON.stringify(err)));
    } finally {
        btn.disabled = false;
        btn.textContent = 'Valider la publication';
    }
}

async function fetchListings() {
    const box = document.getElementById('listings');
    try {
        const { data, error } = await supabaseClient
            .from('annonces').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        toutes = data || [];
        applyFilters();
    } catch (err) {
        console.error('Erreur chargement :', err);
        box.innerHTML = '<p class="msg">Impossible de charger les annonces. Vérifiez votre connexion et réessayez.</p>';
    }
}

function applyFilters() {
    const q = document.getElementById('q').value.trim().toLowerCase();
    const ville = document.getElementById('cityFilter').value;
    const liste = toutes.filter(a =>
        (!ville || a.city === ville) &&
        (!q || `${a.title} ${a.description} ${a.category}`.toLowerCase().includes(q))
    );
    afficher(liste);
}

function resetFilters() {
    document.getElementById('q').value = '';
    document.getElementById('cityFilter').value = '';
    applyFilters();
}

function afficher(liste) {
    const box = document.getElementById('listings');
    if (liste.length === 0) {
        box.innerHTML = '<p class="msg">Aucune annonce trouvée. Publiez la première !</p>';
        return;
    }
    box.innerHTML = liste.map(a => {
        const tel = (a.contact || '').replace(/[^0-9+]/g, '');
        const photo = a.image_url && (a.image_url.startsWith('data:image/') || a.image_url.startsWith('https://'));
        return `
        <article class="card">
            ${photo ? `<img src="${escapeHTML(a.image_url)}" alt="${escapeHTML(a.title)}" onerror="this.remove()">` : ''}
            <div class="top">
                <span class="cat">${escapeHTML(a.category || 'Autres')}</span>
                <span class="ok">Publié</span>
            </div>
            <h3>${escapeHTML(a.title)}</h3>
            <p class="desc">${escapeHTML(a.description)}</p>
            ${tel ? `<a class="contact" href="https://wa.me/${tel.replace('+', '')}" target="_blank" rel="noopener">Contacter sur WhatsApp</a>` : ''}
            <div class="foot">
                <span class="city">📍 ${escapeHTML(a.city || 'Cameroun')}</span>
                <span class="price">${Number(a.price || 0).toLocaleString('fr-FR')} FCFA</span>
            </div>
        </article>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    remplirVilles();
    document.getElementById('q').addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
    fetchListings();
});
