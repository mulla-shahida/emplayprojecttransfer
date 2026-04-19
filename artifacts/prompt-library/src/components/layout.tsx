import { Link, useLocation } from "wouter";
import { Sparkles, Library, Plus } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 border-r border-border bg-card lg:min-h-screen p-6 flex flex-col gap-8 shrink-0">
        <div className="flex items-center gap-3 text-primary font-bold text-xl tracking-tight">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          Lumina
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <Link
            href="/prompts"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              location === "/prompts" || location.startsWith("/prompts/")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            data-testid="link-nav-library"
          >
            <Library className="w-5 h-5" />
            Library
          </Link>
          <Link
            href="/add"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
              location === "/add"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
            data-testid="link-nav-add"
          >
            <Plus className="w-5 h-5" />
            New Prompt
          </Link>
        </nav>

        <div className="mt-auto">
          <p className="text-xs text-muted-foreground font-mono">v1.0.0-beta</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col max-w-6xl mx-auto w-full p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
