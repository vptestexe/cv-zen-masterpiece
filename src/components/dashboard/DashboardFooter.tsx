
import { Button } from "@/components/ui/button";

const DashboardFooter = () => (
  <footer className="bg-muted py-6 mt-auto">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} CV Zen Masterpiece - Tous droits réservés
        </p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Button variant="ghost" size="sm">Aide</Button>
          <Button variant="ghost" size="sm">Contact</Button>
        </div>
      </div>
    </div>
  </footer>
);

export default DashboardFooter;
