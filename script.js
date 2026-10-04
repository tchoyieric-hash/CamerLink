// ======================================================
// CAMERLINK
// Authentification professionnelle par téléphone + SMS
// ======================================================


// ======================================================
// CONFIGURATION SUPABASE
// ======================================================

const SUPABASE_URL = 'https://l1viddpuhe1xvcyykc.supabase.co';

const SUPABASE_ANON_KEY =
  'sb_publishable_j0C8eL1g6hgAcLn4Ug_zRg_jvi0bmYH';

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );


// ======================================================
// VILLES DU CAMEROUN
// ======================================================

const VILLES = [
  'Douala',
  'Yaoundé',
  'Bafoussam',
  'Garoua',
  'Bamenda',
  'Bertoua',
  'Limbe',
  'Kribi',
  'Maroua',
  'Ebolowa',
  'Ngaoundéré'
];

let toutes = [];


// ======================================================
// OUTILS
// ======================================================

function escapeHTML(str) {

  if (!str) return '';

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

}


// ======================================================
// INITIALISATION
// ======================================================

document.addEventListener('DOMContentLoaded', async () => {

  remplirVilles();

  document
    .getElementById('q')
    .addEventListener('keydown', e => {

      if (e.key === 'Enter') {
        applyFilters();
      }

    });

  await verifierSession();

  await fetchListings();

});


// ======================================================
// VILLES
// ======================================================

function remplirVilles() {

  const options = VILLES
    .map(v => `<option value="${v}">${v}</option>`)
    .join('');

  document.getElementById('adCity').innerHTML =
    `<option value="">Choisir une ville</option>${options}`;

  document.getElementById('cityFilter').innerHTML =
    `<option value="">Toutes les villes</option>${options}`;

}


// ======================================================
// MODAL PUBLICATION
// ======================================================

async function openPublish() {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {

    alert(
      'Veuillez vous connecter avec votre numéro de téléphone avant de publier une annonce.'
    );

    openAuthModal();

    return;
  }

  document
    .getElementById('modal')
    .classList.remove('hidden');

}


function closeModal() {

  document
    .getElementById('modal')
    .classList.add('hidden');

}


// ======================================================
// AUTHENTIFICATION
// ======================================================

function openAuthModal() {

  document
    .getElementById('authModal')
    .classList.remove('hidden');

}


function closeAuthModal() {

  document
    .getElementById('authModal')
    .classList.add('hidden');

}


function backToPhone() {

  document
    .getElementById('phoneStep')
    .classList.remove('hidden');

  document
    .getElementById('otpStep')
    .classList.add('hidden');

}


// ======================================================
// FORMATER LE NUMÉRO CAMEROUN
// ======================================================

function formatCameroonPhone(phone) {

  phone = phone
    .replace(/\s+/g, '')
    .replace(/-/g, '');

  if (phone.startsWith('+237')) {
    return phone;
  }

  if (phone.startsWith('237')) {
    return '+' + phone;
  }

  if (phone.startsWith('6') && phone.length === 9) {
    return '+237' + phone;
  }

  return null;
}


// ======================================================
// ENVOYER LE CODE SMS
// ======================================================

async function sendOTP() {

  const input =
    document.getElementById('phoneNumber');

  const message =
    document.getElementById('authMessage');

  const button =
    document.getElementById('sendOtpBtn');

  const phone =
    formatCameroonPhone(input.value.trim());

  message.textContent = '';

  if (!phone) {

    message.textContent =
      'Veuillez entrer un numéro camerounais valide. Exemple : 690000000';

    return;
  }

  button.disabled = true;
  button.textContent = 'Envoi du code...';

  try {

    const { error } =
      await supabaseClient.auth.signInWithOtp({
        phone: phone
      });

    if (error) {
      throw error;
    }

    document
      .getElementById('phoneStep')
      .classList.add('hidden');

    document
      .getElementById('otpStep')
      .classList.remove('hidden');

    document
      .getElementById('otpMessage')
      .textContent =
      'Un code de validation a été envoyé par SMS au ' + phone;

  } catch (error) {

    console.error(error);

    message.textContent =
      'Impossible d’envoyer le SMS. Vérifiez le numéro et la configuration SMS.';

  } finally {

    button.disabled = false;
    button.textContent = 'Recevoir le code SMS';

  }

}


