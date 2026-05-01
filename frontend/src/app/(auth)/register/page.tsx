"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  full_name: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  role: z.enum(["recruiter", "candidate"]),
  company_name: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const inputCls =
  "w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

export default function RegisterPage() {
  const router = useRouter();
  const { register: authRegister } = useAuth();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"recruiter" | "candidate">("candidate");

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "candidate" },
  });

  const handleRoleChange = (r: "recruiter" | "candidate") => {
    setRole(r);
    setValue("role", r);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const user = await authRegister(data);
      toast.success("Account created");
      router.push(user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/jobs");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F6FA]">
      {/* Left panel */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-[#0D1117] flex-col justify-between p-10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white text-sm font-black">N</span>
          </div>
          <span className="text-white font-bold tracking-tight">NexHire</span>
        </Link>

        <div>
          <h2 className="text-3xl font-extrabold text-white leading-snug mb-4 tracking-tight">
            Join the future<br />of technical hiring.
          </h2>
          <p className="text-white/45 text-sm leading-relaxed max-w-xs">
            Recruiters surface exceptional engineers. Candidates get assessed on real signals, not just paper.
          </p>

          <div className="mt-10 space-y-3">
            {["AI-powered signal fusion", "Transparent score breakdowns", "Explainable rankings"].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                <span className="text-white/45 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs">QMUL CS Final Year Project</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">N</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">NexHire</span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Create account</h1>
          <p className="text-gray-500 text-sm mb-8">
            Already registered?{" "}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">Sign in</Link>
          </p>

          {/* Role toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6 border border-gray-200">
            {(["candidate", "recruiter"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                  role === r
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full name</label>
              <input {...register("full_name")} placeholder="Jane Smith" className={inputCls} />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <input {...register("email")} type="email" placeholder="you@company.com" className={inputCls} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <input {...register("password")} type="password" placeholder="8 characters minimum" className={inputCls} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <AnimatePresence>
              {role === "recruiter" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">Company name</label>
                  <input {...register("company_name")} placeholder="Acme Corp" className={inputCls} />
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={loading} className="w-full justify-center mt-2" size="lg">
              Create account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
