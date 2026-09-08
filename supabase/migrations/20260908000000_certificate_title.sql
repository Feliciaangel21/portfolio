-- Certificate names.
--
-- `certificates` stored only an id and an image, so the course names lived in
-- a hand-written map in src/data/certificateIssuers.js, read off the
-- certificate images themselves. That map cannot be edited from the admin,
-- and a new upload has no way to get a name at all. This adds the column,
-- seeds it from that map, and grants the update policy the table was missing:
-- without it a title edit would touch no rows and still report success, the
-- same silent failure the projects table had.
--
-- Column name is quoted PascalCase to match `Img` on the same table.

alter table public.certificates add column if not exists "Title" text;

drop policy if exists "Admin can update certificates" on public.certificates;
create policy "Admin can update certificates" on public.certificates
for update to authenticated
using ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com')
with check ((auth.jwt() ->> 'email') = 'feliciaangel21@gmail.com');

-- Seed. Only fills rows that have no title yet, so re-running never overwrites
-- anything edited in the admin afterwards.
update public.certificates as c
set "Title" = v.title
from (values
  (1,  'The Complete 2021 Web Development Bootcamp'),
  (2,  'Prepare Data for Exploration'),
  (3,  'Foundations: Data, Data, Everywhere'),
  (4,  'Google Data Analytics Capstone: Complete a Case Study'),
  (5,  'Google Data Analytics Professional Certificate'),
  (6,  'Ask Questions to Make Data-Driven Decisions'),
  (7,  'Analyze Data to Answer Questions'),
  (8,  'Share Data Through the Art of Visualization'),
  (9,  'Process Data from Dirty to Clean'),
  (10, 'Data Science Real World Projects in Python'),
  (11, 'The Data Science Course 2021: Complete Data Science Bootcamp'),
  (12, 'Data Analysis with R Programming'),
  (14, 'AWS Technical Essentials'),
  (15, 'Generative AI with Large Language Models'),
  (16, 'Building Agentic AI with Amazon Bedrock AgentCore'),
  (17, 'Daewoong Foundation Project 2023'),
  (19, 'Korea University Mentoring Program')
) as v(id, title)
where c.id = v.id
  and (c."Title" is null or btrim(c."Title") = '');
