import { useCallback, useEffect, useState } from "react";
import { Award, Trash2, Upload } from "lucide-react";
import { supabase } from "../supabase";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadCertificates = useCallback(async () => {
    const { data, error } = await supabase.from("certificates").select("id, Img").order("id", { ascending: false });
    if (error) setMessage(error.message);
    else setCertificates(data || []);
  }, []);

  useEffect(() => { loadCertificates(); }, [loadCertificates]);

  const uploadCertificates = async (event) => {
    event.preventDefault();
    if (!files.length) return;
    const invalid = files.find((file) => !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE);
    if (invalid) { setMessage(`${invalid.name} must be an image smaller than 8 MB.`); return; }

    setBusy(true);
    setMessage("");
    const rows = [];
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `certificates/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("project-images").upload(path, file, { contentType: file.type });
      if (error) { setMessage(error.message); setBusy(false); return; }
      rows.push({ Img: supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl });
    }

    const { error } = await supabase.from("certificates").insert(rows);
    if (error) setMessage(error.message);
    else {
      setFiles([]);
      localStorage.removeItem("certificates");
      setMessage(`${rows.length} certificate${rows.length === 1 ? "" : "s"} uploaded.`);
      await loadCertificates();
    }
    setBusy(false);
  };

  const removeCertificate = async (certificate) => {
    setBusy(true);
    setMessage("");
    const { error } = await supabase.from("certificates").delete().eq("id", certificate.id);
    if (error) setMessage(error.message);
    else {
      const marker = "/storage/v1/object/public/project-images/";
      if (certificate.Img.includes(marker)) {
        const path = decodeURIComponent(certificate.Img.split(marker)[1]);
        await supabase.storage.from("project-images").remove([path]);
      }
      setCertificates((current) => current.filter((item) => item.id !== certificate.id));
      localStorage.removeItem("certificates");
      setMessage("Certificate removed.");
    }
    setBusy(false);
  };

  return <section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
    <div className="flex items-center gap-3"><Award className="h-6 w-6 text-purple-300" /><div><h2 className="text-xl font-semibold">Certificates</h2><p className="text-sm text-slate-400">Upload one or several certificate images.</p></div></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{certificates.map((certificate) =>
      <div key={certificate.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/20">
        <img src={certificate.Img} alt={`Certificate ${certificate.id}`} className="aspect-[4/3] h-full w-full object-contain" />
        <button type="button" disabled={busy} onClick={() => removeCertificate(certificate)} aria-label="Remove certificate" className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white opacity-90 transition hover:opacity-100 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
      </div>
    )}</div>
    <form onSubmit={uploadCertificates} className="space-y-3">
      <input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-500/20 file:px-4 file:py-2 file:text-purple-200" />
      <button disabled={busy || !files.length} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 font-semibold disabled:opacity-40"><Upload className="h-4 w-4" />{busy ? "Saving…" : `Upload ${files.length || ""} certificate${files.length === 1 ? "" : "s"}`}</button>
    </form>
    {message && <p className="text-sm text-amber-300">{message}</p>}
  </section>;
}
