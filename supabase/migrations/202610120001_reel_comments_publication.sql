-- CamerLink: publier les commentaires Reels approuvés sans ouvrir les droits de modération.
-- Migration idempotente : les visiteurs peuvent lire les commentaires approuvés;
-- les utilisateurs connectés peuvent insérer uniquement leurs propres commentaires approved.
begin;

drop policy if exists "authenticated users can submit reel comments" on public.reel_comments;
drop policy if exists "Authenticated users submit own reel comments" on public.reel_comments;

create policy "Authenticated users submit own reel comments"
  on public.reel_comments
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'approved'
  );

revoke all on public.reel_comments from anon, authenticated;
revoke insert (reel_id, user_id, content, status) on public.reel_comments from authenticated;
revoke update (status) on public.reel_comments from authenticated;
grant select on public.reel_comments to anon, authenticated;
grant insert (reel_id, user_id, content, status) on public.reel_comments to authenticated;

commit;
notify pgrst, 'reload schema';
