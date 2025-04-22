
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  onLogout: () => void;
}

const DashboardHeader = ({ userName, onLogout }: DashboardHeaderProps) => (
  <header className="bg-white border-b sticky top-0 z-20">
    <div className="container mx-auto py-4 px-4 sm:px-6 flex justify-between items-center">
      <h1 className="text-xl sm:text-2xl font-bold text-primary truncate">
        <span className="font-playfair">CV Zen Masterpiece</span>
      </h1>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-sm text-muted-foreground mr-2">
          Bonjour, {userName}
        </span>
        <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </Button>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
