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
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}!`);
      router.push(user.role === "recruiter" ? "/recruiter/dashboard" : "/candidate/dashboard");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-5/12 bg-[#1E293B] flex-col justify-between p-12">
        <div className="text-white font-bold text-xl tracking-tight">NexHire</div>
        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Smarter hiring<br />starts here.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Multi-modal AI assessment that goes beyond the resume to surface your best candidates.
          </p>
        </div>
        <p className="text-slate-600 text-xs">QMUL CS Final Year Project</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-white flex flex-col justify-center items-center px-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h1>
          <p className="text-slate-500 text-sm mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline font-medium">Register</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email address</label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>}
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
