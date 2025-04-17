import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Si l'utilisateur est déjà authentifié, rediriger vers le dashboard
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleGetStarted = () => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour créer ou modifier un CV",
      });
      navigate('/login');
    } else {
      navigate('/dashboard');
    }
  };

  const handleTemplateClick = (templateId) => {
    if (!isAuthenticated) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour utiliser ce modèle",
      });
      navigate('/login');
    } else {
      navigate(`/editor/${templateId}`);
      toast({
        title: "Modèle sélectionné",
        description: `Vous pouvez maintenant personnaliser le modèle ${templateId}`,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            <span className="font-playfair">CV Zen Masterpiece</span>
          </h1>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Se connecter
                </Button>
                <Button onClick={() => navigate('/login')}>
                  Créer un compte
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/dashboard')}>
                Mon espace
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-1 bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Créez un CV professionnel en quelques minutes
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Choisissez parmi nos modèles élégants et personnalisez votre CV pour impressionner les recruteurs.
              </p>
              <Button size="lg" onClick={handleGetStarted} className="text-lg">
                Commencer maintenant
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div 
                className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => handleTemplateClick('classic')}
              >
                <div className="h-64 bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <h3 className="text-white font-bold text-xl mb-2">Classique</h3>
                  <div className="bg-white/20 h-4 w-24 rounded mb-4"></div>
                  <div className="bg-white/20 h-3 w-32 rounded mb-2"></div>
                  <div className="bg-white/20 h-3 w-28 rounded mb-4"></div>
                </div>
              </div>
              <div 
                className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => handleTemplateClick('modern')}
              >
                <div className="h-64 bg-gradient-to-r from-teal-500 to-emerald-600 p-6">
                  <h3 className="text-white font-bold text-xl mb-2">Moderne</h3>
                  <div className="bg-white/20 h-4 w-24 rounded mb-4"></div>
                  <div className="bg-white/20 h-3 w-32 rounded mb-2"></div>
                  <div className="bg-white/20 h-3 w-28 rounded mb-4"></div>
                </div>
              </div>
              <div 
                className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => handleTemplateClick('creative')}
              >
                <div className="h-64 bg-gradient-to-r from-purple-500 to-pink-600 p-6">
                  <h3 className="text-white font-bold text-xl mb-2">Créatif</h3>
                  <div className="bg-white/20 h-4 w-24 rounded mb-4"></div>
                  <div className="bg-white/20 h-3 w-32 rounded mb-2"></div>
                  <div className="bg-white/20 h-3 w-28 rounded mb-4"></div>
                </div>
              </div>
              <div 
                className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => handleTemplateClick('professional')}
              >
                <div className="h-64 bg-gradient-to-r from-gray-700 to-gray-900 p-6">
                  <h3 className="text-white font-bold text-xl mb-2">Professionnel</h3>
                  <div className="bg-white/20 h-4 w-24 rounded mb-4"></div>
                  <div className="bg-white/20 h-3 w-32 rounded mb-2"></div>
                  <div className="bg-white/20 h-3 w-28 rounded mb-4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Fonctionnalités principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Modèles élégants</h3>
              <p className="text-gray-600">
                Choisissez parmi une variété de modèles conçus par des professionnels du recrutement.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Personnalisation facile</h3>
              <p className="text-gray-600">
                Modifiez les couleurs, les polices et la mise en page pour créer un CV qui vous ressemble.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Exportation PDF</h3>
              <p className="text-gray-600">
                Téléchargez votre CV au format PDF prêt à être envoyé aux recruteurs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">
              © {new Date().getFullYear()} CV Zen Masterpiece - Tous droits réservés
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">Aide</Button>
              <Button variant="ghost" size="sm">Contact</Button>
              <Button variant="ghost" size="sm">Confidentialité</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
