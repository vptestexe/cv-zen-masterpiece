
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CVData, CVTheme, WorkExperience, Education, Skill, Language, Project, Interest, Reference } from '@/types/cv';
import { useParams } from 'react-router-dom';

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

// Données de base vides pour un nouveau CV
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

// Thème par défaut
const defaultCVTheme: CVTheme = {
  titleFont: 'playfair',
  textFont: 'roboto',
  primaryColor: '#0170c4', // cvblue-600
  backgroundColor: '#ffffff',
  photoPosition: 'top',
  photoSize: 'medium',
  titleStyle: 'underline',
};

// Exemple de données pré-remplies pour les modèles de CV
const getTemplateData = (templateId: string | undefined) => {
  // CV classique (basé sur le développement web)
  if (templateId === 'classic') {
    return {
      data: {
        personalInfo: {
          fullName: 'Thomas Dubois',
          jobTitle: 'Développeur Web Full Stack',
          address: 'Paris, France',
          phone: '06 12 34 56 78',
          email: 'thomas.dubois@example.com',
          linkedin: 'linkedin.com/in/thomasdubois',
          github: 'github.com/thomasdubois',
          portfolio: 'thomasdubois.dev',
          profilePhoto: '',
        },
        summary: 'Développeur passionné avec plus de 5 ans d\'expérience dans la création d\'applications web modernes. Spécialisé en React, Node.js et TypeScript. Orienté solutions avec un fort esprit d\'équipe.',
        workExperiences: [
          {
            id: uuidv4(),
            position: 'Développeur Full Stack Senior',
            company: 'Tech Innovations',
            startDate: '2022-01',
            endDate: 'Présent',
            location: 'Paris',
            description: 'Développement d\'applications web pour des clients internationaux. Mise en place d\'architectures scalables et performantes. Gestion d\'une équipe de 3 développeurs juniors.',
          },
          {
            id: uuidv4(),
            position: 'Développeur Front-end',
            company: 'Digital Agency',
            startDate: '2019-03',
            endDate: '2021-12',
            location: 'Lyon',
            description: 'Création d\'interfaces utilisateur réactives et accessibles. Collaboration avec les designers pour optimiser l\'expérience utilisateur. Migration d\'applications legacy vers React.',
          },
        ],
        educations: [
          {
            id: uuidv4(),
            degree: 'Master en Informatique',
            institution: 'Université de Paris',
            startDate: '2017',
            endDate: '2019',
            location: 'Paris',
            description: 'Spécialisation en développement web et applications mobiles. Projet de fin d\'études: Plateforme collaborative pour projets open-source.',
          },
          {
            id: uuidv4(),
            degree: 'Licence en Informatique',
            institution: 'Université Lyon 1',
            startDate: '2014',
            endDate: '2017',
            location: 'Lyon',
            description: 'Fondamentaux de la programmation, bases de données, réseaux et systèmes.',
          },
        ],
        skills: [
          { id: uuidv4(), name: 'JavaScript/TypeScript', level: 5 },
          { id: uuidv4(), name: 'React', level: 5 },
          { id: uuidv4(), name: 'Node.js', level: 4 },
          { id: uuidv4(), name: 'HTML/CSS', level: 4 },
          { id: uuidv4(), name: 'GraphQL', level: 3 },
          { id: uuidv4(), name: 'Docker', level: 3 },
        ],
        languages: [
          { id: uuidv4(), name: 'Français', level: 'Langue maternelle' },
          { id: uuidv4(), name: 'Anglais', level: 'Courant' },
          { id: uuidv4(), name: 'Espagnol', level: 'Intermédiaire' },
        ],
        projects: [
          {
            id: uuidv4(),
            title: 'Portfolio Personnel',
            description: 'Site web personnel présentant mes projets et compétences, développé avec Next.js et TailwindCSS.',
            link: 'thomasdubois.dev',
          },
          {
            id: uuidv4(),
            title: 'Application de Gestion de Tâches',
            description: 'Application open-source permettant de gérer ses tâches quotidiennes, avec synchronisation cloud et notifications.',
            link: 'github.com/thomasdubois/task-manager',
          },
        ],
        interests: [
          { id: uuidv4(), name: 'Développement open-source' },
          { id: uuidv4(), name: 'Photographie' },
          { id: uuidv4(), name: 'Course à pied' },
          { id: uuidv4(), name: 'Voyages' },
        ],
        references: [
          {
            id: uuidv4(),
            name: 'Claire Martin',
            position: 'CTO',
            company: 'Tech Innovations',
            email: 'claire.martin@techinno.com',
            phone: '06 98 76 54 32',
          },
        ],
      },
      theme: {
        ...defaultCVTheme,
        primaryColor: '#0170c4',
      }
    };
  }
  
  // CV moderne (basé sur le marketing digital)
  else if (templateId === 'modern') {
    return {
      data: {
        personalInfo: {
          fullName: 'Sophie Laurent',
          jobTitle: 'Spécialiste Marketing Digital',
          address: 'Bordeaux, France',
          phone: '06 87 65 43 21',
          email: 'sophie.laurent@example.com',
          linkedin: 'linkedin.com/in/sophielaurent',
          portfolio: 'sophielaurent.com',
          profilePhoto: '',
        },
        summary: 'Professionnelle du marketing digital avec 7 ans d\'expérience dans l\'élaboration et l\'exécution de stratégies numériques performantes. Expertise en SEO/SEA, médias sociaux et analyse de données.',
        workExperiences: [
          {
            id: uuidv4(),
            position: 'Responsable Marketing Digital',
            company: 'E-commerce Plus',
            startDate: '2023-04',
            endDate: 'Présent',
            location: 'Bordeaux',
            description: 'Gestion des campagnes publicitaires sur Google et Meta. Optimisation SEO et analyse des performances. Augmentation du trafic organique de 45% en un an.',
          },
          {
            id: uuidv4(),
            position: 'Chargée de Marketing Digital',
            company: 'Agence Web Creative',
            startDate: '2020-01',
            endDate: '2023-03',
            location: 'Nantes',
            description: 'Élaboration de stratégies de contenu pour les réseaux sociaux. Gestion de campagnes publicitaires pour divers clients. Analyse et reporting mensuel des KPIs.',
          },
          {
            id: uuidv4(),
            position: 'Assistante Marketing',
            company: 'Start-up Innovante',
            startDate: '2018-07',
            endDate: '2019-12',
            location: 'Paris',
            description: 'Support aux activités marketing. Création de contenus pour le blog et les réseaux sociaux. Participation aux événements promotionnels.',
          },
        ],
        educations: [
          {
            id: uuidv4(),
            degree: 'Master en Marketing Digital',
            institution: 'ESSEC Business School',
            startDate: '2016',
            endDate: '2018',
            location: 'Paris',
            description: 'Spécialisation en stratégies digitales et e-commerce. Mémoire sur l\'impact des réseaux sociaux sur les comportements d\'achat.',
          },
          {
            id: uuidv4(),
            degree: 'Bachelor en Communication',
            institution: 'Sciences Po Bordeaux',
            startDate: '2013',
            endDate: '2016',
            location: 'Bordeaux',
            description: 'Formation pluridisciplinaire en communication, médias et sciences sociales.',
          },
        ],
        skills: [
          { id: uuidv4(), name: 'SEO/SEA', level: 5 },
          { id: uuidv4(), name: 'Google Analytics', level: 5 },
          { id: uuidv4(), name: 'Réseaux Sociaux', level: 4 },
          { id: uuidv4(), name: 'Content Marketing', level: 4 },
          { id: uuidv4(), name: 'Email Marketing', level: 4 },
          { id: uuidv4(), name: 'Adobe Creative Suite', level: 3 },
        ],
        languages: [
          { id: uuidv4(), name: 'Français', level: 'Langue maternelle' },
          { id: uuidv4(), name: 'Anglais', level: 'Bilingue' },
          { id: uuidv4(), name: 'Allemand', level: 'Intermédiaire' },
        ],
        projects: [
          {
            id: uuidv4(),
            title: 'Refonte SEO E-commerce Plus',
            description: 'Projet d\'optimisation du référencement naturel ayant généré une augmentation de 67% des conversions organiques en 6 mois.',
          },
          {
            id: uuidv4(),
            title: 'Campagne Réseaux Sociaux "Été Responsable"',
            description: 'Campagne de sensibilisation écologique qui a touché plus de 500 000 personnes avec un taux d\'engagement de 4,8%.',
          },
        ],
        interests: [
          { id: uuidv4(), name: 'Photographie' },
          { id: uuidv4(), name: 'Cuisine' },
          { id: uuidv4(), name: 'Randonnée' },
          { id: uuidv4(), name: 'Littérature' },
        ],
        references: [
          {
            id: uuidv4(),
            name: 'Marc Dupont',
            position: 'Directeur Marketing',
            company: 'E-commerce Plus',
            email: 'marc.dupont@ecomplus.com',
            phone: '06 12 34 56 78',
          },
        ],
      },
      theme: {
        ...defaultCVTheme,
        primaryColor: '#8B5CF6',
        titleFont: 'roboto',
        titleStyle: 'background',
      }
    };
  }
  
  // Exemple créatif pour les métiers artistiques et créatifs
  else if (templateId === 'creative') {
    return {
      data: {
        personalInfo: {
          fullName: 'Léa Moreau',
          jobTitle: 'Designer UX/UI',
          address: 'Montpellier, France',
          phone: '06 23 45 67 89',
          email: 'lea.moreau@example.com',
          linkedin: 'linkedin.com/in/leamoreau',
          portfolio: 'leamoreau.design',
          profilePhoto: '',
        },
        summary: 'Designer UX/UI créative avec 4 ans d\'expérience dans la conception d\'interfaces intuitives et esthétiques. Passionnée par l\'amélioration de l\'expérience utilisateur à travers des designs innovants et accessibles.',
        workExperiences: [
          {
            id: uuidv4(),
            position: 'Designer UX/UI Senior',
            company: 'Studio Créatif Digital',
            startDate: '2022-06',
            endDate: 'Présent',
            location: 'Montpellier',
            description: 'Conception d\'interfaces pour applications mobiles et web. Réalisation de wireframes, prototypes et maquettes haute-fidélité. Animation d\'ateliers de design thinking.',
          },
          {
            id: uuidv4(),
            position: 'Designer UI',
            company: 'Agence Interactive',
            startDate: '2020-03',
            endDate: '2022-05',
            location: 'Lyon',
            description: 'Création d\'interfaces visuellement attrayantes pour divers clients. Collaboration étroite avec les développeurs pour l\'implémentation des designs. Élaboration de systèmes de design.',
          },
        ],
        educations: [
          {
            id: uuidv4(),
            degree: 'Master en Design Numérique',
            institution: 'ESAD Montpellier',
            startDate: '2018',
            endDate: '2020',
            location: 'Montpellier',
            description: 'Spécialisation en design d\'interfaces et expérience utilisateur. Projet de fin d\'études: Refonte UX d\'une application de service public.',
          },
          {
            id: uuidv4(),
            degree: 'Licence en Arts Appliqués',
            institution: 'Université Lyon 2',
            startDate: '2015',
            endDate: '2018',
            location: 'Lyon',
            description: 'Formation pluridisciplinaire en design graphique, typographie et arts visuels.',
          },
        ],
        skills: [
          { id: uuidv4(), name: 'Figma', level: 5 },
          { id: uuidv4(), name: 'Adobe XD', level: 4 },
          { id: uuidv4(), name: 'Photoshop/Illustrator', level: 4 },
          { id: uuidv4(), name: 'Prototypage', level: 5 },
          { id: uuidv4(), name: 'Design System', level: 4 },
          { id: uuidv4(), name: 'HTML/CSS', level: 3 },
        ],
        languages: [
          { id: uuidv4(), name: 'Français', level: 'Langue maternelle' },
          { id: uuidv4(), name: 'Anglais', level: 'Courant' },
          { id: uuidv4(), name: 'Italien', level: 'Intermédiaire' },
        ],
        projects: [
          {
            id: uuidv4(),
            title: 'Refonte UX Application Bancaire',
            description: 'Refonte complète de l\'expérience utilisateur d\'une application bancaire, augmentant la satisfaction client de 35%.',
            link: 'leamoreau.design/banking-app',
          },
          {
            id: uuidv4(),
            title: 'Design System pour Startup E-santé',
            description: 'Création d\'un système de design complet pour une startup dans le domaine de la santé numérique.',
            link: 'leamoreau.design/health-system',
          },
        ],
        interests: [
          { id: uuidv4(), name: 'Illustration numérique' },
          { id: uuidv4(), name: 'Photographie' },
          { id: uuidv4(), name: 'Art contemporain' },
          { id: uuidv4(), name: 'Voyages' },
        ],
        references: [
          {
            id: uuidv4(),
            name: 'Julie Leroy',
            position: 'Directrice Artistique',
            company: 'Studio Créatif Digital',
            email: 'julie.leroy@studio-creatif.com',
            phone: '06 45 67 89 01',
          },
        ],
      },
      theme: {
        ...defaultCVTheme,
        primaryColor: '#D946EF',
        photoPosition: 'right',
        titleStyle: 'border',
      }
    };
  }
  
  // CV professionnel (basé sur la finance)
  else if (templateId === 'professional') {
    return {
      data: {
        personalInfo: {
          fullName: 'Alexandre Martin',
          jobTitle: 'Analyste Financier',
          address: 'Paris, France',
          phone: '06 78 90 12 34',
          email: 'alexandre.martin@example.com',
          linkedin: 'linkedin.com/in/alexandremartin',
          profilePhoto: '',
        },
        summary: 'Analyste financier expérimenté avec 8 ans de pratique dans l\'évaluation d\'investissements et la gestion de portefeuilles. Expert en analyse de données financières et modélisation prévisionnelle pour optimiser les décisions d\'investissement.',
        workExperiences: [
          {
            id: uuidv4(),
            position: 'Analyste Financier Senior',
            company: 'Groupe Bancaire International',
            startDate: '2021-09',
            endDate: 'Présent',
            location: 'Paris',
            description: 'Analyse approfondie des opportunités d\'investissement. Développement de modèles financiers complexes. Présentation de rapports stratégiques à la direction et aux clients institutionnels.',
          },
          {
            id: uuidv4(),
            position: 'Analyste Financier',
            company: 'Cabinet de Conseil Financier',
            startDate: '2018-04',
            endDate: '2021-08',
            location: 'Lyon',
            description: 'Évaluation des performances financières d\'entreprises. Participation aux due diligence pour des opérations de fusion-acquisition. Élaboration de rapports détaillés sur les risques d\'investissement.',
          },
          {
            id: uuidv4(),
            position: 'Assistant Analyste',
            company: 'Société de Gestion d\'Actifs',
            startDate: '2017-01',
            endDate: '2018-03',
            location: 'Paris',
            description: 'Support à l\'équipe d\'analyse dans la collecte et le traitement des données financières. Contribution à la création de rapports périodiques sur les performances des investissements.',
          },
        ],
        educations: [
          {
            id: uuidv4(),
            degree: 'Master en Finance',
            institution: 'HEC Paris',
            startDate: '2015',
            endDate: '2017',
            location: 'Paris',
            description: 'Spécialisation en finance d\'entreprise et marchés de capitaux. Mémoire sur l\'impact des politiques monétaires sur les marchés émergents.',
          },
          {
            id: uuidv4(),
            degree: 'Bachelor en Économie',
            institution: 'Université Paris-Dauphine',
            startDate: '2012',
            endDate: '2015',
            location: 'Paris',
            description: 'Formation en macroéconomie, microéconomie et économétrie avec une introduction aux marchés financiers.',
          },
        ],
        skills: [
          { id: uuidv4(), name: 'Analyse financière', level: 5 },
          { id: uuidv4(), name: 'Modélisation Excel', level: 5 },
          { id: uuidv4(), name: 'Bloomberg Terminal', level: 4 },
          { id: uuidv4(), name: 'Valorisation d\'entreprise', level: 4 },
          { id: uuidv4(), name: 'Python pour la finance', level: 3 },
          { id: uuidv4(), name: 'SQL', level: 3 },
        ],
        languages: [
          { id: uuidv4(), name: 'Français', level: 'Langue maternelle' },
          { id: uuidv4(), name: 'Anglais', level: 'Bilingue' },
          { id: uuidv4(), name: 'Allemand', level: 'Courant' },
        ],
        projects: [
          {
            id: uuidv4(),
            title: 'Optimisation de Portefeuille Institutionnel',
            description: 'Restructuration d\'un portefeuille de 200M€ ayant résulté en une amélioration du ratio rendement/risque de 15%.',
          },
          {
            id: uuidv4(),
            title: 'Analyse Sectorielle Technologies Vertes',
            description: 'Étude approfondie du secteur des technologies vertes identifiant les principales opportunités d\'investissement pour les 5 prochaines années.',
          },
        ],
        interests: [
          { id: uuidv4(), name: 'Économie comportementale' },
          { id: uuidv4(), name: 'Tennis' },
          { id: uuidv4(), name: 'Échecs' },
          { id: uuidv4(), name: 'Littérature économique' },
        ],
        references: [
          {
            id: uuidv4(),
            name: 'Philippe Durand',
            position: 'Directeur des Investissements',
            company: 'Groupe Bancaire International',
            email: 'p.durand@gbi-finance.com',
            phone: '06 12 34 56 78',
          },
        ],
      },
      theme: {
        ...defaultCVTheme,
        primaryColor: '#0EA5E9',
        textFont: 'playfair',
        photoSize: 'small',
        titleStyle: 'plain',
      }
    };
  }
  
  // CV minimaliste
  else if (templateId === 'minimalist') {
    return {
      data: {
        personalInfo: {
          fullName: 'Emma Bernard',
          jobTitle: 'Architecte Logiciel',
          address: 'Toulouse, France',
          phone: '06 56 78 90 12',
          email: 'emma.bernard@example.com',
          linkedin: 'linkedin.com/in/emmabernard',
          github: 'github.com/emmabernard',
          profilePhoto: '',
        },
        summary: 'Architecte logiciel avec 10 ans d\'expérience dans la conception et l\'implémentation de systèmes distribués. Passionnée par les solutions élégantes et performantes répondant aux défis techniques complexes.',
        workExperiences: [
          {
            id: uuidv4(),
            position: 'Architecte Logiciel Principal',
            company: 'Solutions Cloud Innovantes',
            startDate: '2020-06',
            endDate: 'Présent',
            location: 'Toulouse',
            description: 'Conception de l\'architecture de systèmes distribués à haute disponibilité. Leadership technique d\'une équipe de 8 développeurs. Élaboration de la stratégie technologique à long terme.',
          },
          {
            id: uuidv4(),
            position: 'Ingénieure Logiciel Senior',
            company: 'Entreprise Technologique',
            startDate: '2016-03',
            endDate: '2020-05',
            location: 'Bordeaux',
            description: 'Développement de microservices en Go et Java. Mise en place d\'une infrastructure CI/CD robuste. Optimisation des performances des applications backend.',
          },
        ],
        educations: [
          {
            id: uuidv4(),
            degree: 'Master en Informatique',
            institution: 'INSA Toulouse',
            startDate: '2014',
            endDate: '2016',
            location: 'Toulouse',
            description: 'Spécialisation en systèmes distribués et cloud computing. Projet de recherche sur les algorithmes de consensus distribués.',
          },
          {
            id: uuidv4(),
            degree: 'Diplôme d\'Ingénieur',
            institution: 'ENSEEIHT',
            startDate: '2011',
            endDate: '2014',
            location: 'Toulouse',
            description: 'Formation en génie informatique et télécommunications. Doubles compétences techniques et managériales.',
          },
        ],
        skills: [
          { id: uuidv4(), name: 'Architecture Système', level: 5 },
          { id: uuidv4(), name: 'Go', level: 5 },
          { id: uuidv4(), name: 'Java', level: 4 },
          { id: uuidv4(), name: 'Kubernetes/Docker', level: 5 },
          { id: uuidv4(), name: 'AWS/GCP', level: 4 },
          { id: uuidv4(), name: 'Conception Systèmes Distribués', level: 5 },
        ],
        languages: [
          { id: uuidv4(), name: 'Français', level: 'Langue maternelle' },
          { id: uuidv4(), name: 'Anglais', level: 'Bilingue' },
        ],
        projects: [
          {
            id: uuidv4(),
            title: 'Migration vers Microservices',
            description: 'Direction du projet de décomposition d\'un monolithe en microservices, résultant en une réduction de 70% du temps de déploiement.',
            link: 'github.com/emmabernard/microservices-case-study',
          },
          {
            id: uuidv4(),
            title: 'Framework de Monitoring Distribué',
            description: 'Conception et implémentation d\'une solution de monitoring pour systèmes distribués adoptée par plusieurs équipes internes.',
            link: 'github.com/emmabernard/distributed-monitoring',
          },
        ],
        interests: [
          { id: uuidv4(), name: 'Intelligence artificielle' },
          { id: uuidv4(), name: 'Randonnée' },
          { id: uuidv4(), name: 'Piano' },
        ],
        references: [
          {
            id: uuidv4(),
            name: 'Nicolas Petit',
            position: 'CTO',
            company: 'Solutions Cloud Innovantes',
            email: 'n.petit@cloud-solutions.com',
            phone: '06 78 90 12 34',
          },
        ],
      },
      theme: {
        ...defaultCVTheme,
        primaryColor: '#121212',
        backgroundColor: '#f5f5f5',
        titleStyle: 'plain',
        photoPosition: 'left',
      }
    };
  }
  
  // CV élégant
  else if (templateId === 'elegant') {
    return {
      data: {
        personalInfo: {
          fullName: 'Pierre Rousseau',
          jobTitle: 'Conseiller en Gestion de Patrimoine',
          address: 'Strasbourg, France',
          phone: '06 34 56 78 90',
          email: 'pierre.rousseau@example.com',
          linkedin: 'linkedin.com/in/pierrerousseau',
          profilePhoto: '',
        },
        summary: 'Conseiller en gestion de patrimoine avec plus de 12 ans d\'expérience dans l\'accompagnement de clients fortunés. Approche personnalisée combinant expertise financière et vision à long terme pour optimiser et sécuriser le patrimoine de mes clients.',
        workExperiences: [
          {
            id: uuidv4(),
            position: 'Conseiller en Gestion de Patrimoine Senior',
            company: 'Banque Privée Prestige',
            startDate: '2018-11',
            endDate: 'Présent',
            location: 'Strasbourg',
            description: 'Gestion d\'un portefeuille de clients fortunés (>2M€ d\'actifs). Élaboration de stratégies patrimoniales complètes. Développement réussi du portefeuille client (+30% en 3 ans).',
          },
          {
            id: uuidv4(),
            position: 'Conseiller Financier',
            company: 'Cabinet de Conseil Patrimonial',
            startDate: '2013-04',
            endDate: '2018-10',
            location: 'Paris',
            description: 'Conseil en investissements et planification successorale. Analyse des situations fiscales et optimisation patrimoniale. Développement d\'une clientèle fidèle de professionnels libéraux.',
          },
        ],
        educations: [
          {
            id: uuidv4(),
            degree: 'Master en Gestion de Patrimoine',
            institution: 'Université de Strasbourg',
            startDate: '2011',
            endDate: '2013',
            location: 'Strasbourg',
            description: 'Formation spécialisée en droit fiscal, gestion de portefeuille et conseil patrimonial. Mémoire sur l\'optimisation fiscale des transmissions d\'entreprises familiales.',
          },
          {
            id: uuidv4(),
            degree: 'Licence en Finance',
            institution: 'EM Strasbourg Business School',
            startDate: '2008',
            endDate: '2011',
            location: 'Strasbourg',
            description: 'Formation en finance d\'entreprise, marchés financiers et comptabilité avec une introduction au conseil patrimonial.',
          },
        ],
        skills: [
          { id: uuidv4(), name: 'Planification Patrimoniale', level: 5 },
          { id: uuidv4(), name: 'Fiscalité', level: 5 },
          { id: uuidv4(), name: 'Investissements', level: 4 },
          { id: uuidv4(), name: 'Assurance-vie', level: 5 },
          { id: uuidv4(), name: 'Immobilier', level: 4 },
          { id: uuidv4(), name: 'Retraite', level: 4 },
        ],
        languages: [
          { id: uuidv4(), name: 'Français', level: 'Langue maternelle' },
          { id: uuidv4(), name: 'Anglais', level: 'Courant' },
          { id: uuidv4(), name: 'Allemand', level: 'Courant' },
        ],
        projects: [
          {
            id: uuidv4(),
            title: 'Séminaires Patrimoniaux',
            description: 'Organisation de séminaires trimestriels sur la gestion de patrimoine pour des clients et prospects, générant 15 nouveaux clients par an.',
          },
          {
            id: uuidv4(),
            title: 'Programme de Fidélisation Client',
            description: 'Développement d\'un programme personnalisé de suivi client ayant augmenté le taux de rétention de 85% à 97%.',
          },
        ],
        interests: [
          { id: uuidv4(), name: 'Œnologie' },
          { id: uuidv4(), name: 'Golf' },
          { id: uuidv4(), name: 'Histoire de l\'art' },
          { id: uuidv4(), name: 'Voyages culturels' },
        ],
        references: [
          {
            id: uuidv4(),
            name: 'Christine Weber',
            position: 'Directrice de la Banque Privée',
            company: 'Banque Privée Prestige',
            email: 'c.weber@banqueprestige.com',
            phone: '06 90 12 34 56',
          },
        ],
      },
      theme: {
        ...defaultCVTheme,
        primaryColor: '#A16207',
        titleFont: 'playfair',
        textFont: 'playfair',
        titleStyle: 'underline',
      }
    };
  }
  
  // Si le modèle n'est pas reconnu, retourner les valeurs par défaut vides
  return {
    data: defaultCVData,
    theme: defaultCVTheme
  };
};

export const CVContext = createContext<CVContextProps>({} as CVContextProps);

export const useCVContext = () => useContext(CVContext);

export const CVProvider = ({ children }: { children: ReactNode }) => {
  const { templateId } = useParams<{ templateId?: string }>();
  const [cvData, setCVData] = useState<CVData>(defaultCVData);
  const [cvTheme, setCVTheme] = useState<CVTheme>(defaultCVTheme);

  // Initialiser avec des données de modèle si un templateId est fourni
  useEffect(() => {
    if (templateId) {
      const template = getTemplateData(templateId);
      setCVData(template.data);
      setCVTheme(template.theme);
    }
  }, [templateId]);

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
    if (templateId) {
      const template = getTemplateData(templateId);
      setCVData(template.data);
      setCVTheme(template.theme);
    } else {
      setCVData(defaultCVData);
      setCVTheme(defaultCVTheme);
    }
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
