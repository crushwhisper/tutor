-- Audio generation jobs (NotebookLM podcast queue)
create table if not exists audio_generations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  format text not null default 'deep-dive', -- deep-dive | brief | critique | debate
  length text not null default 'default',   -- short | default | long
  status text not null default 'pending',   -- pending | processing | done | error
  audio_url text,
  error_message text,
  notebook_id text,                          -- notebooklm notebook id (for cleanup)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for worker polling
create index if not exists audio_generations_status_idx on audio_generations(status, created_at);
-- Index for course lookup
create index if not exists audio_generations_course_idx on audio_generations(course_id, status);

-- RLS
alter table audio_generations enable row level security;

create policy "Users see own jobs" on audio_generations
  for select using (auth.uid() = user_id);

create policy "Users create own jobs" on audio_generations
  for insert with check (auth.uid() = user_id);

-- Service role can update (worker)
create policy "Service role full access" on audio_generations
  for all using (auth.role() = 'service_role');
