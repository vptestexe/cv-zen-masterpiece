
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <div className="bg-red-50 text-red-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl font-bold">404</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Page introuvable</h1>
          <p className="text-gray-600 mb-6">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link to="/" className="inline-flex items-center justify-center">
            <Home className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
