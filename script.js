const SUPABASE_URL = 'https://lviddipduhaelxcvyykc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_j0C8eL1g6hgAcnL4gU_zRg_jvi0bmYH';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const VILLES = ['Douala', 'Yaoundé', 'Bafoussam', 'Garoua', 'Bamenda', 'Bertoua', 'Limbé', 'Kribi', 'Maroua', 'Ebolowa'];
let toutes = [];
let authMode = 'login'; // 'login' ou 'signup'
let currentUser = null;

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

/* ---------- PUBLICATION (modal) ---------- */
function openModal() { document.getElementById('modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('modal').classList.add('hidden'); }
function openPublish() {
    const contact = document.getElementById('adContact');
    if (currentUser && contact && !contact.value) {
        const tel = (currentUser.user_metadata && currentUser.user_metadata.phone) || '';
        contact.value = tel.replace('+237', '');
    }
    openModal();
}

/* ---------- CONNEXION / INSCRIPTION (numéro + mot de passe) ---------- */
function renderAuth() {
    const sheet = document.querySelector('#authModal .sheet');
    const isLogin = authMode === 'login';
    sheet.innerHTML = `
        <div class="sheet-header">
            <div></div>
            <button class="close" onclick="closeAuthModal()">×</button>
        </div>

        <div class="auth-logo">CamerLink</div>
        <p class="auth-subtitle">${isLogin ? 'Connectez-vous avec votre numéro de téléphone' : 'Créez votre compte avec votre numéro de téléphone'}</p>

        <form onsubmit="authSubmit(event)">
            <div class="form-group">
                <label>Numéro de téléphone</label>
                <div class="phone-prefix">
                    <span>🇨🇲 +237</span>
                    <input id="phoneNumber" type="tel" inputmode="numeric" maxlength="9" placeholder="6XXXXXXXX" required>
                </div>
            </div>

            <div class="form-group">
                <label>Mot de passe</label>
                <input id="authPassword" type="password" minlength="6" placeholder="Au moins 6 caractères" autocomplete="${isLogin ? 'current-password' : 'new-password'}" required>
            </div>

            ${isLogin ? '' : `
            <div class="form-group">
                <label>Confirmer le mot de passe</label>
                <input id="authPassword2" type="password" minlength="6" placeholder="Répétez le mot de passe" autocomplete="new-password" required>
            </div>`}

            <button id="authSubmitBtn" class="btn-ok" type="submit">
                ${isLogin ? 'Se connecter' : "Créer mon compte"}
            </button>
        </form>

        <p id="authMessage" class="msg"></p>

        <button type="button" style="background:none;color:#2563eb;margin-top:15px;width:100%" onclick="toggleAuthMode()">
            ${isLogin ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </button>

        <div class="security">🔐 Votre numéro sert uniquement à identifier votre compte CamerLink.</div>
    `;
}

function openAuthModal() {
    authMode = 'login';
    renderAuth();
    document.getElementById('authModal').classList.remove('hidden');
}
function closeAuthModal() { document.getElementById('authModal').classList.add('hidden'); }
function openUserModal() { document.getElementById('userModal').classList.remove('hidden'); }
function closeUserModal() { document.getElementById('userModal').classList.add('hidden'); }

function toggleAuthMode() {
    authMode = authMode === 'login' ? 'signup' : 'login';
    renderAuth();
}

// Le numéro est converti en identifiant interne (aucun SMS ni e-mail réel n'est envoyé)
function numeroVersEmail(num) {
    return `237${num}@camerlink.app`;
}

async function authSubmit(e) {
    e.preventDefault();
    const msg = document.getElementById('authMessage');
    const btn = document.getElementById('authSubmitBtn');
    const num = document.getElementById('phoneNumber').value.replace(/\D/g, '');
    const password = document.getElementById('authPassword').value;

    msg.style.color = '#dc2626';
    msg.textContent = '';

    if (!/^6\d{8}$/.test(num)) {
        msg.textContent = 'Entrez un numéro valide à 9 chiffres (ex : 6XXXXXXXX).';
        return;
    }
    if (password.length < 6) {
        msg.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
        return;
    }
    if (authMode === 'signup') {
        const p2 = document.getElementById('authPassword2').value;
        if (p2 !== password) {
            msg.textContent = 'Les deux mots de passe ne sont pas identiques.';
            return;
        }
    }

    const email = numeroVersEmail(num);
    const ancienTexte = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Veuillez patienter...';

    try {
        if (authMode === 'signup') {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { phone: '+237' + num } }
            });
            if (error) throw error;

            if (!data.session) {
                // Confirmation e-mail encore activée dans Supabase
                msg.textContent = "Compte créé, mais la confirmation e-mail est activée dans Supabase. Désactivez « Confirm email » puis réessayez.";
                return;
            }
            closeAuthModal();
            majInterfaceUtilisateur(data.user);
        } else {
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            closeAuthModal();
            majInterfaceUtilisateur(data.user);
        }
    } catch (err) {
        console.error('Erreur auth :', err);
        const m = (err.message || '').toLowerCase();
        if (m.includes('invalid login')) {
            msg.textContent = 'Numéro ou mot de passe incorrect.';
        } else if (m.includes('already registered') || m.includes('already been registered')) {
            msg.textContent = 'Ce numéro est déjà inscrit. Connectez-vous.';
        } else if (m.includes('rate limit')) {
            msg.textContent = 'Trop de tentatives. Réessayez dans quelques minutes.';
        } else {
            msg.textContent = 'Erreur : ' + (err.message || 'inconnue');
        }
    } finally {
        btn.disabled = false;
        btn.textContent = ancienTexte;
    }
}

async function logout() {
    await supabaseClient.auth.signOut();
    closeUserModal();
    majInterfaceUtilisateur(null);
}

function majInterfaceUtilisateur(user) {
    currentUser = user;
    const loginBtn = document.getElementById('loginBtn');
    const userBtn = document.getElementById('userBtn');
    if (user) {
        loginBtn.classList.add('hidden');
        userBtn.classList.remove('hidden');
        const tel = (user.user_metadata && user.user_metadata.phone) || '';
        document.getElementById('accountPhone').textContent = tel || 'Utilisateur CamerLink';
    } else {
        loginBtn.classList.remove('hidden');
        userBtn.classList.add('hidden');
    }
}

async function verifierSession() {
    try {
        const { data } = await supabaseClient.auth.getSession();
        majInterfaceUtilisateur(data && data.session ? data.session.user : null);
    } catch (err) {
        console.error('Session :', err);
    }
}

/* ---------- ANNONCES ---------- */
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
            <div class="card-body">
                <div class="top">
                    <span class="cat">${escapeHTML(a.category || 'Autres')}</span>
                    <span class="status">Publié</span>
                </div>
                <h3>${escapeHTML(a.title)}</h3>
                <p class="desc">${escapeHTML(a.description)}</p>
                ${tel ? `<a class="contact" href="https://wa.me/${tel.replace('+', '')}" target="_blank" rel="noopener">Contacter sur WhatsApp</a>` : ''}
                <div class="foot">
                    <span class="city">📍 ${escapeHTML(a.city || 'Cameroun')}</span>
                    <span class="price">${Number(a.price || 0).toLocaleString('fr-FR')} FCFA</span>
                </div>
            </div>
        </article>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    remplirVilles();
    renderAuth();
    document.getElementById('q').addEventListener('keydown', e => { if (e.key === 'Enter') applyFilters(); });
    verifierSession();
    fetchListings();
});
