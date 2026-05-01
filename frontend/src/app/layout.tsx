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
      <body className="bg-[#F5F6FA] text-gray-900 antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                color: "#111827",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
                fontSize: "14px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
