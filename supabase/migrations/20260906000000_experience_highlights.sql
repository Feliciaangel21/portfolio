-- Proof metadata for the experience timeline.
--
-- The About page renders these in the right rail as a small label and one
-- line. They live here rather than in the React page so they stay editable
-- from the admin, like every other field on the entry.
--
-- Each statement is guarded on `highlights = '[]'` so re-running the file is
-- safe and, more importantly, so it can never overwrite something edited in
-- the admin afterwards. Entries with nothing worth printing are left empty on
-- purpose; the row is complete without a proof block.

update public.work_experiences
set highlights = jsonb_build_array(
  jsonb_build_object(
    'label', 'Work',
    'body', 'Production software integration and API migration'
  )
)
where organization = 'MedicalAI'
  and highlights = '[]'::jsonb;

update public.work_experiences
set highlights = jsonb_build_array(
  jsonb_build_object(
    'label', 'Focus',
    'body', 'Agentic AI and multimodal AI'
  )
)
where team_or_department = 'Language & Intelligence Lab'
  and highlights = '[]'::jsonb;

update public.work_experiences
set highlights = jsonb_build_array(
  jsonb_build_object(
    'label', 'Result',
    'body', 'Workflow adopted for actual team use'
  )
)
where organization = 'CGBio'
  and highlights = '[]'::jsonb;
