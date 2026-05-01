"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api";
import { Job } from "@/lib/types";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  title: z.string().min(3, "Title required"),
  location: z.string().min(2, "Location required"),
  job_type: z.enum(["full_time", "part_time", "contract", "internship"]),
  status: z.enum(["open", "closed", "draft"]),
  description: z.string().min(50, "Min 50 characters"),
  required_skills: z.string(),
});
type FormData = z.infer<typeof schema>;

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white";
const labelCls = "text-sm font-medium text-gray-700 mb-1.5 block";

interface Props {
  job: Job;
  onClose: () => void;
}

export function EditJobModal({ job, onClose }: Props) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: job.title,
      location: job.location,
      job_type: job.job_type,
      status: job.status,
      description: job.description,
      required_skills: job.required_skills.join(", "),
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await jobsApi.update(job.id, {
        title: data.title,
        location: data.location,
        job_type: data.job_type,
        status: data.status,
        description: data.description,
        required_skills: data.required_skills.split(",").map(s => s.trim()).filter(Boolean),
      });
      toast.success("Job updated");
      qc.invalidateQueries({ queryKey: ["job", job.id] });
      qc.invalidateQueries({ queryKey: ["recruiter-jobs"] });
      onClose();
    } catch {
      toast.error("Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Edit Job Posting</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className={labelCls}>Job Title</label>
            <input {...register("title")} className={inputCls} />
            {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Location</label>
            <input {...register("location")} className={inputCls} />
            {errors.location && <p className="text-red-600 text-xs mt-1">{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Type</label>
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
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea {...register("description")} rows={6} className={inputCls + " resize-none"} />
            {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Required Skills (comma-separated)</label>
            <input {...register("required_skills")} className={inputCls} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
