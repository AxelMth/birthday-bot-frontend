"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const { isAdmin, validating, error, clearApiKey } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
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
      </nav>

      <div className="app-header__actions">
        <ThemeToggle />

        {/* Admin status indicator */}
        {validating && (
          <Badge variant="secondary" className="text-xs">
            Validating...
          </Badge>
        )}

        {error && (
          <Badge variant="destructive" className="text-xs">
            Auth Error
          </Badge>
        )}

        {isAdmin && !validating && (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              Admin Mode
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={clearApiKey}
              className="text-xs h-7"
            >
              Clear Key
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
