
import { useCVContext } from "@/contexts/CVContext";
import { Link } from "lucide-react";

export function ProjectsPreview() {
  const { cvData, cvTheme } = useCVContext();
  const { projects } = cvData;
  
  // Filter out empty projects
  const validProjects = projects.filter(
    project => project.title || project.description
  );

  if (validProjects.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      {validProjects.map((project) => (
        <div key={project.id} className="mb-3">
          {project.title && (
            <h3 className="font-semibold mb-1">
              {project.title}
            </h3>
          )}
          
          {project.description && (
            <p className="text-sm whitespace-pre-line mb-1">
              {project.description}
            </p>
          )}
          
          {project.link && (
            <div className="flex items-center gap-1 text-sm">
              <Link className="h-3 w-3" style={{ color: cvTheme.primaryColor }} />
              <a 
                href={project.link.startsWith('http') ? project.link : `https://${project.link}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline"
                style={{ color: cvTheme.primaryColor }}
              >
                {project.link.replace(/^https?:\/\/(www\.)?/i, '')}
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
