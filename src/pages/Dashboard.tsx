
import React from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import PaymentDialog from "@/components/dashboard/PaymentDialog";
import DeleteConfirmDialog from "@/components/dashboard/DeleteConfirmDialog";
import DuplicateAlertDialog from "@/components/dashboard/DuplicateAlertDialog";
import CVList from "@/components/dashboard/CVList";
import { useDashboardState } from "./hooks/useDashboardState";
import { useDashboardActions } from "./hooks/useDashboardActions";
import { useDashboardEffects } from "./hooks/useDashboardEffects";
import { MAX_FREE_CVS } from "@/utils/downloadManager";

const Dashboard = () => {
  const state = useDashboardState();
  const actions = useDashboardActions(state);
  useDashboardEffects(state);

  const handlePaymentDialogClose = () => {
    state.setShowPaymentDialog(false);
    state.setCurrentCvId(null);
  };

  const handleRechargeClick = (cvId: string) => {
    state.setCurrentCvId(cvId);
    localStorage.setItem("cv_being_paid", cvId);
    state.setShowPaymentDialog(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader 
        userName={state.userName} 
        onLogout={actions.handleLogout} 
      />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <h2 className="text-3xl font-bold">Mon espace personnel</h2>
            <p className="text-muted-foreground">
              Gérez vos CV et créez-en de nouveaux
              <span className="ml-2 text-sm font-medium text-amber-600">
                (limite de {MAX_FREE_CVS} CV gratuits)
              </span>
            </p>
          </div>
          <Button onClick={actions.handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un nouveau CV
          </Button>
        </div>

        {state.userCVs.length === 0 ? (
          <Card className="w-full p-12 text-center">
            <CardContent className="flex flex-col items-center justify-center pt-6">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Aucun CV trouvé</h3>
              <p className="text-muted-foreground mb-6">
                Vous n'avez pas encore créé de CV. Commencez maintenant !
              </p>
              <Button onClick={actions.handleCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer mon premier CV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <CVList
            cvs={state.userCVs}
            downloadCounts={state.downloadCounts}
            processingPayment={state.processingPayment}
            onEdit={actions.handleEdit}
            onDownload={actions.handleDownload}
            onRecharge={handleRechargeClick}
            onDelete={(cvId) => {
              state.setCvToDelete(cvId);
              state.setShowDeleteConfirm(true);
            }}
          />
        )}
      </main>

      <PaymentDialog 
        open={state.showPaymentDialog} 
        onClose={handlePaymentDialogClose} 
      />
      <DeleteConfirmDialog
        open={state.showDeleteConfirm}
        onCancel={() => state.setShowDeleteConfirm(false)}
        onDelete={actions.handleDelete}
      />
      <DuplicateAlertDialog
        open={state.showDuplicateAlert}
        duplicatesFound={state.duplicatesFound}
        onClose={() => state.setShowDuplicateAlert(false)}
      />
      <DashboardFooter />
    </div>
  );
};

export default Dashboard;
