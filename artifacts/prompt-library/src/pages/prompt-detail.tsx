import { useGetPrompt, getGetPromptQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, Eye, Clock, Hash, Copy, Check } from "lucide-react";
import { Layout } from "@/components/layout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useCallback } from "react";

export function PromptDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: prompt, isLoading, error } = useGetPrompt(id, {
    query: {
      enabled: !!id,
      queryKey: getGetPromptQueryKey(id),
    },
  });

  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(() => {
    if (!prompt?.content) return;
    navigator.clipboard.writeText(prompt.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [prompt?.content]);

  const getComplexityColor = (level: number) => {
    if (level <= 3) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    if (level <= 6) return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
  };

  if (error) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Failed to load prompt</h2>
          <Link href="/prompts" className="text-primary hover:underline">
            Return to library
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto w-full">
        <div>
          <Link
            href="/prompts"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
            data-testid="link-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
        </div>

        {isLoading || !prompt ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            <header className="flex flex-col gap-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground" data-testid="text-prompt-title">
                {prompt.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-mono text-muted-foreground">
                <Badge
                  variant="outline"
                  className={`px-3 py-1 text-sm font-mono font-bold border ${getComplexityColor(prompt.complexity)}`}
                  data-testid="badge-complexity"
                >
                  <Hash className="w-3 h-3 mr-1 inline" />
                  Level {prompt.complexity}
                </Badge>
                
                <div className="flex items-center gap-1.5" data-testid="text-prompt-date">
                  <Clock className="w-4 h-4" />
                  {format(new Date(prompt.createdAt), "MMM d, yyyy")}
                </div>

                <div className="flex items-center gap-1.5" data-testid="text-prompt-views">
                  <Eye className="w-4 h-4" />
                  {prompt.viewCount} views
                </div>
              </div>
            </header>

            <div className="relative mt-4">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center w-10 h-10 bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground rounded-md transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  title="Copy to clipboard"
                  data-testid="button-copy"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
                <pre className="whitespace-pre-wrap font-mono text-sm sm:text-base text-card-foreground leading-relaxed">
                  {prompt.content}
                </pre>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
