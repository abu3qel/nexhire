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
  label: string; accept: string; file: File | null; onFile: (f: File) => void; required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault(); setDragging(false);
          const f = e.dataTransfer.files[0]; if (f) onFile(f);
        }}
        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
          dragging ? "border-brand-400 bg-brand-50" :
          file ? "border-brand-300 bg-brand-50" :
          "border-gray-200 hover:border-gray-300 bg-gray-50"
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-2 text-sm text-brand-600 font-medium">
            <FileText className="w-4 h-4" />{file.name}
          </div>
        ) : (
          <div>
            <Upload className="w-7 h-7 text-gray-400 mx-auto mb-1.5" />
            <p className="text-sm text-gray-500">Drop file here or click to upload</p>
            <p className="text-xs text-gray-400 mt-0.5">PDF or DOCX</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>
    </div>
  );
}

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white transition";
const inputErrCls = "w-full border border-red-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white transition";

function sanitizeUrl(val: string): string {
  const trimmed = val.trim();
  if (!trimmed) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

function validateGithubUrl(val: string): string {
  if (!val) return "";
  return /^https:\/\/github\.com\/[^/?#]+\/?$/.test(val)
    ? ""
    : "Must be a GitHub profile URL — e.g. https://github.com/username";
}

function validateSoUrl(val: string): string {
  if (!val) return "";
  return /^https:\/\/stackoverflow\.com\/users\/[^/?#]/.test(val)
    ? ""
    : "Must be a Stack Overflow profile URL — e.g. https://stackoverflow.com/users/123456";
}

function validatePortfolioUrl(val: string): string {
  if (!val) return "";
  try {
    return new URL(val).protocol === "https:" ? "" : "Must start with https://";
  } catch {
    return "Must be a valid URL — e.g. https://yoursite.com";
  }
}

export function ApplicationForm({ job, onClose }: Props) {
  const qc = useQueryClient();
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [soUrl, setSoUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [urlErrors, setUrlErrors] = useState({ github: "", so: "", portfolio: "" });

  const handleBlur = (field: "github" | "so" | "portfolio", val: string) => {
    const sanitized = sanitizeUrl(val);
    const err =
      field === "github" ? validateGithubUrl(sanitized) :
      field === "so" ? validateSoUrl(sanitized) :
      validatePortfolioUrl(sanitized);
    setUrlErrors(prev => ({ ...prev, [field]: err }));
  };

  const submit = async () => {
    if (!resume) { toast.error("Resume is required"); return; }

    const finalGithub = sanitizeUrl(githubUrl);
    const finalSo = sanitizeUrl(soUrl);
    const finalPortfolio = sanitizeUrl(portfolioUrl);

    const errors = {
      github: validateGithubUrl(finalGithub),
      so: validateSoUrl(finalSo),
      portfolio: validatePortfolioUrl(finalPortfolio),
    };
    if (errors.github || errors.so || errors.portfolio) {
      setUrlErrors(errors);
      return;
    }

    const fd = new FormData();
    fd.append("job_id", job.id);
    fd.append("resume", resume);
    if (coverLetter) fd.append("cover_letter", coverLetter);
    if (finalGithub) fd.append("github_url", finalGithub);
    if (finalSo) fd.append("stackoverflow_url", finalSo);
    if (finalPortfolio) fd.append("portfolio_url", finalPortfolio);

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
        className="fixed inset-0 bg-black/40 z-50 flex justify-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="font-bold text-gray-900 text-base">Apply for Position</h2>
              <p className="text-xs text-gray-500 mt-0.5">{job.title}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-5">
            <FileDropZone label="Resume" accept=".pdf,.docx" file={resume} onFile={setResume} required />
            <FileDropZone label="Cover Letter (optional)" accept=".pdf,.docx" file={coverLetter} onFile={setCoverLetter} />

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2 block">
                <Github className="w-4 h-4 text-gray-500" /> GitHub URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                value={githubUrl}
                onChange={e => { setGithubUrl(e.target.value); setUrlErrors(prev => ({ ...prev, github: "" })); }}
                onBlur={() => handleBlur("github", githubUrl)}
                placeholder="https://github.com/username"
                className={urlErrors.github ? inputErrCls : inputCls}
              />
              {urlErrors.github && <p className="text-red-500 text-xs mt-1">{urlErrors.github}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                Stack Overflow URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                value={soUrl}
                onChange={e => { setSoUrl(e.target.value); setUrlErrors(prev => ({ ...prev, so: "" })); }}
                onBlur={() => handleBlur("so", soUrl)}
                placeholder="https://stackoverflow.com/users/123456"
                className={urlErrors.so ? inputErrCls : inputCls}
              />
              {urlErrors.so && <p className="text-red-500 text-xs mt-1">{urlErrors.so}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2 block">
                <Globe className="w-4 h-4 text-gray-500" /> Portfolio URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                value={portfolioUrl}
                onChange={e => { setPortfolioUrl(e.target.value); setUrlErrors(prev => ({ ...prev, portfolio: "" })); }}
                onBlur={() => handleBlur("portfolio", portfolioUrl)}
                placeholder="https://yourportfolio.com"
                className={urlErrors.portfolio ? inputErrCls : inputCls}
              />
              {urlErrors.portfolio && <p className="text-red-500 text-xs mt-1">{urlErrors.portfolio}</p>}
            </div>

            <div className="pt-2 flex gap-3">
              <Button variant="secondary" className="flex-1 justify-center" onClick={onClose}>Cancel</Button>
              <Button className="flex-1 justify-center" loading={loading} onClick={submit}>Submit Application</Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
