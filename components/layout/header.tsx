export function Header() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">
          Birthday Bot Admin
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage birthday notifications and settings
        </p>
      </div>
    </header>
  );
}
