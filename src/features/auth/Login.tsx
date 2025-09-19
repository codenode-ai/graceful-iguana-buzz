import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useToast } from "@/shared/components/ui/use-toast";
import { useAuth } from "@/shared/hooks/useAuth";
import { supabase } from "@/shared/lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signInWithMagicLink, signUp, refreshProfile } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);

        toast({
          title: "Conta criada",
          description: "Verifique o seu email para confirmar o acesso e conclua a configuracao da empresa.",
        });

        setIsSignUp(false);
        return;
      }

      if (isMagicLink) {
        await signInWithMagicLink(email);
        toast({
          title: "Link magico enviado",
          description: "Confira sua caixa de entrada para acessar a plataforma.",
        });
        return;
      }

      await signIn(email, password);
      await refreshProfile();
      navigate("/", { replace: true });
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: isSignUp ? "Erro ao criar conta" : "Erro ao entrar",
        description:
          error?.message || (isSignUp ? "Nao foi possivel criar a conta." : "Nao foi possivel entrar com essas credenciais."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? "Criar conta" : "Login"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Use um email valido e defina uma senha." : "Entre com suas credenciais para acessar o painel."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleAuth}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@empresa.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            {!isMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center space-x-2 text-sm">
                <input
                  id="magic-link"
                  type="checkbox"
                  checked={isMagicLink}
                  onChange={(event) => setIsMagicLink(event.target.checked)}
                />
                <Label htmlFor="magic-link">Receber link magico por email</Label>
              </div>
            )}

            <Button className="w-full py-6 text-lg" disabled={loading} type="submit">
              {loading ? "Processando..." : isSignUp ? "Criar conta" : isMagicLink ? "Enviar link" : "Entrar"}
            </Button>

            <div className="text-center text-sm">
              <button
                className="text-blue-600 hover:underline"
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setIsMagicLink(false);
                }}
              >
                {isSignUp ? "Ja tem uma conta? Entrar" : "Ainda nao tem conta? Criar"}
              </button>
            </div>
          </form>

          <div className="mt-2 flex items-center justify-between text-xs text-blue-600">
            <Link to="/forgot-password" className="hover:underline">Esqueci minha senha</Link>
            <button type="button" onClick={async () => {
              if (!supabase) return;
              if (!email) return;
              try {
                // reenviar confirmacao de email
                // @ts-ignore
                const { error } = await supabase.auth.resend({ type: "signup", email });
                if (error) throw error;
                toast({ title: "Email de confirmacao reenviado", description: "Verifique sua caixa de entrada." });
              } catch (e: any) { toast({ title: "Nao foi possivel reenviar", description: e?.message || "Tente novamente.", variant: "destructive" });
              }
            }} className="hover:underline">Reenviar confirmacao</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;


