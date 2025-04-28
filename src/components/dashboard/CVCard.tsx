
import { Button } from "@/components/ui/button";
import { Edit, Download, Trash2, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DownloadCount } from "@/utils/downloads/types";

interface CV {
  id: string;
  title: string;
  template?: string;
  lastUpdated: string;
}

interface CVCardProps {
  cv: CV;
  downloadCount?: DownloadCount;
  processingPayment?: boolean;
  onEdit: (id: string) => void;
  onDownload: (id: string, format: string) => void;
  onRecharge?: (id: string) => void;
  onDelete: (id: string) => void;
  isMobile?: boolean;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const CVCard = ({
  cv,
  onEdit,
  onDownload,
  onDelete,
}: CVCardProps) => {
  return (
    <div className="hover:shadow-md transition-shadow rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">{cv.title}</h3>
        <p className="text-sm text-muted-foreground">
          Dernière modification: {formatDate(cv.lastUpdated)}
        </p>
      </div>
      <div className="p-6 pt-0">
        <div className="aspect-[3/4] bg-muted/20 rounded flex items-center justify-center">
          <FileText className="h-16 w-16 text-muted-foreground" />
        </div>
      </div>
      <div className="flex items-center p-6 pt-0 justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1 flex-1"
          onClick={() => onEdit(cv.id)}
        >
          <Edit className="h-4 w-4" />
          Modifier
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 flex-1"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onDownload(cv.id, "pdf")}>
              <Download className="h-4 w-4 mr-2" />
              Format PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload(cv.id, "word")}>
              <FileText className="h-4 w-4 mr-2" />
              Format Word
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive gap-1 flex-1"
          onClick={() => onDelete(cv.id)}
        >
          <Trash2 className="h-4 w-4" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default CVCard;
