
import { useCVContext } from "@/contexts/CVContext";

export function LanguagesPreview() {
  const { cvData } = useCVContext();
  const { languages } = cvData;
  
  // Filter out empty languages
  const validLanguages = languages.filter(language => language.name);

  if (validLanguages.length === 0) {
    return null;
  }
  
  return (
    <div>
      <ul className="list-disc pl-5 space-y-1">
        {validLanguages.map((language) => (
          <li key={language.id}>
            <span className="font-medium">{language.name}</span>
            {language.level && (
              <span className="opacity-75"> - {language.level}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
