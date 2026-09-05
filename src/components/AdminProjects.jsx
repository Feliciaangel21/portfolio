import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Upload, Star, X, ExternalLink } from "lucide-react";
import { supabase } from "../supabase";
import { getProjectImages } from "../utils/projectImages";
import { Panel, Field, Input, Textarea, Button, Status } from "./admin/AdminUI";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

// A write refused by row level security comes back as success with no rows
// touched, not as an error, so every write asks for the affected rows back.
const BLOCKED =
  "Nothing changed. Check you are signed in as the admin account and that the table's policies allow this.";

// Text columns and the array columns, kept separate because arrays need
// parsing on the way in and joining on the way out.
const TEXT_FIELDS = [
  { key: "Title", label: "Title", placeholder: "Project name" },
  { key: "Link", label: "Live demo URL", placeholder: "https://" },
  { key: "Github", label: "Source URL", placeholder: "https:// or the word Private" },
];
const ARRAY_FIELDS = [
  {
    key: "TechStack",
    label: "Tech stack",
    hint: "Separated by commas. These drive the tags shown on the site.",
    separator: ", ",
    split: (value) => value.split(",").map((item) => item.trim()).filter(Boolean),
  },
  {
    key: "Features",
    label: "Features",
    hint: "One per line.",
    separator: "\n",
    split: (value) => value.split("\n").map((item) => item.trim()).filter(Boolean),
  },
];

const FALLBACK_COLUMNS = [
  "id", "Title", "Description", "Link", "Github", "TechStack", "Features", "Img", "Images",
];

