"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { applicationsApi } from "@/lib/api";
import { ApplicationStatus } from "@/lib/types";

const STATUSES: { value: ApplicationStatus; label: string; cls: string }[] = [
  { value: "submitted",    label: "Submitted",    cls: "text-amber-700 hover:bg-amber-50" },
  { value: "under_review", label: "Under Review", cls: "text-brand-700 hover:bg-brand-50" },
  { value: "shortlisted",  label: "Shortlisted",  cls: "text-emerald-700 hover:bg-emerald-50" },
  { value: "rejected",     label: "Rejected",     cls: "text-red-700 hover:bg-red-50" },
];

const triggerVariant: Record<ApplicationStatus, string> = {
  submitted:    "bg-amber-50 text-amber-700 border-amber-200",
  under_review: "bg-brand-50 text-brand-700 border-brand-200",
  shortlisted:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected:     "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  applicationId: string;
  currentStatus: ApplicationStatus;
  jobId: string;
}

export function StatusSelector({ applicationId, currentStatus, jobId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const qc = useQueryClient();

  const current = STATUSES.find(s => s.value === currentStatus) ?? STATUSES[0];

  const openDropdown = () => {
    if (buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [open]);

  const select = async (status: ApplicationStatus) => {
    if (status === currentStatus) { setOpen(false); return; }
    setOpen(false);
    setLoading(true);
    try {
      await applicationsApi.updateStatus(applicationId, status);
      await qc.invalidateQueries({ queryKey: ["ranked", jobId] });
      await qc.invalidateQueries({ queryKey: ["application", applicationId] });
      toast.success(`Moved to "${STATUSES.find(s => s.value === status)?.label}"`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const dropdown = (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.1 }}
            style={{ position: "absolute", top: pos.top, left: pos.left }}
            className="z-[9999] w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => select(s.value)}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${s.cls}
                  ${s.value === currentStatus ? "opacity-50 cursor-default" : ""}`}
              >
                {s.label}
                {s.value === currentStatus && " ✓"}
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={openDropdown}
        disabled={loading}
        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border transition-colors disabled:opacity-50 ${triggerVariant[currentStatus] || "bg-gray-100 text-gray-600 border-gray-200"}`}
      >
        {loading && (
          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {current.label}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
}
