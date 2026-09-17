-- Run this first, then seed.sql. Does not touch existing enquiry tables/functions.
begin;
create table if not exists public.website_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.website_content (
  id bigint generated always as identity primary key,
  section text not null,
  content_key text not null unique,
  content_type text not null check (content_type in ('text','price')),
  content_value jsonb not null,
  max_length integer not null default 2000 check (max_length between 1 and 10000),
  updated_at timestamptz not null default now(),
  constraint website_content_valid_value check (
    (content_type='text' and jsonb_typeof(content_value)='string'
      and length(btrim(content_value #>> '{}')) between 1 and max_length)
    or
    (content_type='price' and jsonb_typeof(content_value)='number'
      and (content_value #>> '{}')::numeric between 0 and 10000000
      and (content_value #>> '{}')::numeric=round((content_value #>> '{}')::numeric,2))
  )
);
create table if not exists public.website_content_state (
  id boolean primary key default true check (id),
  revision bigint not null default 0 check (revision>=0)
);
insert into public.website_content_state(id) values(true) on conflict do nothing;
alter table public.website_admins enable row level security;
alter table public.website_content enable row level security;
alter table public.website_content_state enable row level security;
-- Remove Supabase's possible default grants. No client may insert/delete fields,
-- change field definitions, promote itself, or alter the revision.
revoke all on public.website_admins,public.website_content,public.website_content_state from public,anon,authenticated;
grant select on public.website_content,public.website_content_state to anon,authenticated;
grant select on public.website_admins to authenticated;
drop policy if exists "Public reads marketing content" on public.website_content;
create policy "Public reads marketing content" on public.website_content
  for select to anon,authenticated using(true);
drop policy if exists "Public reads content revision" on public.website_content_state;
create policy "Public reads content revision" on public.website_content_state
  for select to anon,authenticated using(true);
drop policy if exists "Admins see own membership" on public.website_admins;
create policy "Admins see own membership" on public.website_admins
  for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists "Only allowlisted admins update content" on public.website_content;
create policy "Only allowlisted admins update content" on public.website_content
  for update to authenticated
  using(exists(select 1 from public.website_admins a where a.user_id=(select auth.uid())))
  with check(exists(select 1 from public.website_admins a where a.user_id=(select auth.uid())));
-- UPDATE is deliberately not granted directly to browser roles. All updates go
-- through the checked, atomic save RPC so concurrent saves cannot silently overwrite.
create or replace function public.read_website_content()
returns jsonb language sql stable security invoker set search_path=''
as $$
  select jsonb_build_object(
    'revision',(select revision from public.website_content_state where id=true),
    'values',coalesce((select jsonb_object_agg(content_key,content_value) from public.website_content),'{}'::jsonb)
  );
$$;
revoke all on function public.read_website_content() from public,anon,authenticated;
grant execute on function public.read_website_content() to anon,authenticated;

create or replace function public.save_website_content(expected_revision bigint,changes jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare current_revision bigint; entry record; item public.website_content%rowtype; value_text text; price numeric;
begin
  if auth.uid() is null or not exists (
    select 1 from public.website_admins where user_id=auth.uid()
  ) then raise exception 'NOT_AUTHORISED' using errcode='42501'; end if;
  if changes is null or jsonb_typeof(changes)<>'object' or octet_length(changes::text)>1000000
    then raise exception 'INVALID_CONTENT'; end if;
  select revision into current_revision from public.website_content_state where id=true for update;
  if expected_revision is null or current_revision<>expected_revision
    then raise exception 'CONTENT_CONFLICT' using errcode='40001'; end if;
  if changes='{}'::jsonb then return public.read_website_content(); end if;
  for entry in select * from jsonb_each(changes) loop
    select * into item from public.website_content where content_key=entry.key;
    if not found then raise exception 'UNKNOWN_CONTENT_FIELD'; end if;
    if item.content_type='text' then
      if jsonb_typeof(entry.value)<>'string' then raise exception 'INVALID_TEXT'; end if;
      value_text=entry.value #>> '{}';
      if length(btrim(value_text))<1 or length(value_text)>item.max_length
        or value_text ~ '[\x01-\x08\x0B\x0C\x0E-\x1F]'
        then raise exception 'INVALID_TEXT'; end if;
    elsif item.content_type='price' then
      if jsonb_typeof(entry.value)<>'number' then raise exception 'INVALID_PRICE'; end if;
      price=(entry.value #>> '{}')::numeric;
      if price<0 or price>10000000 or price<>round(price,2) then raise exception 'INVALID_PRICE'; end if;
    else raise exception 'INVALID_CONTENT_TYPE';
    end if;
    update public.website_content set content_value=entry.value,updated_at=now() where id=item.id;
  end loop;
  update public.website_content_state set revision=revision+1 where id=true;
  return public.read_website_content();
end;
$$;
revoke all on function public.save_website_content(bigint,jsonb) from public,anon,authenticated;
grant execute on function public.save_website_content(bigint,jsonb) to authenticated;
commit;
