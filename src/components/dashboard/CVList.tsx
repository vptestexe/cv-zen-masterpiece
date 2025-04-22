
import React from "react";
import CVCard from "@/components/dashboard/CVCard";
import { CVTheme } from "@/types/cv";

interface CV {
  id: string;
  title: string;
  lastUpdated: string;
  template: string;
  data: any;
  theme: CVTheme;
}

interface CVListProps {
  cvs: CV[];
  downloadCounts: { [key: string]: { count: number, lastPaymentDate: string } };
  processingPayment: boolean;
  onEdit: (id: string) => void;
  onDownload: (id: string, format: string) => void;
  onRecharge: (id: string) => void;
  onDelete: (id: string) => void;
}

const CVList = ({
  cvs,
  downloadCounts,
  processingPayment,
  onEdit,
  onDownload,
  onRecharge,
  onDelete,
}: CVListProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {cvs.map((cv) => (
      <CVCard
        key={cv.id}
        cv={cv}
        downloadCount={downloadCounts[cv.id]}
        processingPayment={processingPayment}
        onEdit={onEdit}
        onDownload={onDownload}
        onRecharge={onRecharge}
        onDelete={onDelete}
      />
    ))}
  </div>
);

export default CVList;
