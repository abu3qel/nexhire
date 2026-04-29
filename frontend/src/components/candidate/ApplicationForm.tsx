"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Github, Globe, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api";
import { Job } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface Props {
  job: Job;
  onClose: () => void;
}

function FileDropZone({ label, accept, file, onFile, required }: {
  label: string;
  accept: string;
  file: File | null;
  onFile: (f: File) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <label className="text-sm text-gray-400 mb-1.5 block">{label} {required && <span className="text-[#00d4aa]">*</span>}</label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) onFile(f);
        }}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragging ? "border-teal-500/60 bg-teal-500/5" :
          file ? "border-teal-500/40 bg-teal-500/5" :
          "border-gray-700 hover:border-gray-600"
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-2 text-sm text-[#00d4aa]">
            <FileText className="w-4 h-4" />
            {file.name}
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Drop file here or click to upload</p>
            <p className="text-xs text-gray-600 mt-1">PDF or DOCX</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        />
      </div>
    </div>
  );
}

export function ApplicationForm({ job, onClose }: Props) {
  const qc = useQueryClient();
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [soUrl, setSoUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!resume) { toast.error("Resume is required"); return; }

    const fd = new FormData();
    fd.append("job_id", job.id);
    fd.append("resume", resume);
    if (coverLetter) fd.append("cover_letter", coverLetter);
    if (githubUrl) fd.append("github_url", githubUrl);
    if (soUrl) fd.append("stackoverflow_url", soUrl);
    if (portfolioUrl) fd.append("portfolio_url", portfolioUrl);

    setLoading(true);
    try {
      await applicationsApi.submit(fd);
      toast.success("Application submitted! Assessment is running in the background.");
      await qc.invalidateQueries({ queryKey: ["my-applications"] });
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Failed to submit";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full max-w-lg bg-[#111827] h-full overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 sticky top-0 bg-[#111827] z-10">
            <div>
              <h2 className="font-sora font-bold text-white">Apply for Position</h2>
              <p className="text-xs text-gray-500 mt-0.5">{job.title}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-5">
            <FileDropZone
              label="Resume"
              accept=".pdf,.docx"
              file={resume}
              onFile={setResume}
              required
            />
            <FileDropZone
              label="Cover Letter (optional)"
              accept=".pdf,.docx"
              file={coverLetter}
              onFile={setCoverLetter}
            />

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-2">
                <Github className="w-4 h-4" /> GitHub URL (optional)
              </label>
              <input
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Stack Overflow URL (optional)</label>
              <input
                value={soUrl}
                onChange={e => setSoUrl(e.target.value)}
                placeholder="https://stackoverflow.com/users/123456"
                className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1.5 block flex items-center gap-2">
                <Globe className="w-4 h-4" /> Portfolio URL (optional)
              </label>
              <input
                value={portfolioUrl}
                onChange={e => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button variant="ghost" className="flex-1 justify-center" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1 justify-center" loading={loading} onClick={submit}>
                Submit Application
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
