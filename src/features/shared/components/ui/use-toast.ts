// Implementação mínima para não quebrar a app.
// Se você já usa o shadcn Toaster, substitua por sua versão real.

type ToastVariant = "default" | "destructive";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: ToastVariant;
};

export function useToast() {
  const toast = (opts: ToastOptions) => {
    const prefix = opts.variant === "destructive" ? "❌ " : "✅ ";
    const title = opts.title ? `${prefix}${opts.title}` : prefix + "Mensagem";
    const description = opts.description ? `\n${opts.description}` : "";
    // fallback simples
    if (opts.variant === "destructive") {
      console.error(title + description);
      if (typeof window !== "undefined") alert(title + description);
    } else {
      console.log(title + description);
    }
  };

  return { toast };
}
