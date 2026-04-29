"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { applicationsApi } from "@/lib/api";
import { ApplicationStatus } from "@/lib/types";

const STATUSES: { value: ApplicationStatus; label: string; color: string; bg: string }[] = [
  { value: "submitted",    label: "Submitted",    color: "text-gray-400",  bg: "bg-gray-700/50 hover:bg-gray-700" },
  { value: "under_review", label: "Under Review", color: "text-[#00d4aa]", bg: "bg-teal-500/10 hover:bg-teal-500/20" },
  { value: "shortlisted",  label: "Shortlisted",  color: "text-green-400", bg: "bg-green-500/10 hover:bg-green-500/20" },
  { value: "rejected",     label: "Rejected",     color: "text-red-400",   bg: "bg-red-500/10 hover:bg-red-500/20" },
];

interface Props {
  applicationId: string;
  currentStatus: ApplicationStatus;
  jobId: string;
}

export function StatusSelector({ applicationId, currentStatus, jobId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const qc = useQueryClient();

  const current = STATUSES.find(s => s.value === currentStatus) ?? STATUSES[0];

  // Calculate position from button rect so the portal lands in the right spot
  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setOpen(true);
  };

  // Close on scroll so the dropdown doesn't drift away from its button
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
          {/* Invisible backdrop to catch outside clicks */}
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />

          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            style={{ position: "absolute", top: dropdownStyle.top, left: dropdownStyle.left }}
            className="z-[9999] w-36 bg-[#1f2937] border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
          >
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => select(s.value)}
                className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors ${s.color} ${s.bg}
                  ${s.value === currentStatus ? "opacity-40 cursor-default" : ""}`}
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
        className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50
          ${current.color} border-current/20 ${current.bg}`}
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

      {/* Portal: renders outside the table's overflow context */}
      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </>
  );
}
