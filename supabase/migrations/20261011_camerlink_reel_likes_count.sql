-- CamerLink: compteur public des likes par annonce/Reel.
-- À exécuter après 20261011_camerlink_community.sql si reel_likes_count
-- n'existe pas déjà. Ne renvoie que les identifiants d'annonces et les totaux,
-- pas les identifiants des personnes qui ont aimé.
create or replace function public.reel_likes_count(p_annonce_ids bigint[])
returns table (annonce_id bigint, nb bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select rl.reel_id as annonce_id, count(*)::bigint as nb
  from public.reel_likes rl
  where rl.reel_id = any(coalesce(p_annonce_ids, '{}'::bigint[]))
  group by rl.reel_id;
$$;

grant execute on function public.reel_likes_count(bigint[]) to anon, authenticated;
