"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import UserGuard from "./UserGuard";
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAccount = pathname?.startsWith("/dashboard/account");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <UserGuard>
      <div className="min-h-screen flex">
        {!isAccount ? (
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        ) : null}
        <div className={`flex-1 flex flex-col ${isAccount ? "" : "md:ml-64"}`}>
          {!isAccount ? <Topbar onMenuClick={() => setSidebarOpen(true)} /> : null}
          <div className="p-4 md:p-6 bg-off-white h-full">{children}</div>
        </div>
      </div>
    </UserGuard>
  );
}
