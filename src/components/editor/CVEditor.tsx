
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { SummaryForm } from "./SummaryForm";
import { WorkExperienceForm } from "./WorkExperienceForm";
import { EducationForm } from "./EducationForm";
import { SkillsForm } from "./SkillsForm";
import { LanguagesForm } from "./LanguagesForm";
import { ProjectsForm } from "./ProjectsForm";
import { InterestsForm } from "./InterestsForm";
import { ReferencesForm } from "./ReferencesForm";
import { LucideProps } from "lucide-react";
import { User, FileText, Briefcase, BookOpen, Code, Globe, FolderGit2, Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type IconComponentType = React.ComponentType<LucideProps>;

interface TabInfo {
  id: string;
  label: string;
  icon: IconComponentType;
  component: React.ReactNode;
}

export function CVEditor() {
  const [activeTab, setActiveTab] = useState("personalInfo");
  const isMobile = useIsMobile();

  const tabs: TabInfo[] = [
    {
      id: "personalInfo",
      label: "Informations",
      icon: User,
      component: <PersonalInfoForm />,
    },
    {
      id: "summary",
      label: "Profil",
      icon: FileText,
      component: <SummaryForm />,
    },
    {
      id: "workExperiences",
      label: "Expériences",
      icon: Briefcase,
      component: <WorkExperienceForm />,
    },
    {
      id: "educations",
      label: "Formations",
      icon: BookOpen,
      component: <EducationForm />,
    },
    {
      id: "skills",
      label: "Compétences",
      icon: Code,
      component: <SkillsForm />,
    },
    {
      id: "languages",
      label: "Langues",
      icon: Globe,
      component: <LanguagesForm />,
    },
    {
      id: "projects",
      label: "Projets",
      icon: FolderGit2,
      component: <ProjectsForm />,
    },
    {
      id: "interests",
      label: "Intérêts",
      icon: Heart,
      component: <InterestsForm />,
    },
    {
      id: "references",
      label: "Références",
      icon: User,
      component: <ReferencesForm />,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 rounded-md shadow-sm overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="h-full flex flex-col overflow-hidden"
      >
        <div className="bg-white border-b px-4 py-2 overflow-x-auto">
          <TabsList className={isMobile ? "flex w-max" : "grid grid-cols-9 h-auto"}>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`flex ${isMobile ? "flex-row" : "flex-col"} items-center py-2 ${isMobile ? "px-3" : "px-1"} text-xs gap-1 data-[state=active]:text-primary whitespace-nowrap`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="m-0 h-full">
              {tab.component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
