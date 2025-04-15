
import { useCVContext } from "@/contexts/CVContext";
import { CalendarRange, MapPin } from "lucide-react";

export function WorkExperiencePreview() {
  const { cvData, cvTheme } = useCVContext();
  const { workExperiences } = cvData;
  
  // Filter out empty experiences
  const validExperiences = workExperiences.filter(
    exp => exp.position || exp.company || exp.description
  );

  if (validExperiences.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {validExperiences.map((experience) => (
        <div key={experience.id} className="mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
            <div>
              {experience.position && (
                <h3 className="font-semibold">
                  {experience.position}
                  {experience.company && ` - ${experience.company}`}
                </h3>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-sm opacity-75 flex-shrink-0">
              {(experience.startDate || experience.endDate) && (
                <>
                  <CalendarRange className="h-3 w-3" style={{ color: cvTheme.primaryColor }} />
                  <span>
                    {experience.startDate || ""}
                    {experience.startDate && experience.endDate && " - "}
                    {experience.endDate || ""}
                  </span>
                </>
              )}
            </div>
          </div>
          
          {experience.location && (
            <div className="flex items-center gap-1 text-sm opacity-75 mb-2">
              <MapPin className="h-3 w-3" style={{ color: cvTheme.primaryColor }} />
              <span>{experience.location}</span>
            </div>
          )}
          
          {experience.description && (
            <p className="whitespace-pre-line text-sm">
              {experience.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
