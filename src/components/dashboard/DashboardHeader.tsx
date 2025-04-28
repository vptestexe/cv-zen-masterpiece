
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/hooks/use-admin";

interface DashboardHeaderProps {
  userName?: string;
  onLogout?: () => void;
}

const DashboardHeader = ({ userName = "", onLogout }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();

  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              Bonjour, {userName}
            </h1>
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => navigate("/admin/ads")}
              >
                Administration
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
          >
            Déconnexion
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
