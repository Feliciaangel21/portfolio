-- Only this account can manage project images.
alter table public.projects add column if not exists "Images" text[] not null default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-images', 'project-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

alter table public.projects enable row level security;
drop policy if exists "Public can read projects" on public.projects;
create policy "Public can read projects" on public.projects for select to anon, authenticated using (true);
drop policy if exists "Admin can update projects" on public.projects;
create policy "Admin can update projects" on public.projects for update to authenticated
using ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com') with check ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');

drop policy if exists "Admin can upload project images" on storage.objects;
create policy "Admin can upload project images" on storage.objects for insert to authenticated
with check (bucket_id = 'project-images' and (auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');
drop policy if exists "Admin can update project images" on storage.objects;
create policy "Admin can update project images" on storage.objects for update to authenticated
using (bucket_id = 'project-images' and (auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com') with check (bucket_id = 'project-images' and (auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');
drop policy if exists "Admin can delete project images" on storage.objects;
create policy "Admin can delete project images" on storage.objects for delete to authenticated
using (bucket_id = 'project-images' and (auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');
