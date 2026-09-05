import { useCallback, useEffect, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { supabase } from "../supabase";
import { Panel, Button, Status } from "./admin/AdminUI";
import { ISSUERS, getIssuer, slugFor } from "../data/certificateIssuers";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const STORAGE_MARKER = "/storage/v1/object/public/project-images/";

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [files, setFiles] = useState([]);
  const [issuer, setIssuer] = useState(ISSUERS[0]);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [status, setStatus] = useState({ kind: "info", message: "" });

  const say = (kind, message) => setStatus({ kind, message });

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("certificates")
      .select("id, Img")
      .order("id", { ascending: false });
    if (error) say("error", error.message);
    else setCertificates(data || []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const remove = async (certificate) => {
    setBusy(true);
    const { data, error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", certificate.id)
      .select("id");
    if (error) say("error", error.message);
    else if (!data?.length) {
      say(
        "error",
        "Nothing changed. Check you are signed in as the admin account."
      );
    } else {
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

        {certificates.length > 0 ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {certificates.map((certificate) => {
              const confirming = pendingDelete === certificate.id;
              return (
                <li key={certificate.id} className="group relative border border-rule bg-surface">
                  <img
                    src={certificate.Img}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full bg-paper object-contain"
                  />
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
