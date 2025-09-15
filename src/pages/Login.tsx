import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { createDefaultCompany } from "@/lib/companyUtils";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signInWithMagicLink, signUp, createProfile } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isSignUp) {
        // Criar novo usuário
        const { data: authData, error: signUpError } = await signUp(email, password);
        
        if (signUpError) throw signUpError;
        
        if (authData.user) {
          // Criar empresa padrão para o novo usuário
          const company = await createDefaultCompany(companyName || `${email}'s Company`);
          
          // Criar perfil para o usuário
          await createProfile(authData.user.id, company.id, 'admin');
          
          toast({
            title: "Conta criada!",
            description: "Sua conta foi criada com sucesso. Faça login para continuar.",
          });
          
          // Mudar para modo de login após criar a conta
          setIsSignUp(false);
        }
      } else if (isMagicLink) {
        // Enviar link mágico
        await signInWithMagicLink(email);
        toast({
          title: "Link mágico enviado!",
          description: "Verifique seu e-mail para o link de acesso.",
        });
      } else {
        // Login normal
        await signIn(email, password);
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Erro ao criar conta" : "Erro no login",
        description: error.message || (isSignUp ? "Falha ao criar conta. Tente novamente." : "Falha ao fazer login. Tente novamente."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? "Criar Conta" : "Login"}</CardTitle>
          <CardDescription>
            {isSignUp 
              ? "Crie uma conta com seu e-mail e senha." 
              : "Entre com seu e-mail e senha para acessar o painel."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input 
                  id="companyName" 
                  type="text" 
                  placeholder="Minha Empresa de Limpeza" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            )}
            
            {!isMagicLink && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
            
            {!isSignUp && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="magic-link"
                  checked={isMagicLink}
                  onChange={(e) => setIsMagicLink(e.target.checked)}
                />
                <Label htmlFor="magic-link">Usar link mágico</Label>
              </div>
            )}
            
            <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
              {loading ? "Processando..." : (isSignUp ? "Criar Conta" : "Entrar")}
            </Button>
            
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:underline"
              >
                {isSignUp 
                  ? "Já tem uma conta? Faça login" 
                  : "Não tem uma conta? Crie uma"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;