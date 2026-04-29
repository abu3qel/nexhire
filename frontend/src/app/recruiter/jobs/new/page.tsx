"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { jobsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const STEPS = ["Basics", "Description", "Weights", "Review"];

const schema = z.object({
  title: z.string().min(3, "Title required"),
  location: z.string().min(2, "Location required"),
  job_type: z.enum(["full_time", "part_time", "contract", "internship"]),
  status: z.enum(["open", "draft"]),
  description: z.string().min(50, "Please write a detailed job description (min 50 chars)"),
  required_skills: z.string(),
  w_resume: z.number().min(0).max(1),
  w_cover_letter: z.number().min(0).max(1),
  w_github: z.number().min(0).max(1),
  w_stackoverflow: z.number().min(0).max(1),
  w_portfolio: z.number().min(0).max(1),
});
type FormData = z.infer<typeof schema>;

const DEFAULT_WEIGHTS = { w_resume: 0.35, w_cover_letter: 0.15, w_github: 0.25, w_stackoverflow: 0.15, w_portfolio: 0.10 };

export default function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "open", job_type: "full_time", ...DEFAULT_WEIGHTS },
  });

  const weights = {
    resume: watch("w_resume") || 0,
    cover_letter: watch("w_cover_letter") || 0,
    github: watch("w_github") || 0,
    stackoverflow: watch("w_stackoverflow") || 0,
    portfolio: watch("w_portfolio") || 0,
  };
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const weightValid = Math.abs(totalWeight - 1.0) < 0.01;

  const WEIGHT_KEYS = [
    { key: "w_resume" as const, label: "Resume" },
    { key: "w_cover_letter" as const, label: "Cover Letter" },
    { key: "w_github" as const, label: "GitHub" },
    { key: "w_stackoverflow" as const, label: "Stack Overflow" },
    { key: "w_portfolio" as const, label: "Portfolio" },
  ];

  const onSubmit = async (data: FormData) => {
    if (!weightValid) { toast.error("Weights must sum to 1.0"); return; }
    setLoading(true);
    try {
      await jobsApi.create({
        title: data.title,
        location: data.location,
        job_type: data.job_type,
        status: data.status,
        description: data.description,
        required_skills: data.required_skills.split(",").map(s => s.trim()).filter(Boolean),
        modality_weights: {
          resume: data.w_resume,
          cover_letter: data.w_cover_letter,
          github: data.w_github,
          stackoverflow: data.w_stackoverflow,
          portfolio: data.w_portfolio,
        },
      });
      toast.success("Job posting created!");
      router.push("/recruiter/jobs");
    } catch {
      toast.error("Failed to create job posting");
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };
  const goPrev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const values = getValues();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-sora text-2xl font-bold text-white mb-6">Create Job Posting</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                i < step ? "bg-[#00d4aa] text-[#0a0f1e]" :
                i === step ? "bg-teal-500/20 text-[#00d4aa] border border-teal-500/50" :
                "bg-gray-800 text-gray-500"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i === step ? "text-white" : "text-gray-500"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-700 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              {/* Step 1: Basics */}
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="font-sora font-semibold text-white mb-4">Job Basics</h2>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Job Title *</label>
                    <input {...register("title")} placeholder="e.g. Senior Backend Engineer" className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60" />
                    {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Location *</label>
                    <input {...register("location")} placeholder="e.g. London, UK / Remote" className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60" />
                    {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Job Type</label>
                      <select {...register("job_type")} className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-teal-500/60">
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Status</label>
                      <select {...register("status")} className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-teal-500/60">
                        <option value="open">Open</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Description */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-sora font-semibold text-white mb-4">Job Description</h2>
                  <p className="text-xs text-gray-500">This text is used as the reference for all semantic scoring. Be detailed about required skills, responsibilities, and tech stack.</p>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Full Job Description *</label>
                    <textarea {...register("description")} rows={10} placeholder="We are looking for..." className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60 resize-none" />
                    {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Required Skills (comma-separated)</label>
                    <input {...register("required_skills")} placeholder="Python, FastAPI, PostgreSQL, Docker" className="w-full bg-[#0a0f1e] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60" />
                  </div>
                </div>
              )}

              {/* Step 3: Weights */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-sora font-semibold text-white">Modality Weights</h2>
                    <span className={`text-sm font-mono px-2 py-0.5 rounded-lg ${weightValid ? "text-[#00d4aa] bg-teal-500/10" : "text-red-400 bg-red-500/10"}`}>
                      Total: {(totalWeight * 100).toFixed(0)}%
                    </span>
                  </div>
                  {!weightValid && <p className="text-red-400 text-xs">Weights must sum to 100%</p>}

                  {WEIGHT_KEYS.map(({ key, label }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm text-gray-300">{label}</label>
                        <span className="text-sm font-mono text-[#00d4aa]">{Math.round((watch(key) || 0) * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.05"
                        value={watch(key) || 0}
                        onChange={(e) => setValue(key, parseFloat(e.target.value))}
                        className="w-full accent-teal-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Review */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-sora font-semibold text-white mb-4">Review & Submit</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Title</span>
                      <span className="text-white font-medium">{values.title}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Location</span>
                      <span className="text-white">{values.location}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Type</span>
                      <span className="text-white">{values.job_type?.replace("_", " ")}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400">Status</span>
                      <span className="text-white capitalize">{values.status}</span>
                    </div>
                    <div className="py-2 border-b border-gray-800">
                      <span className="text-gray-400 block mb-1">Weights</span>
                      <div className="flex flex-wrap gap-2">
                        {WEIGHT_KEYS.map(({ key, label }) => (
                          <span key={key} className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-[#00d4aa] border border-teal-500/20">
                            {label}: {Math.round((watch(key) || 0) * 100)}%
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="secondary" onClick={goPrev} disabled={step === 0}>
            ← Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>Next →</Button>
          ) : (
            <Button type="submit" loading={loading}>Create Job Posting</Button>
          )}
        </div>
      </form>
    </div>
  );
}
