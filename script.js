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
        
        loadListings();
    } catch (err) {
        console.error('Erreur lors de l\'ajout :', err.message);
        alert('Erreur lors de la publication de l\'annonce.');
    }
}
