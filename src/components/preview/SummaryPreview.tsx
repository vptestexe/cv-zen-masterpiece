
import { useCVContext } from "@/contexts/CVContext";

export function SummaryPreview() {
  const { cvData } = useCVContext();
  
  return (
    <div className="whitespace-pre-line">
      {cvData.summary}
    </div>
  );
}
