
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface EmailLoginFormProps {
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const EmailLoginForm = ({ isLogin, setIsLogin, isLoading, setIsLoading }: EmailLoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, signUp } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signUp(email, password, name);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
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
    </form>
  );
};

export default EmailLoginForm;