const toDraft = (project) => ({ ...project });

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [columns, setColumns] = useState(FALLBACK_COLUMNS);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [status, setStatus] = useState({ kind: "info", message: "" });

  const say = (kind, message) => setStatus({ kind, message });

  // Read the column names off a real row rather than assuming them, so a save
  // never fails because this file guessed at a column the table does not have.
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      say("error", error.message);
      return;
    }
    setProjects(data || []);
    if (data?.length) setColumns(Object.keys(data[0]));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = projects.find((project) => project.id === selectedId) || null;

  useEffect(() => {
    setDraft(selected ? toDraft(selected) : null);
    setFiles([]);
    setConfirmingDelete(false);
  }, [selected]);

  const has = useCallback((column) => columns.includes(column), [columns]);

  const dirty = useMemo(() => {
    if (!draft || !selected) return false;
    return JSON.stringify(draft) !== JSON.stringify(selected);
  }, [draft, selected]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((project) => (project.Title || "").toLowerCase().includes(term));
  }, [projects, query]);

  const setField = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const createProject = async () => {
    setBusy(true);
    say("info", "");
    const row = { Title: "Untitled project" };
    if (has("Description")) row.Description = "";
    if (has("TechStack")) row.TechStack = [];
    if (has("Features")) row.Features = [];
    if (has("Images")) row.Images = [];

    const { data, error } = await supabase.from("projects").insert(row).select().single();
    if (error) say("error", error.message);
    else {
      setProjects((current) => [data, ...current]);
      setSelectedId(data.id);
      localStorage.removeItem("projects");
      say("info", "Project created. Fill in the details and save.");
    }
    setBusy(false);
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    say("info", "");

    // Only send columns that exist and that this form actually edits.
    const payload = {};
    const editable = ["Title", "Description", "Link", "Github", "TechStack", "Features", "Img", "Images"];
    editable.forEach((key) => {
      if (has(key) && key in draft) payload[key] = draft[key];
    });

    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", draft.id)
      .select("id");
    if (error) say("error", error.message);
    else if (!data?.length) say("error", BLOCKED);
    else {
      setProjects((current) =>
        current.map((project) => (project.id === draft.id ? { ...project, ...payload } : project))
      );
      localStorage.removeItem("projects");
      say("info", "Saved.");
    }
    setBusy(false);
  };

  const deleteProject = async () => {
    if (!selected) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("projects")
      .delete()
      .eq("id", selected.id)
      .select("id");
    if (error) say("error", error.message);
    else if (!data?.length) say("error", BLOCKED);
    else {
      setProjects((current) => current.filter((project) => project.id !== selected.id));
      setSelectedId(null);
      localStorage.removeItem("projects");
      say("info", "Project deleted.");
    }
    setBusy(false);
    setConfirmingDelete(false);
  };

  const images = draft ? getProjectImages(draft) : [];

  const uploadImages = async (event) => {
    event.preventDefault();
    if (!draft || !files.length) return;

    const invalid = files.find(
      (file) => !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE
    );
    if (invalid) {
      say("error", `${invalid.name} must be an image under 8 MB.`);
      return;
    }

    setBusy(true);
    say("info", "Uploading…");
    const uploaded = [];
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${draft.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("project-images")
        .upload(path, file, { contentType: file.type });
      if (error) {
        say("error", error.message);
        setBusy(false);
        return;
      }
      uploaded.push(supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl);
    }

    const nextImages = [...images, ...uploaded];
    await persistImages(nextImages, `${uploaded.length} image${uploaded.length === 1 ? "" : "s"} added.`);
    setFiles([]);
    setBusy(false);
  };

  const persistImages = async (nextImages, successMessage) => {
    const payload = { Images: nextImages, Img: nextImages[0] || null };
    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", draft.id)
      .select("id");
    if (!error && !data?.length) {
      say("error", BLOCKED);
      return;
    }
    if (error) {
      say("error", error.message);
      return;
    }
    setDraft((current) => ({ ...current, ...payload }));
    setProjects((current) =>
      current.map((project) => (project.id === draft.id ? { ...project, ...payload } : project))
    );
    localStorage.removeItem("projects");
    say("info", successMessage);
  };

  const removeImage = async (image) => {
    setBusy(true);
    await persistImages(images.filter((item) => item !== image), "Image removed.");
    setBusy(false);
  };

  // The first image is the cover used on the site, so promoting one is just
  // moving it to the front rather than a separate column.
  const makeCover = async (image) => {
    setBusy(true);
    await persistImages([image, ...images.filter((item) => item !== image)], "Cover image updated.");
    setBusy(false);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <Panel
          title="Projects"
          description={`${projects.length} in the database`}
          action={
            <Button variant="primary" onClick={createProject} disabled={busy}>
              <Plus className="h-4 w-4" />
              New
            </Button>
          }
        >
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects"
              aria-label="Search projects"
              className="w-full border border-rule bg-paper py-2.5 pl-9 pr-3 text-sm text-ink outline-none transition-colors duration-150 ease-out placeholder:text-ink-muted hover:border-ink-muted focus:border-accent"
            />
          </div>

          <ul className="max-h-[28rem] divide-y divide-rule overflow-y-auto border-y border-rule">
            {filtered.map((project) => {
              const isActive = project.id === selectedId;
              const cover = getProjectImages(project)[0];
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(project.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex w-full items-center gap-3 px-2 py-2.5 text-left transition-colors duration-150 ease-out ${
                      isActive ? "bg-surface" : "hover:bg-surface"
                    }`}
                  >
                    {cover ? (
                      <img src={cover} alt="" className="h-10 w-14 shrink-0 border border-rule bg-surface object-contain" />
                    ) : (
                      <span className="h-10 w-14 shrink-0 border border-rule bg-surface" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm ${isActive ? "text-accent" : "text-ink"}`}>
                        {project.Title || "Untitled project"}
                      </span>
                      <span className="nums block text-meta text-ink-muted">
                        id {project.id}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
            {!filtered.length && (
              <li className="px-2 py-8 text-center text-sm text-ink-muted">
                {projects.length ? "No project matches that search." : "No projects yet."}
              </li>
            )}
          </ul>
        </Panel>
      </div>

      <div className="lg:col-span-8">
        {!draft ? (
          <Panel>
            <p className="py-16 text-center text-sm text-ink-muted">
              Pick a project on the left to edit it, or create a new one.
            </p>
          </Panel>
        ) : (
          <div className="space-y-5">
            <Panel
              title="Details"
              description={dirty ? "Unsaved changes" : "Everything saved"}
              action={
                <div className="flex gap-2">
                  {draft.Link ? (
                    <a
                      href={draft.Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border border-rule px-4 py-2.5 text-sm text-ink transition-colors duration-150 ease-out hover:border-ink hover:bg-surface"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit
                    </a>
                  ) : null}
                  <Button variant="primary" onClick={save} disabled={busy || !dirty}>
                    {busy ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                {TEXT_FIELDS.filter(({ key }) => has(key)).map(({ key, label, placeholder }) => (
                  <Field key={key} label={label} htmlFor={`field-${key}`}>
                    <Input
                      id={`field-${key}`}
                      value={draft[key] ?? ""}
                      placeholder={placeholder}
                      onChange={(event) => setField(key, event.target.value)}
                    />
                  </Field>
                ))}

                {has("Description") && (
                  <Field
                    label="Description"
                    htmlFor="field-Description"
                    hint="Shown under the title on the work list and the project page."
                  >
                    <Textarea
                      id="field-Description"
                      rows={4}
                      value={draft.Description ?? ""}
                      onChange={(event) => setField("Description", event.target.value)}
                    />
                  </Field>
                )}

                {ARRAY_FIELDS.filter(({ key }) => has(key)).map(({ key, label, hint, separator, split }) => (
                  <Field key={key} label={label} hint={hint} htmlFor={`field-${key}`}>
                    <Textarea
                      id={`field-${key}`}
                      rows={key === "Features" ? 5 : 2}
                      value={(draft[key] || []).join(separator)}
                      onChange={(event) => setField(key, split(event.target.value))}
                    />
                  </Field>
                ))}
              </div>
            </Panel>

            <Panel
              title="Images"
              description="The first image is the cover shown on the work list."
            >
              {images.length > 0 ? (
                <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {images.map((image, index) => (
                    <li key={image} className="group relative border border-rule bg-surface">
                      <img src={image} alt="" className="aspect-video w-full object-contain" />
                      {index === 0 ? (
                        <span className="absolute left-1.5 top-1.5 bg-ink px-1.5 py-0.5 font-mono text-meta uppercase text-paper">
                          Cover
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => makeCover(image)}
                          title="Make this the cover"
                          aria-label="Make this the cover image"
                          className="absolute left-1.5 top-1.5 grid h-8 w-8 place-items-center bg-paper text-ink opacity-0 transition-opacity duration-150 ease-out hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeImage(image)}
                        title="Remove image"
                        aria-label="Remove image"
                        className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center bg-paper text-ink opacity-0 transition-opacity duration-150 ease-out hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-4 border border-dashed border-rule py-10 text-center text-sm text-ink-muted">
                  No images yet.
                </p>
              )}

              <form onSubmit={uploadImages} className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  aria-label="Choose images to upload"
                  onChange={(event) => setFiles(Array.from(event.target.files || []))}
                  className="min-w-0 flex-1 text-sm text-ink-body file:mr-3 file:border file:border-rule file:bg-surface file:px-3 file:py-2 file:text-sm file:text-ink"
                />
                <Button variant="primary" type="submit" disabled={busy || !files.length}>
                  <Upload className="h-4 w-4" />
                  {files.length ? `Upload ${files.length}` : "Upload"}
                </Button>
              </form>
            </Panel>

            <Panel title="Danger zone">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink-muted">
                  {confirmingDelete
                    ? "This permanently deletes the project row. Click again to confirm."
                    : "Delete this project from the database."}
                </p>
                <div className="flex gap-2">
                  {confirmingDelete && (
                    <Button onClick={() => setConfirmingDelete(false)} disabled={busy}>
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    disabled={busy}
                    onClick={() => (confirmingDelete ? deleteProject() : setConfirmingDelete(true))}
                  >
                    <Trash2 className="h-4 w-4" />
                    {confirmingDelete ? "Yes, delete it" : "Delete project"}
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>

      <div className="lg:col-span-12">
        <Status status={status} />
      </div>
    </div>
  );
}
