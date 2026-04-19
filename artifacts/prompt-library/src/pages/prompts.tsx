import { useListPrompts, useGetPromptsStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Search, Plus, Sparkles, Activity, Layers, Hash } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Layout } from "@/components/layout";

export function PromptsPage() {
  const { data: prompts, isLoading: promptsLoading } = useListPrompts();
  const { data: stats, isLoading: statsLoading } = useGetPromptsStats();
  const [search, setSearch] = useState("");

  const filteredPrompts = prompts?.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const getComplexityColor = (level: number) => {
    if (level <= 3) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    if (level <= 6) return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 animate-in fade-in duration-500">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Prompt Library
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage and refine your creative instructions.
          </p>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="section-stats">
          <Card className="bg-card border-card-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Hash className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Prompts</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold font-mono text-foreground" data-testid="text-stats-total">
                    {stats?.total || 0}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-card-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg Complexity</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-3xl font-bold font-mono text-foreground" data-testid="text-stats-avg-complexity">
                    {stats?.avgComplexity?.toFixed(1) || "0.0"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-card-border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Breakdown</p>
                {statsLoading ? (
                  <Skeleton className="h-8 w-full mt-1" />
                ) : (
                  <div className="flex gap-3 mt-1 text-sm font-mono" data-testid="text-stats-breakdown">
                    {stats?.complexityBreakdown.map((b) => (
                      <span key={b.level} className="flex items-center gap-1">
                        <span className="text-muted-foreground">{b.level[0].toUpperCase()}:</span>
                        <span className="font-bold">{b.count}</span>
                      </span>
                    ))}
                    {!stats?.complexityBreakdown.length && <span className="text-muted-foreground">None</span>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Actions */}
        <section className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search prompts..."
              className="pl-10 h-12 bg-card border-border text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <Link
            href="/add"
            className="flex items-center justify-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors w-full sm:w-auto shadow-sm"
            data-testid="link-create-prompt"
          >
            <Plus className="w-5 h-5" />
            Create Prompt
          </Link>
        </section>

        {/* List */}
        <section className="flex flex-col gap-4">
          {promptsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-4 w-1/4" />
              </Card>
            ))
          ) : filteredPrompts?.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border" data-testid="empty-state">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">No prompts found</h3>
              <p className="text-muted-foreground mb-6">
                {search ? "Try adjusting your search query." : "Your library is waiting for its first spark."}
              </p>
              {!search && (
                <Link
                  href="/add"
                  className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add your first prompt
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4" data-testid="list-prompts">
              {filteredPrompts?.map((prompt) => (
                <Link
                  key={prompt.id}
                  href={`/prompts/${prompt.id}`}
                  className="group block"
                  data-testid={`link-prompt-${prompt.id}`}
                >
                  <Card className="bg-card border-card-border hover:border-primary/50 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {prompt.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          {format(new Date(prompt.createdAt), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge
                          variant="outline"
                          className={`px-3 py-1 text-xs font-mono font-bold border ${getComplexityColor(prompt.complexity)}`}
                        >
                          Level {prompt.complexity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
