-- Two read policies predated these migrations, created by hand in the
-- dashboard, and duplicated ones the migrations already manage:
--
--   projects      "public read"               select to public  using (true)
--   certificates  "Allow read access for all" select to public  using (true)
--
-- Both are covered by "Public can read projects" and "Public can read
-- certificates", which grant the same unconditional read to anon and
-- authenticated. `public` is the wider grant on paper, but PostgREST only ever
-- assumes anon or authenticated and service_role bypasses row level security,
-- so nothing reachable over the API loses access here.
--
-- The point of removing them is that permissive policies are OR'd together: a
-- stray policy that no migration knows about would keep granting read even
-- after the managed one was tightened, and nothing in this repository would
-- explain why.

drop policy if exists "public read" on public.projects;
drop policy if exists "Allow read access for all" on public.certificates;
