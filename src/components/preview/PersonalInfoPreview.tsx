
import { useCVContext } from "@/contexts/CVContext";
import { AtSign, Briefcase, Github, Globe, Home, Linkedin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // Determine layout based on photo position
  const photoPosition = cvTheme.photoPosition;
  const photoSize = cvTheme.photoSize === 'small' ? 'h-24 w-24' : 
                   cvTheme.photoSize === 'large' ? 'h-36 w-36' : 'h-28 w-28';

  // Determine if we should use a layout with photo
  const usePhotoLayout = hasPhoto && (hasName || hasJobTitle);

  return (
    <div className={cn(
      "mb-6",
      usePhotoLayout && photoPosition === "left" ? "flex gap-6 items-start" : "",
      usePhotoLayout && photoPosition === "right" ? "flex flex-row-reverse gap-6 items-start" : ""
    )}>
      {usePhotoLayout && photoPosition === "top" && (
        <div className="flex justify-center mb-4">
          <div className={cn("rounded-full overflow-hidden", photoSize)}>
            <img
              src={personalInfo.profilePhoto}
              alt={personalInfo.fullName || "Profile"}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      {usePhotoLayout && (photoPosition === "left" || photoPosition === "right") && (
        <div className={cn("rounded-full overflow-hidden flex-shrink-0", photoSize)}>
          <img
            src={personalInfo.profilePhoto}
            alt={personalInfo.fullName || "Profile"}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className={cn(
        usePhotoLayout && (photoPosition === "left" || photoPosition === "right") ? "flex-grow" : ""
      )}>
        {hasName && (
          <h1 className={cn("text-2xl font-bold", cvTheme.titleFont === "playfair" ? "font-playfair" : "font-sans")} style={{ color: cvTheme.primaryColor }}>
            {personalInfo.fullName}
          </h1>
        )}

        {hasJobTitle && (
          <div className="flex items-center gap-2 text-lg mt-1 mb-4">
            <Briefcase className="h-4 w-4" style={{ color: cvTheme.primaryColor }} />
            <span>{personalInfo.jobTitle}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
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
