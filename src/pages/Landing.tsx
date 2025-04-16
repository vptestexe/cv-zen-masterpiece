
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { FileText, LogIn } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

const CVTemplates = [
  {
    id: "classic",
    name: "Classique",
    image: "/placeholder.svg",
    description: "Un design simple et élégant, parfait pour tous les secteurs professionnels.",
    color: "#0170c4",
    style: "underline"
  },
  {
    id: "modern",
    name: "Moderne",
    image: "/placeholder.svg",
    description: "Un design contemporain qui met en valeur vos compétences de manière visuelle.",
    color: "#7E69AB",
    style: "background"
  },
  {
    id: "creative",
    name: "Créatif",
    image: "/placeholder.svg",
    description: "Un design unique pour les professions créatives et artistiques.",
    color: "#F97316",
    style: "border"
  },
  {
    id: "professional",
    name: "Professionnel",
    image: "/placeholder.svg",
    description: "Un design structuré et formel pour les carrières traditionnelles.",
    color: "#403E43",
    style: "underline"
  },
  {
    id: "minimalist",
    name: "Minimaliste",
    image: "/placeholder.svg",
    description: "Un design épuré qui va à l'essentiel pour un impact maximum.",
    color: "#222222",
    style: "plain"
  },
  {
    id: "elegant",
    name: "Élégant",
    image: "/placeholder.svg",
    description: "Un design raffiné avec une typographie sophistiquée.",
    color: "#D946EF",
    style: "background"
  }
];

const Landing = () => {
  const navigate = useNavigate();

  const handleTemplateSelect = (templateId: string) => {
    // Get the template details
    const template = CVTemplates.find(t => t.id === templateId);
    
    // Navigate to editor with template parameters
    if (template) {
      navigate(`/editor/${templateId}?color=${encodeURIComponent(template.color)}&style=${template.style}`);
    } else {
      navigate(`/editor/${templateId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/20 to-background py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="font-playfair">CV Zen Masterpiece</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Créez un CV professionnel qui vous démarque. Simple, élégant et efficace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/login")}
              className="gap-2"
            >
              <LogIn className="h-5 w-5" />
              Se connecter
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}
              className="gap-2"
            >
              <FileText className="h-5 w-5" />
              Voir les modèles
            </Button>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Nos modèles de CV</h2>
          
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8">
            {CVTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] bg-muted/40 relative group">
                  <img 
                    src={template.image} 
                    alt={template.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                    <div className="text-white text-center">
                      <div className="inline-block w-6 h-6 rounded-full mb-2" style={{ backgroundColor: template.color }}></div>
                      <p className="font-medium">{template.style === 'underline' ? 'Style souligné' : 
                         template.style === 'background' ? 'Style avec fond' :
                         template.style === 'border' ? 'Style avec bordure' : 'Style simple'}</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                  <p className="text-muted-foreground mb-4">{template.description}</p>
                  <Button 
                    className="w-full" 
                    onClick={() => handleTemplateSelect(template.id)}
                    style={{ backgroundColor: template.color }}
                  >
                    Sélectionner
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Mobile Carousel */}
          <div className="md:hidden">
            <Carousel className="w-full">
              <CarouselContent>
                {CVTemplates.map((template) => (
                  <CarouselItem key={template.id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                    <Card className="overflow-hidden">
                      <div className="aspect-[3/4] bg-muted/40 relative">
                        <img 
                          src={template.image} 
                          alt={template.name} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-transparent to-black/60 p-3">
                          <div className="text-white text-center">
                            <div className="inline-block w-4 h-4 rounded-full mb-1" style={{ backgroundColor: template.color }}></div>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                        <p className="text-muted-foreground mb-4 text-sm">{template.description}</p>
                        <Button 
                          className="w-full" 
                          onClick={() => handleTemplateSelect(template.id)}
                          style={{ backgroundColor: template.color }}
                        >
                          Sélectionner
                        </Button>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi choisir CV Zen Masterpiece</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Modèles professionnels</h3>
              <p className="text-muted-foreground">Des modèles élégants conçus par des experts en recrutement.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple et rapide</h3>
              <p className="text-muted-foreground">Créez votre CV en quelques minutes, sans compétences techniques.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Entièrement personnalisable</h3>
              <p className="text-muted-foreground">Adaptez les couleurs, polices et mise en page selon vos préférences.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-muted py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} CV Zen Masterpiece - Tous droits réservés
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Button variant="ghost" size="sm">Conditions d'utilisation</Button>
              <Button variant="ghost" size="sm">Politique de confidentialité</Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
