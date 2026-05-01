"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import toast from "react-hot-toast";
import { jobsApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

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

const WEIGHT_KEYS = [
  { key: "w_resume" as const, label: "Resume" },
  { key: "w_cover_letter" as const, label: "Cover Letter" },
  { key: "w_github" as const, label: "GitHub" },
  { key: "w_stackoverflow" as const, label: "Stack Overflow" },
  { key: "w_portfolio" as const, label: "Portfolio" },
];

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white";
const labelCls = "text-sm font-medium text-gray-700 mb-1.5 block";

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

  const onSubmit = async (data: FormData) => {
    if (!weightValid) { toast.error("Weights must sum to 1.0"); return; }
    setLoading(true);
    try {
      await jobsApi.create({
        title: data.title, location: data.location, job_type: data.job_type, status: data.status,
        description: data.description,
        required_skills: data.required_skills.split(",").map(s => s.trim()).filter(Boolean),
        modality_weights: {
          resume: data.w_resume, cover_letter: data.w_cover_letter, github: data.w_github,
          stackoverflow: data.w_stackoverflow, portfolio: data.w_portfolio,
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

  const values = getValues();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Create Job Posting</h1>

        {/* Step indicator */}
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < step ? "bg-brand-600 text-white" :
                  i === step ? "bg-brand-600 text-white ring-4 ring-brand-100" :
                  "bg-gray-200 text-gray-500"
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:block ${i === step ? "font-medium text-gray-900" : "text-gray-400"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-10 h-px bg-gray-200 mx-3" />}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            <div className="rounded-xl bg-white border border-gray-200 p-6">
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900 mb-5">Job Basics</h2>
                  <div>
                    <label className={labelCls}>Job Title <span className="text-red-500">*</span></label>
                    <input {...register("title")} placeholder="e.g. Senior Backend Engineer" className={inputCls} />
                    {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Location <span className="text-red-500">*</span></label>
                    <input {...register("location")} placeholder="e.g. London, UK / Remote" className={inputCls} />
                    {errors.location && <p className="text-red-600 text-xs mt-1">{errors.location.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Job Type</label>
                      <select {...register("job_type")} className={inputCls}>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select {...register("status")} className={inputCls}>
                        <option value="open">Open</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-base font-semibold text-gray-900 mb-1">Job Description</h2>
                  <p className="text-xs text-gray-500 mb-4">This text is used as the reference for all semantic scoring. Be detailed about required skills, responsibilities, and tech stack.</p>
                  <div>
                    <label className={labelCls}>Full Job Description <span className="text-red-500">*</span></label>
                    <textarea {...register("description")} rows={10} placeholder="We are looking for..." className={inputCls + " resize-none"} />
                    {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Required Skills <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input {...register("required_skills")} placeholder="Python, FastAPI, PostgreSQL, Docker" className={inputCls} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-semibold text-gray-900">Modality Weights</h2>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${weightValid ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      Total: {(totalWeight * 100).toFixed(0)}%
                    </span>
                  </div>
                  {!weightValid && <p className="text-red-600 text-xs -mt-2">Weights must sum to 100%</p>}

                  {WEIGHT_KEYS.map(({ key, label }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-gray-700 font-medium">{label}</label>
                        <span className="text-sm font-semibold text-brand-600">{Math.round((watch(key) || 0) * 100)}%</span>
                      </div>
                      <input
                        type="range" min="0" max="1" step="0.05"
                        value={watch(key) || 0}
                        onChange={(e) => setValue(key, parseFloat(e.target.value))}
                        className="w-full accent-brand-600"
                      />
                    </div>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-1">
                  <h2 className="text-base font-semibold text-gray-900 mb-5">Review and Submit</h2>
                  {[
                    { label: "Title", value: values.title },
                    { label: "Location", value: values.location },
                    { label: "Type", value: values.job_type?.replace("_", " ") },
                    { label: "Status", value: values.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between py-2.5 border-b border-gray-100 text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900 capitalize">{value}</span>
                    </div>
                  ))}
                  <div className="pt-3">
                    <p className="text-sm text-gray-500 mb-2">Modality weights</p>
                    <div className="flex flex-wrap gap-1.5">
                      {WEIGHT_KEYS.map(({ key, label }) => (
                        <span key={key} className="text-xs px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                          {label}: {Math.round((watch(key) || 0) * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-5">
          <Button type="button" variant="secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            Previous
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep(s => s + 1)}>Next</Button>
          ) : (
            <Button type="submit" loading={loading}>Create Job Posting</Button>
          )}
        </div>
      </form>
    </div>
  );
}
