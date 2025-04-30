
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  onAddNew: () => void;
}

export function EmptyState({ onAddNew }: EmptyStateProps) {
  return (
    <div className="text-center p-8 border rounded-lg">
      <p className="text-muted-foreground">Aucun emplacement publicitaire n'a été créé.</p>
      <p className="mt-2">Cliquez sur "Ajouter" pour créer votre premier emplacement.</p>
      <Button onClick={onAddNew} className="mt-4">
        <Plus className="h-4 w-4 mr-2" />
        Ajouter
      </Button>
    </div>
  );
}
