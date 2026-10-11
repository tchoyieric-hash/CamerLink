-- Administration des commentaires Reels : RPC reservees aux administrateurs.
-- La table reel_comments doit deja exister.

create or replace function public.admin_list_reel_comments()
returns table (
  id uuid,
  reel_id bigint,
  user_id uuid,
  content text,
  status text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Accès administrateur requis';
  end if;

  return query
  select c.id, c.reel_id, c.user_id, c.content, c.status, c.created_at
  from public.reel_comments c
  order by
    case when c.status = 'pending' then 0 else 1 end,
    c.created_at desc
  limit 500;
end;
$$;

create or replace function public.admin_set_reel_comment_status(
  comment_id uuid,
  new_status text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not coalesce(public.is_admin(), false) then
    raise exception 'Accès administrateur requis';
  end if;

  if new_status not in ('approved', 'rejected') then
    raise exception 'Statut invalide';
  end if;

  update public.reel_comments
  set status = new_status
  where id = comment_id;

  return found;
end;
$$;

revoke all on function public.admin_list_reel_comments() from public, anon, authenticated;
revoke all on function public.admin_set_reel_comment_status(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_list_reel_comments() to authenticated;
grant execute on function public.admin_set_reel_comment_status(uuid, text) to authenticated;

notify pgrst, 'reload schema';
