
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LogIn, User, ArrowLeft, Home, Eye, EyeOff, Phone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signUp, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  
  // Si l'utilisateur est déjà authentifié, rediriger vers le dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (activeTab === "email") {
        if (isLogin) {
          await login(email, password);
        } else {
          await signUp(email, password, name);
        }
      }
      // La redirection est gérée par l'effet useEffect ci-dessus
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!codeSent) {
        // Send verification code
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
        });
        
        if (error) {
          throw error;
        }
        
        setCodeSent(true);
        toast({
          title: "Code envoyé",
          description: "Un code de vérification a été envoyé à votre numéro de téléphone.",
        });
      } else {
        // Verify the code
        const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
        const { error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: verificationCode,
          type: 'sms',
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté.",
        });
      }
    } catch (error: any) {
      console.error("Phone authentication error:", error);
      toast({
        title: "Erreur d'authentification",
        description: error.message || "Une erreur est survenue lors de l'authentification par téléphone.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const goToHome = () => {
    navigate("/");
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container flex items-center justify-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <Button 
                variant="ghost" 
                className="w-fit p-0" 
                onClick={goToHome}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
              <Button 
                variant="outline" 
                className="w-fit" 
                onClick={goToHome}
              >
                <Home className="h-4 w-4 mr-2" />
                Page d'accueil
              </Button>
            </div>
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
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "email" | "phone")} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Téléphone</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
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
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-2.5 text-gray-500"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
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
              </TabsContent>
              
              <TabsContent value="phone">
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <div className="flex">
                      <div className="flex items-center mr-2">
                        <Phone className="h-5 w-5 text-gray-500" />
                      </div>
                      <Input 
                        id="phone" 
                        placeholder="+33612345678" 
                        required 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={codeSent}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Format international, ex: +33612345678</p>
                  </div>
                  
                  {codeSent && (
                    <div className="space-y-2">
                      <Label htmlFor="code">Code de vérification</Label>
                      <Input 
                        id="code" 
                        placeholder="123456" 
                        required 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        {codeSent ? "Vérification..." : "Envoi du code..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {codeSent ? "Vérifier le code" : "Recevoir un code"}
                      </span>
                    )}
                  </Button>
                  
                  {codeSent && (
                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full mt-2" 
                      onClick={() => setCodeSent(false)}
                    >
                      Changer de numéro
                    </Button>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col">
            {activeTab === "email" && (
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
            )}
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
