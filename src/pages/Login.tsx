
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { LogIn, User, ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validation de base
    if (!email || !password || (!isLogin && !name)) {
      toast({
        title: "Erreur de saisie",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Simuler une authentification
    setTimeout(() => {
      setIsLoading(false);
      
      // Ajouter un token dans le localStorage (dans une vraie application, ce serait un JWT)
      localStorage.setItem('auth_token', 'simulated_jwt_token');
      localStorage.setItem('user_email', email);
      localStorage.setItem('user_name', isLogin ? email.split('@')[0] : name);
      
      // Simulation de succès
      toast({
        title: isLogin ? "Connexion réussie" : "Compte créé avec succès",
        description: isLogin 
          ? "Bienvenue sur votre tableau de bord" 
          : "Vous pouvez maintenant vous connecter à votre compte",
      });
      
      // Si c'est une connexion, rediriger vers le dashboard
      navigate("/dashboard");
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container flex items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <Button 
              variant="ghost" 
              className="w-fit p-0 mb-4" 
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Button>
            <CardTitle className="text-2xl">
              {isLogin ? "Connexion" : "Créer un compte"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "Connectez-vous pour accéder à votre espace personnalisé"
                : "Inscrivez-vous pour créer et gérer vos CV"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="votre@email.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    {isLogin ? "Connexion..." : "Création..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? <LogIn className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    {isLogin ? "Se connecter" : "S'inscrire"}
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center w-full">
              <Button 
                variant="link" 
                onClick={() => setIsLogin(!isLogin)}
                className="mt-2"
              >
                {isLogin 
                  ? "Vous n'avez pas de compte ? S'inscrire" 
                  : "Déjà inscrit ? Se connecter"
                }
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <footer className="bg-muted py-4">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CV Zen Masterpiece - Tous droits réservés
        </div>
      </footer>
    </div>
  );
};

export default Login;
