
import { useCVContext } from "@/contexts/CVContext";
import { CalendarRange, MapPin } from "lucide-react";

export function EducationPreview() {
  const { cvData, cvTheme } = useCVContext();
  const { educations } = cvData;
  
  // Filter out empty educations
  const validEducations = educations.filter(
    edu => edu.degree || edu.institution || edu.description
  );

  if (validEducations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {validEducations.map((education) => (
        <div key={education.id} className="mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
            <div>
              {education.degree && (
                <h3 className="font-semibold">
                  {education.degree}
                  {education.institution && ` - ${education.institution}`}
                </h3>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-sm opacity-75 flex-shrink-0">
              {(education.startDate || education.endDate) && (
                <>
                  <CalendarRange className="h-3 w-3" style={{ color: cvTheme.primaryColor }} />
                  <span>
                    {education.startDate || ""}
                    {education.startDate && education.endDate && " - "}
                    {education.endDate || ""}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {education.location && (
            <div className="flex items-center gap-1 text-sm opacity-75 mb-2">
              <MapPin className="h-3 w-3" style={{ color: cvTheme.primaryColor }} />
              <span>{education.location}</span>
            </div>
          )}
          
          {education.description && (
            <p className="whitespace-pre-line text-sm">
              {education.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
