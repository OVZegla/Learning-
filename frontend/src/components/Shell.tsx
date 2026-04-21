"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const bare = pathname === "/login" || pathname === "/register" || pathname === "/";

  return (
    <>
      {!bare && <Navbar />}
      <main>{bare ? children : <div className="page">{children}</div>}</main>
    </>
  );
}
