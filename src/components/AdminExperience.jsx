import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Eye, EyeOff, X } from "lucide-react";
import { supabase } from "../supabase";
import { Panel, Field, Input, Select, Textarea, Button, Status } from "./admin/AdminUI";

const TYPES = ["Internship", "Research", "Work", "Mentoring"];

// A write refused by row level security comes back as success with no rows
// touched, not as an error, so deletes ask for the affected rows back.
const BLOCKED =
  "Nothing changed. Check you are signed in as the admin account and that the table's policies allow this.";

const BLANK = {
  organization: "",
  team_or_department: "",
  role: "",
  experience_type: "Internship",
  location: "",
  start_date: "",
  end_date: "",
  is_current: false,
  summary: "",
  highlights: [],
  tags: [],
  external_url: "",
  sort_order: 0,
  is_visible: true,
};

// Empty optional fields are sent as null rather than "", so the public page
// can test them with a plain falsy check and never renders a blank line.
const orNull = (value) => {
  const text = String(value ?? "").trim();
  return text ? text : null;
};

const toDraft = (row) => ({
  ...BLANK,
  ...row,
  team_or_department: row.team_or_department || "",
  experience_type: row.experience_type || "",
  location: row.location || "",
  summary: row.summary || "",
  external_url: row.external_url || "",
  start_date: row.start_date || "",
  end_date: row.end_date || "",
  highlights: Array.isArray(row.highlights) ? row.highlights : [],
  tags: Array.isArray(row.tags) ? row.tags : [],
});

// Mirrors the table's check constraints so a mistake is caught here, with a
// sentence the reader can act on, rather than arriving as a Postgres error.
const validate = (draft) => {
  if (!draft.organization.trim()) return "Organization is required.";
  if (!draft.role.trim()) return "Role is required.";
  if (!draft.start_date) return "Start date is required.";
  if (draft.is_current && draft.end_date) {
    return "A current role cannot have an end date. Clear it, or untick Current.";
  }
  if (!draft.is_current && !draft.end_date) {
    return "Add an end date, or tick Current if this role is ongoing.";
  }
  if (draft.end_date && draft.end_date < draft.start_date) {
    return "The end date is before the start date.";
  }
  return null;
};

const periodLabel = (row) => {
  if (!row.start_date) return "";
  return row.is_current ? "Present" : row.end_date || "";
};

