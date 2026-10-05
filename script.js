const SUPABASE_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const VILLES = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Bertoua', 'Limbé', 'Kribi', 'Maroua', 'Ebolowa'];
const PAGE = 24;
const COLONNES = 'id,title,category,city,price,description,contact,image_url,user_id,created_at';
let annonces = [];
let page = 0;
let authMode = 'login';
let currentUser = null;
let timer = null;

const $ = id => document.getElementById(id);
const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

/* ---------- MODALES ---------- */
const openModal = () => $('modal').classList.remove('hidden');
const closeModal = () => $('modal').classList.add('hidden');
const closeAuthModal = () => $('authModal').classList.add('hidden');
const openUserModal = () => $('userModal').classList.remove('hidden');
const closeUserModal = () => $('userModal').classList.add('hidden');

function openPublish() {
    if (!currentUser) {
        openAuthModal('Connectez-vous pour publier une annonce ou proposer vos services.');
        return;
    }
    const contact = $('adContact');
    if (!contact.value) contact.value = ((currentUser.user_metadata || {}).phone || '').replace('+237', '');
    openModal();
}

/* ---------- AUTHENTIFICATION PRO ---------- */
function renderAuth(info = '') {
    const login = authMode === 'login';
    document.querySelector('#authModal .sheet').innerHTML = `
        <div class="sheet-header">
            <h3>${login ? 'Connexion Espace Pro' : 'Création de compte'}</h3>
            <button class="close" onclick="closeAuthModal()" aria-label="Fermer">×</button>
        </div>
        <div class="auth-logo">CamerLink</div>
        <p class="auth-subtitle">${login ? 'Accédez à votre compte avec votre numéro' : 'Rejoignez le réseau des artisans et vendeurs'}</p>
        ${info ? `<p class="msg" style="color:var(--primary);margin:0 0 12px">${escapeHTML(info)}</p>` : ''}
        <form onsubmit="authSubmit(event)">
            <div class="form-group"><label for="phoneNumber">Numéro de téléphone</label>
                <div class="phone-prefix"><span>🇨🇲 +237</span>
                <input id="phoneNumber" type="tel" inputmode="tel" maxlength="17" placeholder="6XXXXXXXX" required></div></div>
            <div class="form-group"><label for="authPassword">Mot de passe</label>
                <input id="authPassword" type="password" minlength="8" placeholder="Au moins 8 caractères" autocomplete="${login ? 'current-password' : 'new-password'}" required></div>
            ${login ? '' : `<div class="form-group"><label for="authPassword2">Confirmer le mot de passe</label>
                <input id="authPassword2" type="password" minlength="8" placeholder="Répétez le mot de passe" autocomplete="new-password" required></div>`}
            <button id="authSubmitBtn" class="btn-ok" type="submit">${login ? 'Se connecter' : 'Créer mon compte pro'}</button>
        </form>
        <p id="authMessage" class="msg" role="alert"></p>
        <button type="button" style="background:none;color:var(--primary);margin-top:16px;width:100%;font-weight:700;" onclick="toggleAuthMode()">
            ${login ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}</button>
        <div class="security">
            <span>🔐</span>
            <div>Votre numéro sert uniquement à sécuriser votre accès et faciliter les contacts avec vos clients.</div>
        </div>`;
}

function openAuthModal(info) {
    authMode = 'login';
    renderAuth(typeof info === 'string' ? info : '');
    $('authModal').classList.remove('hidden');
}
function toggleAuthMode() { authMode = authMode === 'login' ? 'signup' : 'login'; renderAuth(); }

function normaliserNumero(raw) {
    let d = String(raw || '').replace(/\D/g, '');
    if (d.startsWith('00237')) d = d.slice(5);
    else if (d.startsWith('237') && d.length === 12) d = d.slice(3);
    return d;
}

