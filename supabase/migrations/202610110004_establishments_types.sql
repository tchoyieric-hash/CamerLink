-- CamerLink: élargir les types d'établissements sans toucher aux données existantes.
-- À exécuter dans Supabase SQL Editor sur le projet CamerLink.
begin;

alter table public.etablissements
  drop constraint if exists etablissements_type_check;

alter table public.etablissements
  add constraint etablissements_type_check
  check (type in (
    'Restaurant',
    'Boutique',
    'Supermarché',
    'Hôtel',
    'Services',
    'Autre',
    'Pharmacie',
    'Salon de coiffure',
    'Institut de beauté',
    'Boulangerie / Pâtisserie',
    'Bar / Snack',
    'Hôtellerie',
    'Hôtellerie-Restauration',
    'Électricité / Plomberie',
    'Menuiserie',
    'Couture / Mode',
    'Informatique / Téléphonie',
    'Transport / Livraison',
    'Immobilier',
    'Garage / Mécanique',
    'Agriculture / Élevage',
    'Banque / Microfinance',
    'Éducation / Formation',
    'Santé / Clinique',
    'Quincaillerie / Matériaux',
    'Pressing / Blanchisserie',
    'Photographie / Événementiel',
    'Supermarché / Alimentation',
    'Autre service professionnel'
  ));

commit;
