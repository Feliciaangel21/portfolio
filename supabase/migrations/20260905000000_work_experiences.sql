-- Work and research experience for the About page.
--
-- Column names are snake_case. The older `projects` and `certificates` tables
-- use quoted PascalCase, which is a legacy of the template this site grew out
-- of and needs quoting in every query; new tables follow the Postgres norm.

create table if not exists public.work_experiences (
  id bigint generated always as identity primary key,
  organization text not null,
  team_or_department text,
  role text not null,
  experience_type text,
  location text,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  summary text,
  -- Optional PROBLEM / WORK / RESULT blocks, stored as an array of
  -- { "label": "...", "body": "..." } objects. Empty is the normal case and
  -- the timeline row is complete without them.
  highlights jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  external_url text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_experiences_dates_ordered
    check (end_date is null or end_date >= start_date),
  constraint work_experiences_current_has_no_end
    check (not is_current or end_date is null),
  constraint work_experiences_highlights_is_array
    check (jsonb_typeof(highlights) = 'array')
);

create index if not exists work_experiences_display_order
  on public.work_experiences (sort_order, start_date desc);

-- Keeps updated_at honest without the client having to remember to send it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists work_experiences_touch_updated_at on public.work_experiences;
create trigger work_experiences_touch_updated_at
  before update on public.work_experiences
  for each row execute function public.touch_updated_at();

alter table public.work_experiences enable row level security;

-- Hidden entries are filtered in the policy, not just in the client, so an
-- unpublished entry is not readable by anyone who calls the API directly.
drop policy if exists "Public can read visible experiences" on public.work_experiences;
create policy "Public can read visible experiences" on public.work_experiences
for select to anon using (is_visible);

drop policy if exists "Signed in can read experiences" on public.work_experiences;
create policy "Signed in can read experiences" on public.work_experiences
for select to authenticated
using (is_visible or (auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');

drop policy if exists "Admin can add experiences" on public.work_experiences;
create policy "Admin can add experiences" on public.work_experiences
for insert to authenticated
with check ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');

drop policy if exists "Admin can update experiences" on public.work_experiences;
create policy "Admin can update experiences" on public.work_experiences
for update to authenticated
using ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com')
with check ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');

drop policy if exists "Admin can delete experiences" on public.work_experiences;
create policy "Admin can delete experiences" on public.work_experiences
for delete to authenticated
using ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');

-- Seed. Guarded so re-running the migration never duplicates rows; every field
-- stays editable from the admin afterwards.
insert into public.work_experiences (
  organization, team_or_department, role, experience_type, location,
  start_date, end_date, is_current, summary, tags, sort_order
)
select
  v.organization, v.team_or_department, v.role, v.experience_type, v.location,
  v.start_date, v.end_date, v.is_current, v.summary, v.tags, v.sort_order
from (values
  -- The first row carries the casts, because a VALUES list takes each
  -- column's type from its first entry and a bare NULL has none.
  (
    'MedicalAI'::text, null::text, 'Software Engineering Intern'::text,
    'Internship'::text, 'Seoul, South Korea'::text,
    date '2026-09-01', null::date, true,
    'Working with an existing production healthcare software system, including API migration, system integration, testing, and understanding behavior across connected services.'::text,
    array['SOFTWARE', 'API', 'HEALTHCARE', 'SYSTEMS']::text[], 1
  ),
  (
    'Korea University', 'Language & Intelligence Lab', 'Undergraduate Research Intern', 'Research', null,
    date '2026-07-01', date '2026-08-31', false,
    'Researched Agentic AI and multimodal AI through paper analysis, open-source code review, experiments, and investigation of current research problems.',
    array['AGENTIC AI', 'MULTIMODAL', 'RESEARCH'], 2
  ),
  (
    'CGBio', 'Global Strategy Team', 'IT Intern', 'Internship', null,
    date '2025-11-01', date '2026-03-31', false,
    'Built an automated market research and reporting workflow by first analyzing the team''s existing process, then iterating on the system with user feedback. The final workflow was adopted for actual team use.',
    array['AUTOMATION', 'LLM', 'PRODUCT', 'WORKFLOW'], 3
  ),
  (
    'Korea University', 'SIGLearn Lab', 'Undergraduate Research Intern', 'Research', null,
    date '2025-11-01', date '2026-03-31', false,
    'Worked on continual learning research, implementing and evaluating methods including iCaRL and DER++ using CIFAR-100 experiments and analyzing model performance and forgetting.',
    array['MACHINE LEARNING', 'CONTINUAL LEARNING', 'RESEARCH'], 4
  ),
  (
    'Ezmedicom', 'IT Research Center', 'IT Intern', 'Internship', null,
    date '2023-09-01', date '2023-12-31', false,
    'Worked on hospital pharmaceutical automation workflows by validating OCR extraction results and verifying that data was correctly stored and propagated through Oracle-based internal systems.',
    array['OCR', 'DATA', 'HEALTHCARE', 'AUTOMATION'], 5
  )
) as v(
  organization, team_or_department, role, experience_type, location,
  start_date, end_date, is_current, summary, tags, sort_order
)
where not exists (select 1 from public.work_experiences);
