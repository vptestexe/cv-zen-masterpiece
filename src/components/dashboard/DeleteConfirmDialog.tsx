
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onDelete: () => void;
}

const DeleteConfirmDialog = ({
  open,
  onCancel,
  onDelete,
}: DeleteConfirmDialogProps) => (
  <AlertDialog open={open} onOpenChange={onCancel}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
        <AlertDialogDescription>
          Cette action est irréversible. Le CV sera définitivement supprimé.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
        <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
          Supprimer
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeleteConfirmDialog;
