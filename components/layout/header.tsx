"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, Settings } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, validating, username, logout } = useAuth();

  if (pathname === "/login") return null;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <div className="app-header__brand">
        <Link href="/">Birthy</Link>
      </div>

      <nav className="app-header__nav">
        <Link
          href="/people"
          className="app-header__link"
          aria-current={isActive("/people") ? "page" : undefined}
        >
          Contacts
        </Link>
        <Link
          href="/communications"
          className="app-header__link"
          aria-current={isActive("/communications") ? "page" : undefined}
        >
          Messages
        </Link>
        {isAdmin && (
          <Link
            href="/admin/connectors"
            className="app-header__link"
            aria-current={isActive("/admin") ? "page" : undefined}
          >
            <Settings className="inline h-4 w-4 mr-1" />
            Admin
          </Link>
        )}
      </nav>

      <div className="app-header__actions">
        <ThemeToggle />

        {validating && (
          <Badge variant="secondary" className="text-xs">
            Validating...
          </Badge>
        )}

        {isAdmin && !validating && (
          <div className="flex items-center gap-2">
            {username && (
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {username}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs h-7 gap-1"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
