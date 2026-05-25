"use client";

import { Button } from "@/components/ui/Button";
import { Menu, User } from "lucide-react";


export default function Topbar({ onMenuClick }: { onMenuClick: () => void }) {

  return (
    <header className="h-16 border-b sticky top-0 z-50 border-black/10 bg-white flex items-center justify-between px-4 md:px-6">
      <button className="md:hidden p-2 -ml-2" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={18} />
      </button>
     <Button
              variant="ghost"
              size="sm"
              className="hover:bg-black/5 hover:cursor-pointer"
              href='/dashboard/account'>
              <User className="inline-block mr-2" size={16} />
              My Account
            </Button>
    </header>
  );
}
