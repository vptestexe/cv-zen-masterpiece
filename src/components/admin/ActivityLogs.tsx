
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { AdminActivity } from "@/types/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Mock data for development
const MOCK_ACTIVITY_LOGS: AdminActivity[] = [
  {
    id: "1",
    adminId: "admin-1",
    action: "create",
    entityType: "ad_placement",
    entityId: "placement-1",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    adminId: "admin-1",
    action: "update",
    entityType: "ad_placement",
    entityId: "placement-2",
    details: { old: { isActive: false }, new: { isActive: true } },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    adminId: "admin-2",
    action: "delete",
    entityType: "ad_placement",
    entityId: "placement-3",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export default function ActivityLogs() {
  const [logs, setLogs] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, [page]);

  async function loadLogs() {
    setLoading(true);
    try {
      // Using mock data instead of direct Supabase query
      // When the Supabase types are updated, replace with actual query
      setTimeout(() => {
        setLogs(MOCK_ACTIVITY_LOGS);
        setTotalPages(1); // Just one page of mock data
        setLoading(false);
      }, 500); // Simulate loading
    } catch (error) {
      console.error("Error loading activity logs:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le journal d'activité",
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  function formatDate(isoString: string): string {
    try {
      return format(new Date(isoString), "dd MMMM yyyy 'à' HH:mm", { locale: fr });
    } catch (e) {
      return isoString;
    }
  }

  function formatAction(action: string, entityType: string): string {
    switch (action) {
      case "create":
        return `Création d'un ${entityType}`;
      case "update":
        return `Modification d'un ${entityType}`;
      case "delete":
        return `Suppression d'un ${entityType}`;
      default:
        return `${action} ${entityType}`;
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Journal d'activité administrateur</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {logs.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Administrateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Détails</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(log.createdAt)}</TableCell>
                      <TableCell>{log.adminId}</TableCell>
                      <TableCell>{formatAction(log.action, log.entityType)}</TableCell>
                      <TableCell>
                        {log.details && (
                          <pre className="text-xs overflow-auto max-w-xs">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground">Aucune activité enregistrée</p>
            </div>
          )}

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  // Logique pour afficher les pages autour de la page actuelle
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (page > 3 && page < totalPages - 2) {
                      pageNum = page - 2 + i;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        isActive={pageNum === page}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
