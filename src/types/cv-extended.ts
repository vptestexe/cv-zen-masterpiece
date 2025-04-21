
import { PersonalInfo, CV } from '@/types/cv';

export interface PersonalInfoExtended extends PersonalInfo {
  nationality?: {
    code: string;
    name: string;
  };
}

export interface CVExtended extends CV {
  personalInfo: PersonalInfoExtended;
}
