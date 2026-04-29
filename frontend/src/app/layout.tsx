import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "NexHire — Multi-Modal Candidate Assessment",
  description: "AI-powered technical candidate assessment across Resume, GitHub, Stack Overflow, Cover Letter, and Portfolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0f1e] text-gray-100 antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1f2937",
                color: "#f9fafb",
                border: "1px solid rgba(0,212,170,0.2)",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
