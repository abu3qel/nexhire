"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center items-start p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#0d1a2e] to-[#0a0f1e]" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(rgba(0,212,170,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,170,0.05) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10">
          <div className="text-[#00d4aa] font-sora text-2xl font-bold mb-2">NexHire</div>
          <h2 className="font-sora text-4xl font-bold text-white leading-tight mb-4">
            Join the future<br />of technical hiring.
          </h2>
          <p className="text-gray-400 text-lg max-w-sm">
            Recruiters discover exceptional engineers. Candidates get fairly assessed.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 bg-[#111827]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <h1 className="font-sora text-2xl font-bold text-white mb-2">Create account</h1>
          <p className="text-gray-400 text-sm mb-8">
            Already registered?{" "}
            <Link href="/login" className="text-[#00d4aa] hover:underline">Sign in</Link>
          </p>

          {/* Role toggle */}
          <div className="flex rounded-xl bg-[#0a0f1e] p-1 mb-6 border border-gray-800">
            {(["candidate", "recruiter"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                  role === r
                    ? "bg-[#00d4aa] text-[#0a0f1e]"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full name</label>
              <input
                {...register("full_name")}
                placeholder="Jane Smith"
                className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60 transition-colors"
              />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60 transition-colors"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="Minimum 8 characters"
                className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60 transition-colors"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <AnimatePresence>
              {role === "recruiter" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-sm text-gray-400 mb-1 block">Company name</label>
                  <input
                    {...register("company_name")}
                    placeholder="Acme Corp"
                    className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60 transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" loading={loading} className="w-full justify-center mt-2" size="lg">
              Create account
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
