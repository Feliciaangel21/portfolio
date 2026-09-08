import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { supabase } from "../supabase";
import { Panel, Button, Input, Status } from "./admin/AdminUI";
import { ISSUERS, getIssuer, getTitle, slugFor } from "../data/certificateIssuers";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const STORAGE_MARKER = "/storage/v1/object/public/project-images/";

// A write refused by row level security comes back as success with no rows
// touched, so every write asks for the affected rows back.
const BLOCKED =
  "Nothing changed. Check you are signed in as the admin account and that the table allows this.";

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
];

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [hasTitle, setHasTitle] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [sort, setSort] = useState("newest");
  const [files, setFiles] = useState([]);
  const [issuer, setIssuer] = useState(ISSUERS[0]);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [status, setStatus] = useState({ kind: "info", message: "" });

  const say = (kind, message) => setStatus({ kind, message });

  // Selects every column and reads the names off a real row, so this screen
  // works whether or not the Title migration has been applied yet.
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      say("error", error.message);
      return;
    }
    const rows = data || [];
    setCertificates(rows);
    setHasTitle(rows.length ? Object.keys(rows[0]).includes("Title") : false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // There is no date on a certificate, so "newest" means most recently added,
  // which the identity column already orders.
  const ordered = useMemo(() => {
    const rows = [...certificates];
    rows.sort((a, b) => (sort === "newest" ? b.id - a.id : a.id - b.id));
    return rows;
  }, [certificates, sort]);

  const upload = async (event) => {
    event.preventDefault();
    if (!files.length) return;

    const invalid = files.find(
      (file) => !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE
    );
    if (invalid) {
      say("error", `${invalid.name} must be an image under 8 MB.`);
      return;
    }

    setBusy(true);
    say("info", "Uploading…");
    const rows = [];
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      // The certificates table has no issuer column, so the choice made here
      // is carried in the file name and read back when the site groups them.
      const path = `certificates/${slugFor(issuer)}--${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("project-images")
        .upload(path, file, { contentType: file.type });
      if (error) {
        say("error", error.message);
        setBusy(false);
        return;
      }
      rows.push({
        Img: supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl,
      });
    }

    const { error } = await supabase.from("certificates").insert(rows);
    if (error) say("error", error.message);
    else {
      setFiles([]);
      localStorage.removeItem("certificates");
      say("info", `${rows.length} certificate${rows.length === 1 ? "" : "s"} added.`);
      await load();
    }
    setBusy(false);
  };

  // Saved on blur rather than behind a per-card button: seventeen cards with
  // seventeen Save buttons is a lot of furniture for a one-field edit.
  const saveTitle = async (certificate) => {
    const next = (drafts[certificate.id] ?? "").trim();
    setDrafts((current) => {
      const rest = { ...current };
      delete rest[certificate.id];
      return rest;
    });
    if (next === (certificate.Title || "").trim()) return;

    setBusy(true);
    const { data, error } = await supabase
      .from("certificates")
      .update({ Title: next || null })
      .eq("id", certificate.id)
      .select("id, Title");
    if (error) say("error", error.message);
    else if (!data?.length) say("error", BLOCKED);
    else {
      setCertificates((current) =>
        current.map((item) => (item.id === certificate.id ? { ...item, Title: next || null } : item))
      );
      localStorage.removeItem("certificates");
      say("info", next ? "Name saved." : "Name cleared.");
    }
    setBusy(false);
  };

  const remove = async (certificate) => {
    setBusy(true);
    const { data, error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", certificate.id)
      .select("id");
    if (error) say("error", error.message);
    else if (!data?.length) say("error", BLOCKED);
    else {
      if (certificate.Img?.includes(STORAGE_MARKER)) {
        const path = decodeURIComponent(certificate.Img.split(STORAGE_MARKER)[1]);
        await supabase.storage.from("project-images").remove([path]);
      }
      setCertificates((current) => current.filter((item) => item.id !== certificate.id));
      localStorage.removeItem("certificates");
      say("info", "Certificate removed.");
    }
    setPendingDelete(null);
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      <Panel
        title="Certificates"
        description={`${certificates.length} on the site`}
        action={
          <div className="flex shrink-0 border border-rule" role="group" aria-label="Sort order">
            {SORTS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSort(option.id)}
                aria-pressed={sort === option.id}
                className={`px-3 py-2 font-mono text-meta uppercase transition-colors duration-150 ease-out ${
                  sort === option.id
                    ? "bg-ink text-paper"
                    : "text-ink-muted hover:bg-surface hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      >
        <form onSubmit={upload} className="mb-5 flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            multiple
            aria-label="Choose certificate images to upload"
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
            className="min-w-0 flex-1 text-sm text-ink-body file:mr-3 file:border file:border-rule file:bg-surface file:px-3 file:py-2 file:text-sm file:text-ink"
          />
          <label className="flex items-center gap-2 font-mono text-meta uppercase text-ink-muted">
            Issued by
            <select
              value={issuer}
              onChange={(event) => setIssuer(event.target.value)}
              className="border border-rule bg-paper px-3 py-2 font-sans text-sm normal-case text-ink"
            >
              {ISSUERS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <Button variant="primary" type="submit" disabled={busy || !files.length}>
            <Upload className="h-4 w-4" />
            {files.length ? `Upload ${files.length}` : "Upload"}
          </Button>
        </form>

        {certificates.length > 0 && !hasTitle ? (
          <p className="mb-4 border border-rule bg-surface px-4 py-3 text-sm text-ink-body">
            Names are not editable yet: the <code>certificates</code> table has no{" "}
            <code>Title</code> column. Run{" "}
            <code>supabase/migrations/20260908000000_certificate_title.sql</code> in the SQL
            editor, then reload. Until then the site falls back to the names written into{" "}
            <code>src/data/certificateIssuers.js</code>.
          </p>
        ) : null}

        {certificates.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {ordered.map((certificate) => {
              const confirming = pendingDelete === certificate.id;
              const draft = drafts[certificate.id];
              return (
                <li key={certificate.id} className="group relative border border-rule bg-surface">
                  <img
                    src={certificate.Img}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full bg-paper object-contain"
                  />

                  {hasTitle ? (
                    <div className="border-t border-rule p-2">
                      <label className="sr-only" htmlFor={`title-${certificate.id}`}>
                        Certificate name
                      </label>
                      <Input
                        id={`title-${certificate.id}`}
                        value={draft ?? certificate.Title ?? ""}
                        placeholder={getTitle(certificate) || "Untitled"}
                        disabled={busy}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [certificate.id]: event.target.value,
                          }))
                        }
                        onBlur={() => (draft === undefined ? null : saveTitle(certificate))}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") event.currentTarget.blur();
                        }}
                      />
                    </div>
                  ) : null}

                  {/* Two-step delete: the first click arms it, the second
                      commits. Removing a certificate also deletes the stored
                      file, so it is worth a beat of friction. */}
                  <span className="absolute left-1.5 top-1.5 bg-paper px-2 py-1 font-mono text-meta uppercase text-ink-muted">
                    {getIssuer(certificate)}
                  </span>
                  {confirming ? (
                    <div className="absolute inset-0 grid place-items-center gap-2 bg-paper/95 p-3 text-center">
                      <p className="text-meta text-ink-body">Delete this certificate?</p>
                      <div className="flex gap-2">
                        <Button onClick={() => setPendingDelete(null)} disabled={busy}>
                          Cancel
                        </Button>
                        <Button variant="danger" onClick={() => remove(certificate)} disabled={busy}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => setPendingDelete(certificate.id)}
                      aria-label="Remove certificate"
                      className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center bg-paper text-ink opacity-0 transition-opacity duration-150 ease-out hover:text-accent focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="border border-dashed border-rule py-12 text-center text-sm text-ink-muted">
            No certificates yet.
          </p>
        )}
      </Panel>

      <Status status={status} />
    </div>
  );
}