// ======================================================
// VERIFIER LE CODE SMS
// ======================================================

async function verifyOTP() {

  const phoneInput =
    document.getElementById('phoneNumber');

  const otpInput =
    document.getElementById('otpCode');

  const message =
    document.getElementById('otpMessage');

  const phone =
    formatCameroonPhone(phoneInput.value.trim());

  const token =
    otpInput.value.trim();

  if (!phone) {

    message.textContent =
      'Numéro de téléphone invalide.';

    return;
  }

  if (!token || token.length < 4) {

    message.textContent =
      'Veuillez entrer le code reçu par SMS.';

    return;
  }

  message.textContent =
    'Vérification en cours...';

  try {

    const { data, error } =
      await supabaseClient.auth.verifyOtp({
        phone: phone,
        token: token,
        type: 'sms'
      });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error('Session non créée.');
    }

    message.textContent =
      'Connexion réussie.';

    await verifierSession();

    setTimeout(() => {

      closeAuthModal();

      document
        .getElementById('otpCode')
        .value = '';

    }, 700);

  } catch (error) {

    console.error(error);

    message.textContent =
      'Code incorrect ou expiré. Veuillez réessayer.';

  }

}


// ======================================================
// VERIFIER LA SESSION
// ======================================================

async function verifierSession() {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  const loginBtn =
    document.getElementById('loginBtn');

  const userBtn =
    document.getElementById('userBtn');

  if (session) {

    loginBtn.classList.add('hidden');

    userBtn.classList.remove('hidden');

    const phone =
      session.user.phone || 'Utilisateur CamerLink';

    userBtn.textContent =
      '👤 Mon compte';

    document
      .getElementById('accountPhone')
      .textContent = phone;

  } else {

    loginBtn.classList.remove('hidden');

    userBtn.classList.add('hidden');

  }

}


// ======================================================
// ECOUTER LES CHANGEMENTS DE CONNEXION
// ======================================================

supabaseClient.auth.onAuthStateChange(
  async (event, session) => {

    console.log(
      'État authentification :',
      event
    );

    await verifierSession();

  }
);


// ======================================================
// COMPTE UTILISATEUR
// ======================================================

function openUserModal() {

  document
    .getElementById('userModal')
    .classList.remove('hidden');

}


function closeUserModal() {

  document
    .getElementById('userModal')
    .classList.add('hidden');

}


// ======================================================
// DECONNEXION
// ======================================================

async function logout() {

  const confirmation =
    confirm(
      'Voulez-vous vraiment vous déconnecter de CamerLink ?'
    );

  if (!confirmation) {
    return;
  }

  try {

    const { error } =
      await supabaseClient.auth.signOut();

    if (error) {
      throw error;
    }

    closeUserModal();

    await verifierSession();

    alert(
      'Vous êtes maintenant déconnecté.'
    );

  } catch (error) {

    console.error(error);

    alert(
      'Impossible de vous déconnecter. Veuillez réessayer.'
    );

  }

}


// ======================================================
// PHOTO
// ======================================================

function photoEnTexte(file, max = 800) {

  return new Promise((resolve, reject) => {

    const img = new Image();

    const url =
      URL.createObjectURL(file);

    img.onload = () => {

      const r =
        Math.min(
          1,
          max / Math.max(img.width, img.height)
        );

      const canvas =
        document.createElement('canvas');

      canvas.width =
        Math.round(img.width * r);

      canvas.height =
        Math.round(img.height * r);

      const ctx =
        canvas.getContext('2d');

      ctx.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      URL.revokeObjectURL(url);

      resolve(
        canvas.toDataURL(
          'image/jpeg',
          0.7
        )
      );

    };

    img.onerror = () => {

      URL.revokeObjectURL(url);

      reject(
        new Error('Image illisible')
      );

    };

    img.src = url;

  });

}


// ======================================================
// PUBLICATION D'UNE ANNONCE
// ======================================================

