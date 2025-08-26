"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { isAdmin, validating, error, clearApiKey } = useAuth();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Birthy</h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-foreground hover:underline"
              >
                Accueil
              </Link>
              <Link
                href="/people"
                className="text-sm text-foreground hover:underline"
              >
                People
              </Link>
              <Link
                href="/communications"
                className="text-sm text-foreground hover:underline"
              >
                Communications
              </Link>
            </nav>

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
        </div>
      </div>
    </header>
  );
}
