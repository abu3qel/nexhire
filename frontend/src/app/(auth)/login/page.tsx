"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
            Smarter hiring<br />starts here.
          </h2>
          <p className="text-gray-400 text-lg max-w-sm">
            Multi-modal AI assessment that goes beyond the resume.
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
          <h1 className="font-sora text-2xl font-bold text-white mb-2">Sign in</h1>
          <p className="text-gray-400 text-sm mb-8">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#00d4aa] hover:underline">Register</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                placeholder="••••••••"
                className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-teal-500/60 transition-colors"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center mt-2" size="lg">
              Sign in
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
