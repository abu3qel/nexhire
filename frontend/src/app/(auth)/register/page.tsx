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
      toast.success("Account created!");
      router.push(user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/jobs");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Registration failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-5/12 bg-[#1E293B] flex-col justify-between p-12">
        <div className="text-white font-bold text-xl tracking-tight">NexHire</div>
        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Join the future<br />of technical hiring.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Recruiters discover exceptional engineers. Candidates get fairly assessed on what matters most.
          </p>
        </div>
        <p className="text-slate-600 text-xs">QMUL CS Final Year Project</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Create account</h1>
          <p className="text-slate-500 text-sm mb-8">
            Already registered?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>

          {/* Role toggle */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6 border border-slate-200">
            {(["candidate", "recruiter"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                  role === r
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Full name</label>
              <input {...register("full_name")} placeholder="Jane Smith" className={inputCls} />
              {errors.full_name && <p className="text-red-600 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email address</label>
              <input {...register("email")} type="email" placeholder="you@example.com" className={inputCls} />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
              <input {...register("password")} type="password" placeholder="Minimum 8 characters" className={inputCls} />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <AnimatePresence>
              {role === "recruiter" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Company name</label>
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
