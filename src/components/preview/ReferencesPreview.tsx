
import { useCVContext } from "@/contexts/CVContext";
import { AtSign, Phone } from "lucide-react";

export function ReferencesPreview() {
  const { cvData, cvTheme } = useCVContext();
  const { references } = cvData;
  
  // Filter out empty references
  const validReferences = references.filter(
    reference => reference.name || reference.company || reference.position
  );

  if (validReferences.length === 0) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {validReferences.map((reference) => (
        <div key={reference.id} className="border rounded-md p-3">
          {reference.name && (
            <h3 className="font-semibold">
              {reference.name}
            </h3>
          )}
          
          {(reference.position || reference.company) && (
            <p className="text-sm">
              {reference.position}
              {reference.position && reference.company && " - "}
              {reference.company}
            </p>
          )}
          
          <div className="mt-2 space-y-1 text-sm">
            {reference.email && (
              <div className="flex items-center gap-1">
                <AtSign className="h-3 w-3" style={{ color: cvTheme.primaryColor }} />
                <span>{reference.email}</span>
              </div>
            )}
            
            {reference.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" style={{ color: cvTheme.primaryColor }} />
                <span>{reference.phone}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
