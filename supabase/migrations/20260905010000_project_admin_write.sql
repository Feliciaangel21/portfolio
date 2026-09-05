-- `projects` had row level security enabled with only a public select policy
-- and an admin update policy. With RLS on, anything without a policy is
-- denied, so the admin's "Add project" was refused outright, and "Delete
-- project" matched no rows and quietly removed nothing while reporting
-- success. These are the two policies that were missing.

drop policy if exists "Admin can add projects" on public.projects;
create policy "Admin can add projects" on public.projects
for insert to authenticated
with check ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');

drop policy if exists "Admin can delete projects" on public.projects;
create policy "Admin can delete projects" on public.projects
for delete to authenticated
using ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');
