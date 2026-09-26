import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import "./studio.css";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <div className="studio-root">
      {children}
      <Toaster richColors position="top-center" />
    </div>
  );
}
