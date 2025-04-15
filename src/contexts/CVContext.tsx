
import { createContext, useContext, useState, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CVData, CVTheme, WorkExperience, Education, Skill, Language, Project, Interest, Reference } from '@/types/cv';

interface CVContextProps {
  cvData: CVData;
  cvTheme: CVTheme;
  updatePersonalInfo: (field: string, value: string) => void;
  updateSummary: (summary: string) => void;
  addWorkExperience: () => void;
  updateWorkExperience: (id: string, field: string, value: string) => void;
  removeWorkExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, field: string, value: string) => void;
  removeEducation: (id: string) => void;
  addSkill: () => void;
  updateSkill: (id: string, field: string, value: string | number) => void;
  removeSkill: (id: string) => void;
  addLanguage: () => void;
  updateLanguage: (id: string, field: string, value: string) => void;
  removeLanguage: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, field: string, value: string) => void;
  removeProject: (id: string) => void;
  addInterest: () => void;
  updateInterest: (id: string, field: string, value: string) => void;
  removeInterest: (id: string) => void;
  addReference: () => void;
  updateReference: (id: string, field: string, value: string) => void;
  removeReference: (id: string) => void;
  updateTheme: (field: string, value: string) => void;
  resetCV: () => void;
}

const defaultCVData: CVData = {
  personalInfo: {
    fullName: '',
    jobTitle: '',
    address: '',
    phone: '',
    email: '',
    linkedin: '',
    github: '',
    portfolio: '',
    profilePhoto: '',
  },
  summary: '',
  workExperiences: [],
  educations: [],
  skills: [],
  languages: [],
  projects: [],
  interests: [],
  references: [],
};

const defaultCVTheme: CVTheme = {
  titleFont: 'playfair',
  textFont: 'roboto',
  primaryColor: '#0170c4', // cvblue-600
  backgroundColor: '#ffffff',
  photoPosition: 'top',
  photoSize: 'medium',
  titleStyle: 'underline',
};

export const CVContext = createContext<CVContextProps>({} as CVContextProps);

export const useCVContext = () => useContext(CVContext);

export const CVProvider = ({ children }: { children: ReactNode }) => {
  const [cvData, setCVData] = useState<CVData>(defaultCVData);
  const [cvTheme, setCVTheme] = useState<CVTheme>(defaultCVTheme);

  const updatePersonalInfo = (field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const updateSummary = (summary: string) => {
    setCVData(prev => ({
      ...prev,
      summary,
    }));
  };

  // Work Experience
  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: uuidv4(),
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
    };

    setCVData(prev => ({
      ...prev,
      workExperiences: [...prev.workExperiences, newExperience],
    }));
  };

  const updateWorkExperience = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeWorkExperience = (id: string) => {
    setCVData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter(exp => exp.id !== id),
    }));
  };

  // Education
  const addEducation = () => {
    const newEducation: Education = {
      id: uuidv4(),
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
      location: '',
      description: '',
    };

    setCVData(prev => ({
      ...prev,
      educations: [...prev.educations, newEducation],
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      educations: prev.educations.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setCVData(prev => ({
      ...prev,
      educations: prev.educations.filter(edu => edu.id !== id),
    }));
  };

  // Skills
  const addSkill = () => {
    const newSkill: Skill = {
      id: uuidv4(),
      name: '',
      level: 3,
    };

    setCVData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  };

  const updateSkill = (id: string, field: string, value: string | number) => {
    setCVData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    }));
  };

  const removeSkill = (id: string) => {
    setCVData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id),
    }));
  };

  // Languages
  const addLanguage = () => {
    const newLanguage: Language = {
      id: uuidv4(),
      name: '',
      level: 'Intermédiaire',
    };

    setCVData(prev => ({
      ...prev,
      languages: [...prev.languages, newLanguage],
    }));
  };

  const updateLanguage = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      languages: prev.languages.map(lang => 
        lang.id === id ? { ...lang, [field]: value } : lang
      ),
    }));
  };

  const removeLanguage = (id: string) => {
    setCVData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id),
    }));
  };

  // Projects
  const addProject = () => {
    const newProject: Project = {
      id: uuidv4(),
      title: '',
      description: '',
      link: '',
    };

    setCVData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      ),
    }));
  };

  const removeProject = (id: string) => {
    setCVData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id),
    }));
  };

  // Interests
  const addInterest = () => {
    const newInterest: Interest = {
      id: uuidv4(),
      name: '',
    };

    setCVData(prev => ({
      ...prev,
      interests: [...prev.interests, newInterest],
    }));
  };

  const updateInterest = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      interests: prev.interests.map(interest => 
        interest.id === id ? { ...interest, [field]: value } : interest
      ),
    }));
  };

  const removeInterest = (id: string) => {
    setCVData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest.id !== id),
    }));
  };

  // References
  const addReference = () => {
    const newReference: Reference = {
      id: uuidv4(),
      name: '',
      position: '',
      company: '',
      email: '',
      phone: '',
    };

    setCVData(prev => ({
      ...prev,
      references: [...prev.references, newReference],
    }));
  };

  const updateReference = (id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      references: prev.references.map(reference => 
        reference.id === id ? { ...reference, [field]: value } : reference
      ),
    }));
  };

  const removeReference = (id: string) => {
    setCVData(prev => ({
      ...prev,
      references: prev.references.filter(reference => reference.id !== id),
    }));
  };

  // Theme
  const updateTheme = (field: string, value: string) => {
    setCVTheme(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset CV to default values
  const resetCV = () => {
    setCVData(defaultCVData);
    setCVTheme(defaultCVTheme);
  };

  return (
    <CVContext.Provider
      value={{
        cvData,
        cvTheme,
        updatePersonalInfo,
        updateSummary,
        addWorkExperience,
        updateWorkExperience,
        removeWorkExperience,
        addEducation,
        updateEducation,
        removeEducation,
        addSkill,
        updateSkill,
        removeSkill,
        addLanguage,
        updateLanguage,
        removeLanguage,
        addProject,
        updateProject,
        removeProject,
        addInterest,
        updateInterest,
        removeInterest,
        addReference,
        updateReference,
        removeReference,
        updateTheme,
        resetCV,
      }}
    >
      {children}
    </CVContext.Provider>
  );
};
