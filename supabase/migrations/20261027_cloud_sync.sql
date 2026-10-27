create table if not exists public.user_state_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (char_length(key) between 1 and 240),
  value text,
  updated_at bigint not null default 0,
  deleted boolean not null default false,
  updated_by text,
  primary key (user_id, key)
);

create index if not exists user_state_entries_user_updated_idx
  on public.user_state_entries (user_id, updated_at desc);

alter table public.user_state_entries enable row level security;

revoke all on table public.user_state_entries from anon;
grant select, insert, update, delete on table public.user_state_entries to authenticated;

drop policy if exists "Users can read their own state" on public.user_state_entries;
create policy "Users can read their own state"
  on public.user_state_entries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own state" on public.user_state_entries;
create policy "Users can insert their own state"
  on public.user_state_entries
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own state" on public.user_state_entries;
create policy "Users can update their own state"
  on public.user_state_entries
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own state" on public.user_state_entries;
create policy "Users can delete their own state"
  on public.user_state_entries
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.sync_user_state(
  p_entries jsonb default '[]'::jsonb,
  p_client_id text default null
)
returns setof public.user_state_entries
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.user_state_entries (
    user_id,
    key,
    value,
    updated_at,
    deleted,
    updated_by
  )
  select
    current_user_id,
    item ->> 'key',
    case when coalesce((item ->> 'deleted')::boolean, false) then null else item ->> 'value' end,
    greatest(coalesce((item ->> 'updatedAt')::bigint, 0), 0),
    coalesce((item ->> 'deleted')::boolean, false),
    left(coalesce(p_client_id, ''), 160)
  from jsonb_array_elements(coalesce(p_entries, '[]'::jsonb)) as item
  where nullif(item ->> 'key', '') is not null
    and char_length(item ->> 'key') <= 240
  on conflict (user_id, key) do update
    set value = excluded.value,
        updated_at = excluded.updated_at,
        deleted = excluded.deleted,
        updated_by = excluded.updated_by
    where public.user_state_entries.updated_at < excluded.updated_at;

  return query
    select entry.*
    from public.user_state_entries as entry
    where entry.user_id = current_user_id
    order by entry.key;
end;
$$;

revoke all on function public.sync_user_state(jsonb, text) from public;
grant execute on function public.sync_user_state(jsonb, text) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.user_state_entries;
exception
  when duplicate_object then null;
end
$$;
