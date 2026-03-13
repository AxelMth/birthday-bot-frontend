"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";

const PUBLIC_PATHS = ["/login"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, validating } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (validating) return;
    if (!isAdmin && !isPublicPath) {
      router.replace("/login");
    }
    if (isAdmin && isPublicPath) {
      router.replace("/");
    }
  }, [isAdmin, validating, isPublicPath, router]);

  if (validating) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p style={{ color: "var(--muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!isAdmin && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
