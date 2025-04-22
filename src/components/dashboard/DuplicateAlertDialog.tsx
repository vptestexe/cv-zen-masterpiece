
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MAX_FREE_CVS, FREE_DOWNLOADS_PER_CV } from "@/utils/downloadManager";

interface DuplicateAlertDialogProps {
  open: boolean;
  duplicatesFound: number;
  onClose: () => void;
}

const DuplicateAlertDialog = ({
  open,
  duplicatesFound,
  onClose,
}: DuplicateAlertDialogProps) => (
  <AlertDialog open={open} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>CVs en double détectés</AlertDialogTitle>
        <AlertDialogDescription>
          {duplicatesFound} CV(s) en double ont été automatiquement supprimés pour éviter la duplication.
          Vous pouvez créer jusqu'à {MAX_FREE_CVS} CV différents avec {FREE_DOWNLOADS_PER_CV} téléchargements gratuits chacun.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction onClick={onClose}>Compris</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DuplicateAlertDialog;