export default function AdminExperience() {
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [status, setStatus] = useState({ kind: "info", message: "" });

  const say = (kind, message) => setStatus({ kind, message });

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("work_experiences")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("start_date", { ascending: false });

    if (error) {
      say(
        "error",
        error.message.includes("work_experiences")
          ? "The work_experiences table does not exist yet. Run the migration in supabase/migrations first."
          : error.message
      );
      return;
    }
    setRows(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = rows.find((row) => row.id === selectedId) || null;

  useEffect(() => {
    setDraft(selected ? toDraft(selected) : null);
    setConfirmingDelete(false);
  }, [selected]);

  const dirty = useMemo(
    () => Boolean(draft && selected && JSON.stringify(draft) !== JSON.stringify(toDraft(selected))),
    [draft, selected]
  );

  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  // Ticking Current clears the end date, which is what the table's constraint
  // requires, so the two controls can never disagree.
  const setCurrent = (value) =>
    setDraft((current) => ({ ...current, is_current: value, end_date: value ? "" : current.end_date }));

  const setHighlight = (index, key, value) =>
    setDraft((current) => ({
      ...current,
      highlights: current.highlights.map((item, position) =>
        position === index ? { ...item, [key]: value } : item
      ),
    }));

  const addHighlight = () =>
    setDraft((current) => ({
      ...current,
      highlights: [...current.highlights, { label: "", body: "" }],
    }));

  const removeHighlight = (index) =>
    setDraft((current) => ({
      ...current,
      highlights: current.highlights.filter((_, position) => position !== index),
    }));

  const create = async () => {
    setBusy(true);
    say("info", "");
    const nextOrder = rows.reduce((high, row) => Math.max(high, row.sort_order || 0), 0) + 1;
    const { data, error } = await supabase
      .from("work_experiences")
      .insert({
        organization: "New organization",
        role: "Role",
        start_date: new Date().toISOString().slice(0, 10),
        is_current: true,
        sort_order: nextOrder,
        is_visible: false,
      })
      .select()
      .single();

    if (error) say("error", error.message);
    else {
      setRows((current) => [...current, data]);
      setSelectedId(data.id);
      localStorage.removeItem("experiences");
      say("info", "Entry created, hidden for now. Fill it in and make it visible.");
    }
    setBusy(false);
  };

  const save = async () => {
    if (!draft) return;
    const problem = validate(draft);
    if (problem) {
      say("error", problem);
      return;
    }

    setBusy(true);
    say("info", "");
    const payload = {
      organization: draft.organization.trim(),
      team_or_department: orNull(draft.team_or_department),
      role: draft.role.trim(),
      experience_type: orNull(draft.experience_type),
      location: orNull(draft.location),
      start_date: draft.start_date,
      end_date: draft.is_current ? null : draft.end_date || null,
      is_current: draft.is_current,
      summary: orNull(draft.summary),
      highlights: draft.highlights
        .map((item) => ({ label: item.label.trim(), body: item.body.trim() }))
        .filter((item) => item.label && item.body),
      tags: draft.tags,
      external_url: orNull(draft.external_url),
      sort_order: Number(draft.sort_order) || 0,
      is_visible: draft.is_visible,
    };

    const { data, error } = await supabase
      .from("work_experiences")
      .update(payload)
      .eq("id", draft.id)
      .select()
      .single();

    if (error) say("error", error.message);
    else {
      setRows((current) => current.map((row) => (row.id === data.id ? data : row)));
      localStorage.removeItem("experiences");
      say("info", "Saved.");
    }
    setBusy(false);
  };

  const toggleVisible = async (row) => {
    setBusy(true);
    const { data, error } = await supabase
      .from("work_experiences")
      .update({ is_visible: !row.is_visible })
      .eq("id", row.id)
      .select()
      .single();
    if (error) say("error", error.message);
    else {
      setRows((current) => current.map((item) => (item.id === data.id ? data : item)));
      localStorage.removeItem("experiences");
    }
    setBusy(false);
  };

  const remove = async () => {
    if (!selected) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("work_experiences")
      .delete()
      .eq("id", selected.id)
      .select("id");
    if (error) say("error", error.message);
    else if (!data?.length) say("error", BLOCKED);
    else {
      setRows((current) => current.filter((row) => row.id !== selected.id));
      setSelectedId(null);
      localStorage.removeItem("experiences");
      say("info", "Entry deleted.");
    }
    setConfirmingDelete(false);
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      <Panel
        title="Experience"
        description={`${rows.length} ${rows.length === 1 ? "entry" : "entries"}`}
        action={
          <Button variant="primary" onClick={create} disabled={busy}>
            <Plus className="h-4 w-4" />
            Add entry
          </Button>
        }
      >
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-rule text-left font-mono text-meta uppercase text-ink-muted">
                  <th className="w-14 py-2 font-normal">Sort</th>
                  <th className="py-2 font-normal">Organization</th>
                  <th className="py-2 font-normal">Role</th>
                  <th className="py-2 font-normal">Start</th>
                  <th className="py-2 font-normal">End</th>
                  <th className="w-24 py-2 font-normal">Visible</th>
                  <th className="w-20 py-2 font-normal">Edit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`border-b border-rule ${
                      row.id === selectedId ? "bg-surface" : ""
                    } ${row.is_visible ? "" : "opacity-55"}`}
                  >
                    <td className="nums py-2.5 text-ink-muted">{row.sort_order}</td>
                    <td className="py-2.5 text-ink">{row.organization}</td>
                    <td className="py-2.5 text-ink-body">{row.role}</td>
                    <td className="nums py-2.5 text-ink-muted">{row.start_date}</td>
                    <td className="nums py-2.5 text-ink-muted">{periodLabel(row)}</td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => toggleVisible(row)}
                        disabled={busy}
                        aria-label={row.is_visible ? "Hide this entry" : "Show this entry"}
                        className="inline-flex items-center gap-1.5 font-mono text-meta uppercase text-ink-muted transition-colors duration-150 ease-out hover:text-accent"
                      >
                        {row.is_visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                        {row.is_visible ? "Shown" : "Hidden"}
                      </button>
                    </td>
                    <td className="py-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedId(row.id === selectedId ? null : row.id)}
                        className="font-mono text-meta uppercase text-ink-muted transition-colors duration-150 ease-out hover:text-accent"
                      >
                        {row.id === selectedId ? "Close" : "Edit"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="border border-dashed border-rule py-12 text-center text-sm text-ink-muted">
            No entries yet.
          </p>
        )}
      </Panel>

      {draft ? (
        <Panel
          title={draft.organization || "Entry"}
          description="Order on the site is set by Sort, lowest first."
          action={
            <div className="flex items-center gap-2">
              <Button onClick={() => setSelectedId(null)} disabled={busy}>
                Close
              </Button>
              <Button variant="primary" onClick={save} disabled={busy || !dirty}>
                {busy ? "Saving…" : "Save"}
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Organization" htmlFor="xp-org">
              <Input
                id="xp-org"
                value={draft.organization}
                onChange={(event) => set("organization", event.target.value)}
              />
            </Field>
            <Field label="Team or department" htmlFor="xp-team" hint="Optional.">
              <Input
                id="xp-team"
                value={draft.team_or_department}
                onChange={(event) => set("team_or_department", event.target.value)}
              />
            </Field>
            <Field label="Role" htmlFor="xp-role">
              <Input
                id="xp-role"
                value={draft.role}
                onChange={(event) => set("role", event.target.value)}
              />
            </Field>
            <Field label="Type" htmlFor="xp-type">
              <Select
                id="xp-type"
                value={draft.experience_type}
                onChange={(event) => set("experience_type", event.target.value)}
              >
                <option value="">None</option>
                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Location" htmlFor="xp-location" hint="Optional.">
              <Input
                id="xp-location"
                value={draft.location}
                onChange={(event) => set("location", event.target.value)}
              />
            </Field>
            <Field label="External URL" htmlFor="xp-url" hint="Optional. Shows a link on the entry.">
              <Input
                id="xp-url"
                value={draft.external_url}
                onChange={(event) => set("external_url", event.target.value)}
                placeholder="https://"
              />
            </Field>
            <Field label="Start date" htmlFor="xp-start">
              <Input
                id="xp-start"
                type="date"
                value={draft.start_date}
                onChange={(event) => set("start_date", event.target.value)}
              />
            </Field>
            <Field
              label="End date"
              htmlFor="xp-end"
              hint={draft.is_current ? "Cleared while this role is current." : undefined}
            >
              <Input
                id="xp-end"
                type="date"
                value={draft.end_date}
                disabled={draft.is_current}
                onChange={(event) => set("end_date", event.target.value)}
              />
            </Field>
            <Field label="Sort order" htmlFor="xp-sort" hint="Lowest number shows first.">
              <Input
                id="xp-sort"
                type="number"
                value={draft.sort_order}
                onChange={(event) => set("sort_order", event.target.value)}
              />
            </Field>
            <Field label="Tags" htmlFor="xp-tags" hint="Separated by commas.">
              <Input
                id="xp-tags"
                value={draft.tags.join(", ")}
                onChange={(event) =>
                  set(
                    "tags",
                    event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean)
                  )
                }
              />
            </Field>
          </div>

          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={draft.is_current}
                onChange={(event) => setCurrent(event.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              Current role
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={draft.is_visible}
                onChange={(event) => set("is_visible", event.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              Visible on the site
            </label>
          </div>

          <div className="mt-4">
            <Field label="Summary" htmlFor="xp-summary">
              <Textarea
                id="xp-summary"
                rows={4}
                value={draft.summary}
                onChange={(event) => set("summary", event.target.value)}
              />
            </Field>
          </div>

          <div className="mt-6 border-t border-rule pt-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm text-ink">Highlights</h3>
                <p className="mt-0.5 text-meta text-ink-muted">
                  Optional. Leave empty and the entry still reads as complete.
                </p>
              </div>
              <Button onClick={addHighlight} disabled={busy}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {draft.highlights.length ? (
              <div className="space-y-3">
                {draft.highlights.map((item, index) => (
                  <div key={index} className="flex gap-3 border border-rule p-3">
                    <div className="grid flex-1 gap-3 md:grid-cols-[10rem_1fr]">
                      <Input
                        aria-label={`Highlight ${index + 1} label`}
                        placeholder="Problem"
                        value={item.label}
                        onChange={(event) => setHighlight(index, "label", event.target.value)}
                      />
                      <Textarea
                        aria-label={`Highlight ${index + 1} text`}
                        rows={2}
                        value={item.body}
                        onChange={(event) => setHighlight(index, "body", event.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      aria-label={`Remove highlight ${index + 1}`}
                      className="shrink-0 self-start p-2 text-ink-muted transition-colors duration-150 ease-out hover:text-accent"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-rule pt-5">
            {confirmingDelete ? (
              <>
                <p className="text-sm text-ink-body">Delete this entry?</p>
                <Button onClick={() => setConfirmingDelete(false)} disabled={busy}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={remove} disabled={busy}>
                  Delete
                </Button>
              </>
            ) : (
              <Button variant="danger" onClick={() => setConfirmingDelete(true)} disabled={busy}>
                <Trash2 className="h-4 w-4" />
                Delete entry
              </Button>
            )}
          </div>
        </Panel>
      ) : null}

      <Status status={status} />
    </div>
  );
}
