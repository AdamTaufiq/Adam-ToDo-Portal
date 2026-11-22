-- Adam Todo Portal schema for Supabase SQL Editor.
-- Email is the primary key for todo_users; todos supports many tasks per email.

create table if not exists public.todo_users (
  email text primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null references public.todo_users(email) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 200),
  due_date date,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.todo_users enable row level security;
alter table public.todos enable row level security;

drop policy if exists "Users can view their own todo profile" on public.todo_users;
drop policy if exists "Users can create their own todo profile" on public.todo_users;
drop policy if exists "Users can update their own todo profile" on public.todo_users;
create policy "Users can view their own todo profile" on public.todo_users for select using (auth.uid() = user_id);
create policy "Users can create their own todo profile" on public.todo_users for insert with check (auth.uid() = user_id);
create policy "Users can update their own todo profile" on public.todo_users for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can view their own todos" on public.todos;
drop policy if exists "Users can create their own todos" on public.todos;
drop policy if exists "Users can update their own todos" on public.todos;
drop policy if exists "Users can delete their own todos" on public.todos;
create policy "Users can view their own todos" on public.todos for select using (auth.uid() = user_id);
create policy "Users can create their own todos" on public.todos for insert with check (auth.uid() = user_id and auth.jwt() ->> 'email' = email);
create policy "Users can update their own todos" on public.todos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete their own todos" on public.todos for delete using (auth.uid() = user_id);

create index if not exists todos_user_id_created_at_idx on public.todos(user_id, created_at desc);
create index if not exists todos_email_idx on public.todos(email);

insert into public.todo_users (email, user_id)
select email, id from auth.users where email is not null
on conflict (email) do update set user_id = excluded.user_id;
