import Link from "next/link";

export function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Birthy</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-foreground hover:underline">
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
        </div>
      </div>
    </header>
  );
}