async function authSubmit(e) {
    e.preventDefault();
    const msg = $('authMessage'), btn =$('authSubmitBtn');
    const num = normaliserNumero($('phoneNumber').value);
    const password = $('authPassword').value;
    msg.style.color = '#dc2626';
    msg.textContent = '';

    if (!/^6\d{8}$/.test(num)) { msg.textContent = 'Entrez un numéro valide à 9 chiffres (ex : 6XXXXXXXX).'; return; }
    if (password.length < 8) { msg.textContent = 'Le mot de passe doit contenir au moins 8 caractères.'; return; }
    if (authMode === 'signup' && $('authPassword2').value !== password) {
        msg.textContent = 'Les deux mots de passe ne sont pas identiques.'; return;
    }

    const email = `237${num}@camerlink.app`;
    const texte = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Veuillez patienter...';
    try {
        const res = authMode === 'signup'
            ? await supabaseClient.auth.signUp({ email, password, options: { data: { phone: '+237' + num } } })
            : await supabaseClient.auth.signInWithPassword({ email, password });
        if (res.error) throw res.error;
        if (!res.data.session) {
            msg.textContent = 'Compte créé. Réessayez de vous connecter dans un instant.';
            return;
        }
        closeAuthModal();
        majInterfaceUtilisateur(res.data.user);
        fetchListings(true);
    } catch (err) {
        console.error('Auth :', err);
        const m = (err.message || '').toLowerCase();
        msg.textContent = m.includes('invalid login') ? 'Numéro ou mot de passe incorrect.'
            : m.includes('already') ? 'Ce numéro est déjà inscrit. Connectez-vous.'
            : m.includes('rate limit') ? 'Trop de tentatives. Réessayez dans quelques minutes.'
            : "Impossible de continuer pour le moment. Réessayez dans un instant.";
    } finally {
        btn.disabled = false;
        btn.textContent = texte;
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    closeUserModal();
    majInterfaceUtilisateur(null);
    fetchListings(true);
}

function majInterfaceUtilisateur(user) {
    currentUser = user;
    $('loginBtn').classList.toggle('hidden', !!user);
    $('userBtn').classList.toggle('hidden', !user);$('accountPhone').textContent = (user && user.user_metadata && user.user_metadata.phone) || 'Utilisateur CamerLink';
}

async function verifierSession() {
    try {
        const { data } = await supabaseClient.auth.getSession();
        majInterfaceUtilisateur(data && data.session ? data.session.user : null);
    } catch (err) { console.error('Session :', err); }
}

/* ---------- GESTION DES PHOTOS (COMPRESSION HAUTE PERFORMANCE) ---------- */
function apercuPhoto(input) {
    const file = input.files && input.files[0];
    $('photoName').textContent = file ? file.name : '';
    const img = $('photoPreview');
    img.style.display = file ? 'block' : 'none';
    if (file) img.src = URL.createObjectURL(file);
}

function reduirePhoto(file, max = 1024) {
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
            c.toBlob(b => b ? resolve(b) : reject(new Error('Image illisible')), 'image/jpeg', 0.8);
        };
        img.onerror = () => reject(new Error('Image illisible'));
        img.src = url;
    });
}

/* ---------- ANNONCES ET SERVICES ---------- */
function remplirVilles() {
    const opts = VILLES.map(v => `<option>${v}</option>`).join('');
    $('adCity').innerHTML = opts;
    $('cityFilter').innerHTML = '<option value="">Toutes les villes</option>' + opts;
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!currentUser) { closeModal(); openAuthModal('Votre session a expiré. Reconnectez-vous.'); return; }
    const btn = $('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Publication en cours...';
    try {
        let imageUrl = null;
        const file = $('adImage').files[0];
        if (file) {
            const blob = await reduirePhoto(file);
            const chemin = `${currentUser.id}/${Date.now()}.jpg`;
            const up = await supabaseClient.storage.from('annonces').upload(chemin, blob, { contentType: 'image/jpeg' });
            if (up.error) throw up.error;
            imageUrl = supabaseClient.storage.from('annonces').getPublicUrl(chemin).data.publicUrl;
        }
        const { error } = await supabaseClient.from('annonces').insert([{
            title: $('adTitle').value.trim(),
            category: $('adCategory').value,
            city: $('adCity').value,
            price: parseFloat($('adPrice').value),
            description: $('adDescription').value.trim(),
            contact: $('adContact').value.trim() || null,
            image_url: imageUrl
        }]);
        if (error) throw error;
        $('adForm').reset();
        apercuPhoto($('adImage'));
        closeModal();
        await fetchListings(true);
    } catch (err) {
        console.error('Publication :', err);
        alert("La publication a échoué. Vérifiez votre connexion et les champs, puis réessayez.");
    } finally {
        btn.disabled = false;
        btn.textContent = 'Valider et publier';
    }
}

