
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LoginHeaderProps {
  isLogin: boolean;
}

const LoginHeader = ({ isLogin }: LoginHeaderProps) => {
  const navigate = useNavigate();
  
  const goToHome = () => {
    navigate("/");
  };
  
  return (
    <>
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
    </>
  );
};

export default LoginHeader;
