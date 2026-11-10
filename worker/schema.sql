create extension if not exists pgcrypto;

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  author_name text not null,
  email text not null,
  institution text not null,
  bio text not null default '',
  body text not null default '',
  anonymous boolean not null default false,
  file_name text,
  file_path text,
  file_type text,
  file_size integer,
  file_data bytea,
  submitted_at timestamptz not null default now()
);

create index if not exists stories_submitted_at_idx
  on public.stories (submitted_at desc);

alter table public.stories add column if not exists file_data bytea;
