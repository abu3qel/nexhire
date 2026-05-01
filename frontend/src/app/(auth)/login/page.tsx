"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
type FormData = z.infer<typeof schema>;

const inputCls =
  "w-full bg-white border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}`);
      router.push(user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard");
    } catch {
      toast.error("Invalid email or password");
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
            Smarter hiring<br />starts here.
          </h2>
          <p className="text-white/45 text-sm leading-relaxed max-w-xs">
            Multi-modal AI assessment that goes beyond the resume to surface your best candidates.
          </p>

          <div className="mt-10 space-y-3">
            {["Resume + GitHub + Stack Overflow", "Confidence-weighted fusion", "RAG candidate assistant"].map(f => (
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

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-8">
            No account?{" "}
            <Link href="/register" className="text-brand-600 hover:text-brand-700 font-medium">
              Create one
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email</label>
              <input {...register("email")} type="email" placeholder="you@company.com" className={inputCls} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <input {...register("password")} type="password" placeholder="••••••••" className={inputCls} />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center mt-2" size="lg">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
