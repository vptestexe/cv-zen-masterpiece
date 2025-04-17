
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Templates de CV disponibles
const cvTemplates = [
  {
    id: "classic",
    name: "Classique",
    description: "Un design professionnel et intemporel",
    color: "#0170c4",
    bgColor: "#ebf5ff",
  },
  {
    id: "modern",
    name: "Moderne",
    description: "Un design contemporain et épuré",
    color: "#7E69AB",
    bgColor: "#f3eeff",
  },
  {
    id: "creative",
    name: "Créatif",
    description: "Un design original pour se démarquer",
    color: "#F97316",
    bgColor: "#fff7ed",
  },
  {
    id: "professional",
    name: "Professionnel",
    description: "Un design sobre et élégant",
    color: "#403E43",
    bgColor: "#f5f5f5",
  },
  {
    id: "minimalist",
    name: "Minimaliste",
    description: "Un design simple et efficace",
    color: "#222222",
    bgColor: "#fafafa",
  },
  {
    id: "elegant",
    name: "Élégant",
    description: "Un design raffiné avec une touche de couleur",
    color: "#D946EF",
    bgColor: "#fdf4ff",
  }
];

const Landing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  
  const handleTemplateSelection = (templateId: string) => {
    // Rediriger vers la page de connexion puisque l'utilisateur doit être connecté
    navigate("/login");
    toast({
      title: "Connexion requise",
      description: "Veuillez vous connecter pour créer ou modifier un CV",
    });
  };
  
  const handleCreateFromScratch = () => {
    // Rediriger vers la page de connexion
    navigate("/login");
    toast({
      title: "Connexion requise",
      description: "Veuillez vous connecter pour créer ou modifier un CV",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background pt-20 pb-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Créez votre CV professionnel en quelques minutes
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Des templates élégants, une interface intuitive et des outils puissants pour réaliser un CV qui vous démarque.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleCreateFromScratch}
              className="text-lg px-8"
            >
              Créer un CV
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate("/login")}
              className="text-lg px-8"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </section>
      
      {/* Templates Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Choisissez votre template</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cvTemplates.map((template) => (
              <Card 
                key={template.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg"
                style={{
                  borderColor: hoveredTemplate === template.id ? template.color : 'transparent',
                  borderWidth: hoveredTemplate === template.id ? '2px' : '1px',
                }}
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
              >
                <CardContent className="p-0">
                  <div 
                    className="aspect-[3/4] flex flex-col items-center justify-center p-6"
                    style={{ backgroundColor: template.bgColor }}
                  >
                    <div 
                      className="w-full h-full border rounded-md flex items-center justify-center"
                      style={{ borderColor: template.color, color: template.color }}
                    >
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <Button 
                      className="w-full"
                      style={{ 
                        backgroundColor: template.color, 
                        borderColor: template.color
                      }}
                      onClick={() => handleTemplateSelection(template.id)}
                    >
                      Utiliser ce template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir CV Zen Masterpiece</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg">
              <div className="bg-primary/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple et intuitif</h3>
              <p className="text-muted-foreground">Interface moderne et facile à utiliser, même pour les débutants.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg">
              <div className="bg-primary/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personnalisable</h3>
              <p className="text-muted-foreground">Des options de personnalisation pour adapter le CV à votre style.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg">
              <div className="bg-primary/10 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Téléchargement facile</h3>
              <p className="text-muted-foreground">Exportez votre CV au format PDF en un seul clic.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à créer votre CV ?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs satisfaits et créez un CV qui vous ressemble.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/login")}
            className="text-lg px-8"
          >
            Commencer maintenant
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-muted py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} CV Zen Masterpiece - Tous droits réservés
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm">À propos</Button>
              <Button variant="ghost" size="sm">Confidentialité</Button>
              <Button variant="ghost" size="sm">Contact</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