async function supprimerAnnonce(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette annonce ?')) return;
    const { error } = await supabaseClient.from('annonces').delete().eq('id', id);
    if (error) { console.error(error); alert('Suppression impossible pour le moment.'); return; }
    fetchListings(true);
}

async function fetchListings(reset = false) {
    const box = $('listings');
    if (reset) { page = 0; annonces = []; box.innerHTML = '<p style="text-align:center; color: var(--text-light); grid-column: 1/-1; padding: 50px;">Chargement des annonces...</p>'; }
    const ville = $('cityFilter').value;
    const q = $('q').value.trim().replace(/[,()%*\\]/g, ' ');
    try {
        let req = supabaseClient.from('annonces').select(COLONNES).order('created_at', { ascending: false })
            .range(page * PAGE, page * PAGE + PAGE - 1);
        if (ville) req = req.eq('city', ville);
        if (q) req = req.or(`title.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`);
        const { data, error } = await req;
        if (error) throw error;
        annonces = annonces.concat(data || []);
        afficher((data || []).length === PAGE);
    } catch (err) {
        console.error('Chargement :', err);
        box.innerHTML = '<p class="msg" style="grid-column: 1/-1; padding: 30px;">Impossible de charger les annonces. Vérifiez votre connexion et réessayez.</p>';
    }
}

const applyFilters = () => fetchListings(true);
function resetFilters() { $('q').value = '';$('cityFilter').value = ''; fetchListings(true); }
function chargerPlus() { page++; fetchListings(false); }

function afficher(encore) {
    const box = $('listings');
    if (!annonces.length) {
        box.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 60px 20px;">
            <h3 style="font-size: 1.25rem; margin-bottom: 8px; font-weight: 800;">Aucune annonce trouvée</h3>
            <p style="color: var(--text-light); margin-bottom: 20px;">Soyez le premier à proposer un service ou un produit dans cette zone !</p>
            <button class="btn-pub" onclick="openPublish()">Publier une offre</button>
        </div>`;
        return;
    }
    box.innerHTML = annonces.map(a => {
        let wa = (a.contact || '').replace(/\D/g, '');
        if (wa.startsWith('00')) wa = wa.slice(2);
        if (wa.length === 9) wa = '237' + wa;
        const photo = a.image_url && (a.image_url.startsWith('data:image/') || a.image_url.startsWith('https://'));
        const mienne = currentUser && a.user_id === currentUser.id;
        const isService = (a.category || '').toLowerCase().includes('service');

        return `
        <article class="card">
            <div class="card-img-wrapper">
                ${photo ? `<img src="${escapeHTML(a.image_url)}" alt="${escapeHTML(a.title)}" loading="lazy" onerror="this.remove()">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:2.2rem;">🛒</div>'}
            </div>
            <div class="card-body">
                <div class="card-badges">
                    <span class="cat">${escapeHTML(a.category || 'Autres')}</span>
                    ${isService ? '<span class="verified-badge">✓ Pro Vérifié</span>' : ''}
                </div>
                <h3>${escapeHTML(a.title)}</h3>
                <p class="desc">${escapeHTML(a.description)}</p>
                
                ${wa ? `<a class="contact-btn" href="https://wa.me/${wa}?text=Bonjour,\%20je\%20suis\%20intéressé(e)\%20par\%20votre\%20offre\%20sur\%20CamerLink:\%20${encodeURIComponent(a.title)}" target="_blank" rel="noopener">
                    💬 Discuter sur WhatsApp
                </a>` : ''}

                <div class="foot">
                    <span class="city">📍 ${escapeHTML(a.city || 'Cameroun')}</span>
                    <span class="price">${Number(a.price || 0).toLocaleString('fr-FR')} FCFA</span>
                </div>
                ${mienne ? `<button class="btn-del" onclick="supprimerAnnonce(${Number(a.id)})">Supprimer mon annonce</button>` : ''}
            </div>
        </article>`;
    }).join('') + (encore ? `<button class="btn-more" onclick="chargerPlus()">Voir plus d'annonces</button>` : '');
}

/* ---------- DÉMARRAGE ---------- */
document.addEventListener('DOMContentLoaded', async () => {
    remplirVilles();
    renderAuth();
    $('q').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(applyFilters, 350); });
    $('q').addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(timer); applyFilters(); } });$('cityFilter').addEventListener('change', applyFilters);
    await verifierSession();
    fetchListings(true);
});
