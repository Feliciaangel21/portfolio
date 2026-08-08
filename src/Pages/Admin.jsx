import { useEffect, useState } from "react";
import { LogOut, Upload, X } from "lucide-react";
import { supabase } from "../supabase";
import { getProjectImages } from "../utils/projectImages";
import AdminCertificates from "../components/AdminCertificates";

const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || "feliciaangel21@gmail.com").toLowerCase();
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export default function Admin() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState(ADMIN_EMAIL || "");
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session || (ADMIN_EMAIL && session.user.email?.toLowerCase() !== ADMIN_EMAIL)) return;
    supabase.from("projects").select("id, Title, Img, Images").order("id", { ascending: false }).then(({ data, error }) => {
      if (error) setMessage(error.message);
      else setProjects(data || []);
    });
  }, [session]);

  const selectedProject = projects.find((project) => String(project.id) === projectId);
  useEffect(() => { setImages(selectedProject ? getProjectImages(selectedProject) : []); setFiles([]); }, [selectedProject]);

  const signIn = async (event) => {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "Signed in."); setBusy(false);
  };

  const upload = async (event) => {
    event.preventDefault();
    if (!selectedProject || !files.length) return;
    const invalid = files.find((file) => !file.type.startsWith("image/") || file.size > MAX_FILE_SIZE);
    if (invalid) { setMessage(`${invalid.name} must be an image smaller than 8 MB.`); return; }
    setBusy(true); setMessage("");
    const uploadedUrls = [];
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${selectedProject.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage.from("project-images").upload(path, file, { contentType: file.type });
      if (error) { setMessage(error.message); setBusy(false); return; }
      uploadedUrls.push(supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl);
    }
    const nextImages = [...images, ...uploadedUrls];
    const { error } = await supabase.from("projects").update({ Images: nextImages, Img: nextImages[0] }).eq("id", selectedProject.id);
    if (error) setMessage(error.message);
    else {
      setImages(nextImages);
      setProjects((current) => current.map((project) => project.id === selectedProject.id ? { ...project, Images: nextImages, Img: nextImages[0] } : project));
      setFiles([]); localStorage.removeItem("projects"); setMessage(`${uploadedUrls.length} image${uploadedUrls.length === 1 ? "" : "s"} uploaded.`);
    }
    setBusy(false);
  };

  const removeImage = async (image) => {
    const nextImages = images.filter((item) => item !== image); setBusy(true);
    const { error } = await supabase.from("projects").update({ Images: nextImages, Img: nextImages[0] || null }).eq("id", selectedProject.id);
    if (error) setMessage(error.message);
    else {
      setImages(nextImages);
      setProjects((current) => current.map((project) => project.id === selectedProject.id ? { ...project, Images: nextImages, Img: nextImages[0] || null } : project));
      localStorage.removeItem("projects"); setMessage("Image removed from this project.");
    }
    setBusy(false);
  };

  const isAllowed = session && (!ADMIN_EMAIL || session.user.email?.toLowerCase() === ADMIN_EMAIL);
  if (!session) return <main className="min-h-screen bg-[#030014] px-5 flex items-center justify-center text-white"><form onSubmit={signIn} className="w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-xl"><div><h1 className="text-2xl font-bold">Portfolio admin</h1><p className="mt-1 text-sm text-slate-400">Sign in to manage project images.</p></div><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-purple-400" /><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-purple-400" /><button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 font-semibold disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>{message && <p className="text-sm text-amber-300">{message}</p>}</form></main>;
  if (!isAllowed) return <main className="min-h-screen bg-[#030014] flex items-center justify-center text-white">This account is not allowed.</main>;

  return <main className="min-h-screen bg-[#030014] px-5 py-10 text-white"><div className="mx-auto max-w-5xl space-y-7"><header className="flex items-center justify-between"><div><h1 className="text-3xl font-bold">Portfolio admin</h1><p className="text-sm text-slate-400">Signed in as {session.user.email}</p></div><button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 hover:bg-white/5"><LogOut className="h-4 w-4" /> Sign out</button></header><section className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6"><div><h2 className="text-xl font-semibold">Project images</h2><p className="text-sm text-slate-400">Add multiple screenshots to a project.</p></div><label className="block"><span className="mb-2 block text-sm text-slate-300">Project</span><select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#111027] px-4 py-3"><option value="">Choose a project…</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.Title}</option>)}</select></label>{selectedProject && <><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{images.map((image) => <div key={image} className="group relative overflow-hidden rounded-xl border border-white/10"><img src={image} alt="" className="aspect-video h-full w-full object-contain bg-black/20" /><button type="button" disabled={busy} onClick={() => removeImage(image)} aria-label="Remove image" className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 opacity-90 hover:opacity-100"><X className="h-4 w-4" /></button></div>)}</div><form onSubmit={upload} className="space-y-3"><input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []))} className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-500/20 file:px-4 file:py-2 file:text-purple-200" /><button disabled={busy || !files.length} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 font-semibold disabled:opacity-40"><Upload className="h-4 w-4" /> {busy ? "Saving…" : `Upload ${files.length || ""} image${files.length === 1 ? "" : "s"}`}</button></form></>}{message && <p className="text-sm text-amber-300">{message}</p>}</section><AdminCertificates /></div></main>;
}
