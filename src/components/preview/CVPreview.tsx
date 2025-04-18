
import { useCVContext } from "@/contexts/CVContext";
import { PersonalInfoPreview } from "./PersonalInfoPreview";
import { SummaryPreview } from "./SummaryPreview";
import { WorkExperiencePreview } from "./WorkExperiencePreview";
import { EducationPreview } from "./EducationPreview";
import { SkillsPreview } from "./SkillsPreview";
import { LanguagesPreview } from "./LanguagesPreview";
import { ProjectsPreview } from "./ProjectsPreview";
import { InterestsPreview } from "./InterestsPreview";
import { ReferencesPreview } from "./ReferencesPreview";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export function CVPreview() {
  const { cvData, cvTheme, updateTheme } = useCVContext();
  const { summary, workExperiences, educations, skills, languages, projects, interests, references } = cvData;
  const isMobile = useIsMobile();
  const location = useLocation();
  const [themeUpdateCounter, setThemeUpdateCounter] = useState(0);

  // Effet pour appliquer les styles de template
  useEffect(() => {
    const path = location.pathname;
    const templateId = path.split('/').pop();
    
    if (templateId && templateId !== 'editor') {
      console.log("Applying template:", templateId);
      // Apply template-specific styles
      switch (templateId) {
        case 'classic':
          updateTheme('primaryColor', '#0170c4');
          updateTheme('titleStyle', 'underline');
          updateTheme('titleFont', 'playfair');
          updateTheme('textFont', 'roboto');
          break;
        case 'modern':
          updateTheme('primaryColor', '#7E69AB');
          updateTheme('titleStyle', 'background');
          updateTheme('titleFont', 'roboto');
          updateTheme('textFont', 'roboto');
          break;
        case 'creative':
          updateTheme('primaryColor', '#F97316');
          updateTheme('titleStyle', 'border');
          updateTheme('titleFont', 'playfair');
          updateTheme('textFont', 'playfair');
          break;
        case 'professional':
          updateTheme('primaryColor', '#403E43');
          updateTheme('titleStyle', 'underline');
          updateTheme('titleFont', 'roboto');
          updateTheme('textFont', 'roboto');
          break;
        case 'minimalist':
          updateTheme('primaryColor', '#222222');
          updateTheme('titleStyle', 'plain');
          updateTheme('titleFont', 'roboto');
          updateTheme('textFont', 'roboto');
          break;
        case 'elegant':
          updateTheme('primaryColor', '#D946EF');
          updateTheme('titleStyle', 'background');
          updateTheme('titleFont', 'playfair');
          updateTheme('textFont', 'playfair');
          break;
        default:
          // Default style
          break;
      }
      // Force re-render
      setThemeUpdateCounter(prev => prev + 1);
    }
  }, [location.pathname]);
  
  // Effet pour forcer le rendu quand le thème change
  useEffect(() => {
    console.log("Theme updated:", cvTheme);
    setThemeUpdateCounter(prev => prev + 1);
  }, [cvTheme]);

  // Apply theme with dynamic updates
  const previewStyle = {
    backgroundColor: cvTheme.backgroundColor || "white",
    color: "rgb(63 63 70)",
    fontFamily: cvTheme.textFont === "playfair" 
      ? "'Playfair Display', serif" 
      : "'Roboto', sans-serif",
  };

  // Check if a section has content
  const hasSummary = !!summary.trim();
  const hasExperiences = workExperiences.length > 0 && workExperiences.some(exp => exp.position || exp.company);
  const hasEducations = educations.length > 0 && educations.some(edu => edu.degree || edu.institution);
  const hasSkills = skills.length > 0 && skills.some(skill => skill.name);
  const hasLanguages = languages.length > 0 && languages.some(lang => lang.name);
  const hasProjects = projects.length > 0 && projects.some(proj => proj.title || proj.description);
  const hasInterests = interests.length > 0 && interests.some(int => int.name);
  const hasReferences = references.length > 0 && references.some(ref => ref.name);

  // Créer les classes de titre avec les styles dynamiques
  const titleClass = cn(
    "text-lg font-semibold mb-3",
    cvTheme.titleFont === "playfair" ? "font-playfair" : "font-sans",
    {
      "pb-1 border-b-2": cvTheme.titleStyle === "underline",
      "px-2 py-1 bg-opacity-10 rounded": cvTheme.titleStyle === "background",
      "p-2 border rounded-md": cvTheme.titleStyle === "border",
    }
  );

  // Dynamic border color based on primary color
  const borderColor = cvTheme.primaryColor;
  const titleStyle = cvTheme.titleStyle === "underline" 
    ? { borderColor, color: cvTheme.primaryColor }
    : cvTheme.titleStyle === "background"
    ? { backgroundColor: `${cvTheme.primaryColor}25`, color: cvTheme.primaryColor }
    : cvTheme.titleStyle === "border"
    ? { borderColor, color: cvTheme.primaryColor }
    : { color: cvTheme.primaryColor };

  return (
    <div 
      className="cv-preview" 
      style={previewStyle}
      key={`preview-${themeUpdateCounter}`} // Forcer le rendu quand le thème change
    >
      <PersonalInfoPreview titleClass={titleClass} titleStyle={titleStyle} />

      {hasSummary && (
        <div className="mb-6">
          <h2 className={titleClass} style={titleStyle}>Profil</h2>
          <SummaryPreview />
        </div>
      )}

      {hasExperiences && (
        <div className="mb-6">
          <h2 className={titleClass} style={titleStyle}>Expériences Professionnelles</h2>
          <WorkExperiencePreview />
        </div>
      )}

      {hasEducations && (
        <div className="mb-6">
          <h2 className={titleClass} style={titleStyle}>Formations</h2>
          <EducationPreview />
        </div>
      )}

      <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-6 mb-6`}>
        {hasSkills && (
          <div>
            <h2 className={titleClass} style={titleStyle}>Compétences</h2>
            <SkillsPreview />
          </div>
        )}

        {hasLanguages && (
          <div>
            <h2 className={titleClass} style={titleStyle}>Langues</h2>
            <LanguagesPreview />
          </div>
        )}
      </div>

      {hasProjects && (
        <div className="mb-6">
          <h2 className={titleClass} style={titleStyle}>Projets</h2>
          <ProjectsPreview />
        </div>
      )}

      {hasInterests && (
        <div className="mb-6">
          <h2 className={titleClass} style={titleStyle}>Centres d'Intérêt</h2>
          <InterestsPreview />
        </div>
      )}

      {hasReferences && (
        <div>
          <h2 className={titleClass} style={titleStyle}>Références</h2>
          <ReferencesPreview />
        </div>
      )}
    </div>
  );
}
