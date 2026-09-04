import { Upload, FileText, Trash2, FileType, Download, Eye, X } from 'lucide-react';
import { useState } from 'react';
import { useDocuments } from '@/lib/data';

export default function Documents() {
  const { documents: docs, loading, add, remove } = useDocuments();
  const [preview, setPreview] = useState<string | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      await add({ name: f.name, type: f.name.endsWith('.pdf') ? 'PDF' : 'Document', size: f.size, date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) });
    } catch {
      // ignore upload errors for now
    }
    e.target.value = '';
  };

  const fmtSize = (b: number) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1e3).toFixed(0)} KB`;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="display text-xl font-extrabold text-[#102c3a]">Medical Document Vault</h1>
        <p className="text-sm text-[#5a7785]">Keep your reports and prescriptions in one place.</p>
      </div>

      <label className="card flex cursor-pointer flex-col items-center gap-3 border-dashed p-8 text-center transition-colors hover:border-[#0b8f91]">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e6f5f5] text-[#0b8f91]"><Upload size={22} /></span>
        <div>
          <p className="text-sm font-bold text-[#102c3a]">Upload a document</p>
          <p className="text-xs text-[#5a7785]">Tap to choose a file</p>
        </div>
        <input type="file" className="hidden" onChange={onFile} />
      </label>

      <div className="flex flex-col gap-3">
        {loading ? (
          [0, 1, 2].map((i) => <div key={i} className="card h-16 animate-pulse bg-[#f3f9fa]" />)
        ) : (
          docs.map((d) => (
            <div key={d.id} className="card flex items-center gap-3 p-4">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f3f9fa] text-[#0b8f91]"><FileType size={18} /></span>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#102c3a]">{d.name}</p>
                <p className="text-xs text-[#5a7785]">{d.type} · {fmtSize(d.size)} · {d.date}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setPreview(d.name)} className="grid h-8 w-8 place-items-center rounded-full text-[#5a7785] hover:bg-[#e6f5f5] hover:text-[#0b8f91]"><Eye size={15} /></button>
                <button className="grid h-8 w-8 place-items-center rounded-full text-[#5a7785] hover:bg-[#e6f5f5] hover:text-[#0b8f91]"><Download size={15} /></button>
                <button onClick={() => remove(d.id)} className="grid h-8 w-8 place-items-center rounded-full text-[#b9cdd2] hover:bg-red-50 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            </div>
          ))
        )}
        {!loading && docs.length === 0 && <p className="card p-8 text-center text-sm text-[#5a7785]"><FileText size={24} className="mx-auto mb-2 text-[#b9cdd2]" />No documents uploaded yet.</p>}
      </div>
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setPreview(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center">
            <button onClick={() => setPreview(null)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full hover:bg-[#eef6f7]"><X size={18} className="text-[#5a7785]" /></button>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e6f5f5] text-[#0b8f91]"><FileType size={28} /></span>
            <p className="mt-3 text-sm font-bold text-[#102c3a]">{preview}</p>
            <p className="mt-1 text-xs text-[#5a7785]">File preview is not available in this demo. In a full version, the document would open here.</p>
          </div>
        </div>
      )}
    </div>
  );
}
