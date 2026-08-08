alter table public.certificates enable row level security;

drop policy if exists "Public can read certificates" on public.certificates;
create policy "Public can read certificates" on public.certificates
for select to anon, authenticated using (true);

drop policy if exists "Admin can add certificates" on public.certificates;
create policy "Admin can add certificates" on public.certificates
for insert to authenticated
with check ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');

drop policy if exists "Admin can delete certificates" on public.certificates;
create policy "Admin can delete certificates" on public.certificates
for delete to authenticated
using ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');
