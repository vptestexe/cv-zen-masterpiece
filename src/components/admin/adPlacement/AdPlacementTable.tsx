
import React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { AdPlacement } from "@/types/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdPlacementTableProps {
  placements: AdPlacement[];
  onEdit: (placement: AdPlacement) => void;
  onDelete: (id: string) => void;
}

export function AdPlacementTable({ placements, onEdit, onDelete }: AdPlacementTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Position</TableHead>
            <TableHead>Taille</TableHead>
            <TableHead>Réseau</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date de début</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {placements.map((placement) => (
            <TableRow key={placement.id}>
              <TableCell className="font-medium">{placement.position}</TableCell>
              <TableCell>{placement.size}</TableCell>
              <TableCell>{placement.network}</TableCell>
              <TableCell>
                {placement.isActive ? 
                  <span className="text-green-600 font-medium">Actif</span> : 
                  <span className="text-red-600 font-medium">Inactif</span>
                }
              </TableCell>
              <TableCell>
                {format(new Date(placement.startDate), 'dd/MM/yyyy', { locale: fr })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(placement)}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(placement.id)}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
