import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, Link } from "wouter";
import { useCreatePrompt, getListPromptsQueryKey, getGetPromptsStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Save } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  content: z.string().min(20, "Prompt content must be at least 20 characters").max(5000),
  complexity: z.number().min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

export function AddPromptPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createPrompt = useCreatePrompt();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      complexity: 5,
    },
  });

  const onSubmit = (values: FormValues) => {
    createPrompt.mutate(
      { data: values },
      {
        onSuccess: (newPrompt) => {
          queryClient.invalidateQueries({ queryKey: getListPromptsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetPromptsStatsQueryKey() });
          
          toast({
            title: "Prompt saved",
            description: "Your new prompt has been added to the library.",
          });
          
          setLocation("/prompts");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Failed to save prompt",
            description: error?.error || "An unexpected error occurred.",
          });
        },
      }
    );
  };

  return (
    <Layout>
      <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-3xl mx-auto w-full">
        <div>
          <Link
            href="/prompts"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
            data-testid="link-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">New Prompt</h1>
            <p className="text-muted-foreground mt-2">
              Add a new creative instruction to your library.
            </p>
          </header>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" data-testid="form-add-prompt">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Title</FormLabel>
                    <FormDescription>A memorable name for your prompt.</FormDescription>
                    <FormControl>
                      <Input
                        placeholder="e.g. Cinematic Sci-Fi Portrait"
                        className="text-lg py-6"
                        data-testid="input-title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage data-testid="error-title" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Prompt Content</FormLabel>
                    <FormDescription>The exact instructions for the AI.</FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="A hyper-realistic cinematic portrait of..."
                        className="min-h-[200px] font-mono text-sm resize-y"
                        data-testid="input-content"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage data-testid="error-content" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="complexity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Complexity Level: {field.value}</FormLabel>
                    <FormDescription>Rate how advanced this prompt is (1-10).</FormDescription>
                    <FormControl>
                      <div className="pt-4 pb-2">
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-4"
                          data-testid="input-complexity"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground font-mono mt-2">
                          <span>1 (Basic)</span>
                          <span>10 (Master)</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={createPrompt.isPending}
                  className="h-12 px-8 text-base gap-2 font-semibold"
                  data-testid="button-submit"
                >
                  {createPrompt.isPending ? (
                    <span className="animate-pulse">Saving...</span>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Prompt
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
