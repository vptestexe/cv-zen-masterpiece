
import { CV } from '@/types/cv';

export interface PersonalInfoExtended extends CV['personalInfo'] {
  nationality?: {
    code: string;
    name: string;
  };
}

export interface CVExtended extends CV {
  personalInfo: PersonalInfoExtended;
}
