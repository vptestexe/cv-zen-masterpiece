
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCVContext } from "@/contexts/CVContext";
import { FolderGit2, Link, Plus, Trash2 } from "lucide-react";

export function ProjectsForm() {
  const { cvData, addProject, updateProject, removeProject } = useCVContext();
  const { projects } = cvData;

  return (
    <div className="space-y-6 animate-fade-in">
      {projects.length === 0 ? (
        <div className="text-center py-8 bg-muted/40 rounded-lg">
          <FolderGit2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Aucun projet ajouté
          </p>
        </div>
      ) : (
        projects.map((project) => (
          <div key={project.id} className="space-y-4 border rounded-lg p-4 relative animate-slide-in">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
              onClick={() => removeProject(project.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div>
              <Label htmlFor={`project-title-${project.id}`}>Titre du projet</Label>
              <div className="relative">
                <Input
                  id={`project-title-${project.id}`}
                  value={project.title}
                  onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                  placeholder="Application Web de Gestion de Tâches"
                  className="pl-10"
                />
                <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <Label htmlFor={`project-description-${project.id}`}>Description</Label>
              <Textarea
                id={`project-description-${project.id}`}
                value={project.description}
                onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                placeholder="Brève description du projet, des technologies utilisées et de vos contributions..."
                className="min-h-[100px] resize-none"
              />
            </div>

            <div>
              <Label htmlFor={`project-link-${project.id}`}>Lien (optionnel)</Label>
              <div className="relative">
                <Input
                  id={`project-link-${project.id}`}
                  value={project.link || ''}
                  onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="pl-10"
                />
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={addProject}
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter un projet
      </Button>
    </div>
  );
}
