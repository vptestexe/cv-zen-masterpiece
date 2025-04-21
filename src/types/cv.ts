
export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  address: string;
  phone: string;
  email: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  profilePhoto?: string;
  nationality?: {
    code: string;
    name: string;
  };
}

export interface WorkExperience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5
}

export interface Language {
  id: string;
  name: string;
  level: 'Débutant' | 'Intermédiaire' | 'Courant' | 'Bilingue' | 'Langue maternelle';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link?: string;
}

export interface Interest {
  id: string;
  name: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  company: string;
  email: string;
  phone: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  interests: Interest[];
  references: Reference[];
}

export interface CVTheme {
  titleFont: 'playfair' | 'roboto';
  textFont: 'roboto' | 'playfair';
  primaryColor: string;
  backgroundColor: string;
  photoPosition: 'top' | 'left' | 'right';
  photoSize: 'small' | 'medium' | 'large';
  titleStyle: 'plain' | 'underline' | 'background' | 'border';
}

export type CVSection = 'personalInfo' | 'summary' | 'workExperiences' | 'educations' | 'skills' | 'languages' | 'projects' | 'interests' | 'references';

export type CV = {
  personalInfo: PersonalInfo;
  summary: string;
  workExperiences: WorkExperience[];
  educations: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  interests: Interest[];
  references: Reference[];
  theme?: CVTheme;
};
