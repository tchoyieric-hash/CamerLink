-- CamerLink: nom public du propriétaire pour les bulles de statuts
-- À exécuter dans Supabase SQL Editor.
alter table public.etablissements
  add column if not exists owner_name text;

comment on column public.etablissements.owner_name is
  'Nom public du propriétaire du compte, distinct du nom commercial de l’établissement';

-- Le champ reste volontairement NULL pour les profils existants :
-- ne pas inventer ni déduire le nom d’une personne à partir du nom commercial.
