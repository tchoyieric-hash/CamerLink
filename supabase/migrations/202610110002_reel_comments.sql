-- CamerLink Reels: commentaires avec validation avant publication
-- A appliquer dans Supabase SQL Editor sur le projet CamerLink.

create table if not exists public.reel_comments (
  id uuid primary key default gen_random_uuid(),
  reel_id bigint not null references public.annonces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 500),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reel_comments_public_idx
  on public.reel_comments (reel_id, status, created_at desc);

create index if not exists reel_comments_user_idx
  on public.reel_comments (user_id, created_at desc);

alter table public.reel_comments enable row level security;

drop policy if exists "approved reel comments are public" on public.reel_comments;
create policy "approved reel comments are public"
  on public.reel_comments
  for select
  to anon, authenticated
  using (status = 'approved' or auth.uid() = user_id);

drop policy if exists "authenticated users can submit reel comments" on public.reel_comments;
create policy "authenticated users can submit reel comments"
  on public.reel_comments
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
  );

grant select on public.reel_comments to anon, authenticated;
grant insert on public.reel_comments to authenticated;

notify pgrst, 'reload schema';
