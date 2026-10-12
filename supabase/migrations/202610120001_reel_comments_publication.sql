-- CamerLink: aligner les droits SQL sur la publication immédiate des commentaires Reels.
-- Les utilisateurs connectés publient sous leur propre identifiant; les commentaires publics
-- restent lisibles uniquement lorsqu'ils portent le statut approved.
-- Migration idempotente. À exécuter dans le SQL Editor du projet Supabase CamerLink.
begin;

drop policy if exists "Authenticated users submit own reel comments" on public.reel_comments;
create policy "Authenticated users submit own reel comments"
  on public.reel_comments
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'approved'
  );

revoke all on public.reel_comments from anon, authenticated;
grant select on public.reel_comments to anon, authenticated;
grant insert (reel_id, user_id, content, status) on public.reel_comments to authenticated;
grant update (status) on public.reel_comments to authenticated;
grant delete on public.reel_comments to authenticated;

commit;
