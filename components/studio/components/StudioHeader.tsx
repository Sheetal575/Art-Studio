"use client";

import { LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudioHeaderProps {
  onAddClick: () => void;
  onLogout: () => void;
}

export default function StudioHeader({ onAddClick, onLogout }: StudioHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl leading-none">Sheetal&apos;s Studio</span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onAddClick}>
            <Plus className="h-4 w-4" />
            Add artwork
          </Button>
          <Button variant="outline" size="icon" onClick={onLogout} aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
