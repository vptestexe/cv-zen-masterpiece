
import { useCVContext } from "@/contexts/CVContext";
import { AtSign, Briefcase, Flag, Github, Globe, Home, Linkedin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCountryByCode } from "@/utils/countries";

interface PersonalInfoPreviewProps {
  titleClass: string;
  titleStyle: React.CSSProperties;
}

export function PersonalInfoPreview({ titleClass, titleStyle }: PersonalInfoPreviewProps) {
  const { cvData, cvTheme } = useCVContext();
  const { personalInfo } = cvData;

  const hasName = !!personalInfo.fullName;
  const hasJobTitle = !!personalInfo.jobTitle;
  const hasAddress = !!personalInfo.address;
  const hasPhone = !!personalInfo.phone;
  const hasEmail = !!personalInfo.email;
  const hasLinkedin = !!personalInfo.linkedin;
  const hasGithub = !!personalInfo.github;
  const hasPortfolio = !!personalInfo.portfolio;
  const hasPhoto = !!personalInfo.profilePhoto;
  const hasNationality = !!personalInfo.nationality?.code;
  const country = hasNationality && typeof personalInfo.nationality?.code === 'string' 
    ? getCountryByCode(personalInfo.nationality.code) 
    : null;

  // Ajustement de la taille de la photo en fonction du paramètre photoSize
  const photoSizeMap = {
    small: "h-20 w-20",
    medium: "h-28 w-28",
    large: "h-36 w-36"
  };
  const photoSize = photoSizeMap[cvTheme.photoSize] || photoSizeMap.medium;

  // Définition du layout en fonction de la position de la photo
  const containerClass = cn(
    "flex gap-6 mb-6",
    {
      "flex-col items-center text-center": cvTheme.photoPosition === "top",
      "flex-row items-start": cvTheme.photoPosition === "left" || cvTheme.photoPosition === "right",
      "flex-row-reverse": cvTheme.photoPosition === "right"
    }
  );

  const infoContainerClass = cn(
    "flex flex-col gap-1",
    {
      "items-center": cvTheme.photoPosition === "top",
      "flex-grow": cvTheme.photoPosition !== "top"
    }
  );

  return (
    <div className={containerClass}>
      {hasPhoto && (
        <div className={cn("rounded-full overflow-hidden border border-gray-200 bg-white flex-shrink-0", photoSize)}>
          <img
            src={personalInfo.profilePhoto}
            alt={personalInfo.fullName || "Profile"}
            className="h-full w-full object-cover"
            style={{ objectFit: "cover" }}
            crossOrigin="anonymous"
            loading="lazy"
          />
        </div>
      )}

      <div className={infoContainerClass}>
        {hasName && (
          <h1 className={cn("text-2xl font-bold mb-1", cvTheme.titleFont === "playfair" ? "font-playfair" : "font-sans")} style={{ color: cvTheme.primaryColor }}>
            {personalInfo.fullName}
          </h1>
        )}

        {hasJobTitle && (
          <div className="flex items-center gap-2 text-lg mt-1 mb-2">
            <Briefcase className="h-4 w-4" style={{ color: cvTheme.primaryColor }} />
            <span>{personalInfo.jobTitle}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          {hasNationality && country && (
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 flex-shrink-0" style={{ color: cvTheme.primaryColor }} />
              <div className="flex items-center">
                <span 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: country.color }}
                ></span>
                <span>{personalInfo.nationality.name}</span>
              </div>
            </div>
          )}
          
          {hasAddress && (
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 flex-shrink-0" style={{ color: cvTheme.primaryColor }} />
              <span>{personalInfo.address}</span>
            </div>
          )}

          {hasPhone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 flex-shrink-0" style={{ color: cvTheme.primaryColor }} />
              <span>{personalInfo.phone}</span>
            </div>
          )}

          {hasEmail && (
            <div className="flex items-center gap-2">
              <AtSign className="h-4 w-4 flex-shrink-0" style={{ color: cvTheme.primaryColor }} />
              <span>{personalInfo.email}</span>
            </div>
          )}

          {hasLinkedin && (
            <div className="flex items-center gap-2">
              <Linkedin className="h-4 w-4 flex-shrink-0" style={{ color: cvTheme.primaryColor }} />
              <a 
                href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline truncate"
                style={{ color: cvTheme.primaryColor }}
              >
                {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/i, '')}
              </a>
            </div>
          )}

          {hasGithub && (
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 flex-shrink-0" style={{ color: cvTheme.primaryColor }} />
              <a 
                href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline truncate"
                style={{ color: cvTheme.primaryColor }}
              >
                {personalInfo.github.replace(/^https?:\/\/(www\.)?/i, '')}
              </a>
            </div>
          )}

          {hasPortfolio && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 flex-shrink-0" style={{ color: cvTheme.primaryColor }} />
              <a 
                href={personalInfo.portfolio.startsWith('http') ? personalInfo.portfolio : `https://${personalInfo.portfolio}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline truncate"
                style={{ color: cvTheme.primaryColor }}
              >
                {personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/i, '')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
