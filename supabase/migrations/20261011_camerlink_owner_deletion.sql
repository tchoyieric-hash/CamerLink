-- CamerLink: autoriser chaque utilisateur connecté à supprimer uniquement
-- ses propres publications et sa propre fiche professionnelle.
-- Ne supprime jamais le compte Auth de l'utilisateur.
begin;

grant delete on table public.annonces to authenticated;
drop policy if exists "CamerLink users delete own annonces" on public.annonces;
create policy "CamerLink users delete own annonces"
  on public.annonces
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

grant delete on table public.etablissements to authenticated;
drop policy if exists "CamerLink users delete own establishment" on public.etablissements;
create policy "CamerLink users delete own establishment"
  on public.etablissements
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

commit;
