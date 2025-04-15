
import { useCVContext } from "@/contexts/CVContext";

export function SkillsPreview() {
  const { cvData, cvTheme } = useCVContext();
  const { skills } = cvData;
  
  // Filter out empty skills
  const validSkills = skills.filter(skill => skill.name);

  if (validSkills.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-2">
      {validSkills.map((skill) => (
        <div key={skill.id} className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span>{skill.name}</span>
            <span className="text-xs opacity-75">
              {skill.level === 1 && "Débutant"}
              {skill.level === 2 && "Intermédiaire"}
              {skill.level === 3 && "Avancé"}
              {skill.level === 4 && "Expert"}
              {skill.level === 5 && "Maître"}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full" 
              style={{ 
                width: `${skill.level * 20}%`,
                backgroundColor: cvTheme.primaryColor 
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