async function handleFormSubmit(e) {

  e.preventDefault();

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {

    alert(
      'Vous devez être connecté pour publier une annonce.'
    );

    closeModal();
    openAuthModal();

    return;
  }

  const btn =
    document.getElementById('submitBtn');

  btn.disabled = true;
  btn.textContent = 'Publication...';

  try {

    const file =
      document.getElementById('adImage').files[0];

    const imageUrl =
      file
        ? await photoEnTexte(file)
        : null;

    const annonce = {

      title:
        document
          .getElementById('adTitle')
          .value
          .trim(),

      category:
        document
          .getElementById('adCategory')
          .value,

      city:
        document
          .getElementById('adCity')
          .value,

      price:
        parseFloat(
          document
            .getElementById('adPrice')
            .value
        ),

      description:
        document
          .getElementById('adDescription')
          .value
          .trim(),

      contact:
        document
          .getElementById('adContact')
          .value
          .trim() || null,

      image_url:
        imageUrl,

      user_id:
        session.user.id

    };


    const {
      error
    } =
      await supabaseClient
        .from('annonces')
        .insert(annonce);


    if (error) {
      throw error;
    }


    alert(
      'Annonce publiée avec succès !'
    );

    document
      .getElementById('adForm')
      .reset();

    closeModal();

    await fetchListings();

  } catch (error) {

    console.error(
      'Erreur publication :',
      error
    );

    alert(
      'Erreur lors de la publication : ' +
      error.message
    );

  } finally {

    btn.disabled = false;

    btn.textContent =
      'Valider la publication';

  }

}


// ======================================================
// CHARGER LES ANNONCES
// ======================================================

async function fetchListings() {

  const box =
    document.getElementById('listings');

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from('annonces')
        .select('*')
        .order(
          'created_at',
          { ascending: false }
        );

    if (error) {
      throw error;
    }

    toutes =
      data || [];

    applyFilters();

  } catch (error) {

    console.error(
      'Erreur chargement :',
      error
    );

    box.innerHTML =
      '<p>Impossible de charger les annonces. Vérifiez votre connexion.</p>';

  }

}


// ======================================================
// FILTRES
// ======================================================

function applyFilters() {

  const q =
    document
      .getElementById('q')
      .value
      .trim()
      .toLowerCase();

  const ville =
    document
      .getElementById('cityFilter')
      .value;


  const liste =
    toutes.filter(a => {

      const texte =
        (
          (a.title || '') +
          ' ' +
          (a.description || '') +
          ' ' +
          (a.category || '')
        ).toLowerCase();

      const villeOK =
        !ville ||
        a.city === ville;

      const rechercheOK =
        !q ||
        texte.includes(q);

      return villeOK &&
             rechercheOK;

    });


  afficher(liste);

}


// ======================================================
// REINITIALISER
// ======================================================

function resetFilters() {

  document
    .getElementById('q')
    .value = '';

  document
    .getElementById('cityFilter')
    .value = '';

  applyFilters();

}


// ======================================================
// AFFICHAGE DES ANNONCES
// ======================================================

function afficher(liste) {

  const box =
    document.getElementById('listings');


  if (!liste.length) {

    box.innerHTML =
      '<p>Aucune annonce trouvée.</p>';

    return;

  }


  box.innerHTML =
    liste.map(a => {

      const photo =
        a.image_url &&
        (
          a.image_url.startsWith('data:image/') ||
          a.image_url.startsWith('https://')
        )
          ? a.image_url
          : null;


      return `

        <article class="card">

          ${
            photo
              ? `<img
                  src="${escapeHTML(photo)}"
                  alt="${escapeHTML(a.title)}"
                  onerror="this.style.display='none'"
                >`
              : ''
          }

          <div class="card-body">

            <div class="top">

              <span class="cat">
                ${escapeHTML(a.category || 'Autres')}
              </span>

              <span class="status">
                Publié
              </span>

            </div>

            <h3>
              ${escapeHTML(a.title || '')}
            </h3>

            <p class="desc">
              ${escapeHTML(a.description || '')}
            </p>

            ${
              a.contact
                ? `<p class="contact">
                    Contacter sur WhatsApp
                  </p>`
                : ''
            }

            <div class="foot">

              <span class="city">
                📍 ${escapeHTML(a.city || 'Cameroun')}
              </span>

              <span class="price">
                ${Number(a.price || 0).toLocaleString('fr-FR')} FCFA
              </span>

            </div>

          </div>

        </article>

      `;

    }).join('');

}
