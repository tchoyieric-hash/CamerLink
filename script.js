// ==========================================
// CONFIGURATION SUPABASE (À adapter si besoin)
// ==========================================
const SUPABASE_URL = 'VOTRE_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'VOTRE_SUPABASE_ANON_KEY';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let toutes = [];

// Charger les annonces au démarrage de la page
document.addEventListener('DOMContentLoaded', () => {
  fetchListings();
});

// ==========================================
// COMPRESSION D'IMAGE EN TEXTE
// ==========================================
function photoEnTexte(file, max = 800) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > max || h > max) {
        if (w > h) { h = Math.round(h * max / w); w = max; }
        else { w = Math.round(w * max / h); h = max; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible')); };
    img.src = url;
  });
}

// ==========================================
// PUBLICATION D'UNE ANNONCE (Libre, sans connexion)
// ==========================================
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const btn = document.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Publication en cours...';
  }

  try {
    const fileInput = document.getElementById('adImageFile');
    let imageUrl = document.getElementById('adImage').value.trim() || null;

    if (fileInput && fileInput.files && fileInput.files[0]) {
      imageUrl = await photoEnTexte(fileInput.files[0]);
    }

    const annonce = {
      title: document.getElementById('adTitle').value.trim(),
      category: document.getElementById('adCategory').value,
      city: document.getElementById('adCity').value,
      price: parseFloat(document.getElementById('adPrice').value),
      description: document.getElementById('adDescription').value.trim(),
      contact: document.getElementById('adContact').value.trim() || null,
      image_url: imageUrl
    };

    const { error } = await supabaseClient
      .from('annonces')
      .insert([annonce]);

    if (error) throw error;

    alert('Annonce publiée avec succès !');
    document.getElementById('adForm').reset();
    closePublish();
    await fetchListings();

  } catch (error) {
    console.error('Erreur publication :', error);
    alert('Erreur lors de la publication : ' + (error.message || 'Vérifiez les champs'));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Valider la publication';
    }
  }
}

// ==========================================
// CHARGER LES ANNONCES DEPUIS SUPABASE
// ==========================================
async function fetchListings() {
  const box = document.getElementById('listings');
  if (!box) return;

  try {
    const { data, error } = await supabaseClient
      .from('annonces')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    toutes = data || [];
    applyFilters();

  } catch (error) {
    console.error('Erreur chargement :', error);
    box.innerHTML = '<p style="color:red; text-align:center;">Impossible de charger les annonces. Vérifiez votre connexion.</p>';
  }
}

// ==========================================
// FILTRES DE RECHERCHE ET VILLE
// ==========================================
function applyFilters() {
  const qInput = document.getElementById('q');
  const cityInput = document.getElementById('cityFilter');

  const q = qInput ? qInput.value.trim().toLowerCase() : '';
  const ville = cityInput ? cityInput.value : '';

  const liste = toutes.filter(a => {
    const texte = (a.title + ' ' + a.description + ' ' + a.category).toLowerCase();
    const villeOK = !ville || a.city === ville;
    const rechercheOK = !q || texte.includes(q);
    return villeOK && rechercheOK;
  });

  afficher(liste);
}

function resetFilters() {
  if (document.getElementById('q')) document.getElementById('q').value = '';
  if (document.getElementById('cityFilter')) document.getElementById('cityFilter').value = '';
  applyFilters();
}

// ==========================================
// AFFICHAGE DES CARTES DANS LE HTML
// ==========================================
function afficher(liste) {
  const box = document.getElementById('listings');
  if (!box) return;

  if (!liste.length) {
    box.innerHTML = '<p style="text-align:center; grid-column: 1/-1; color:#64748b; padding:20px;">Aucune annonce trouvée.</p>';
    return;
  }

  box.innerHTML = liste.map(a => {
    const photo = a.image_url && (a.image_url.startsWith('data:image') || a.image_url.startsWith('https')) 
      ? a.image_url 
      : 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';

    const prixFormat = Number(a.price || 0).toLocaleString('fr-FR');
    const contactWhatsApp = a.contact ? `https://wa.me/237${a.contact.replace(/\D/g, '')}` : '#';

    return `
      <article class="card">
        <img src="${photo}" alt="${escapeHTML(a.title)}" onerror="this.src='https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'">
        <div class="card-body">
          <div class="top">
            <span class="cat">${escapeHTML(a.category || 'Autres')}</span>
            <span class="status">Disponible</span>
          </div>
          <h3>${escapeHTML(a.title)}</h3>
          <p class="desc">${escapeHTML(a.description || '')}</p>
          ${a.contact ? `<a href="${contactWhatsApp}" target="_blank" class="contact">Contacter sur WhatsApp</a>` : ''}
          <div class="foot">
            <span class="city">${escapeHTML(a.city || 'Cameroun')}</span>
            <span class="price">${prixFormat} FCFA</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
