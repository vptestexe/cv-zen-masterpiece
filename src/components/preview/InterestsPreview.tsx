
import { useCVContext } from "@/contexts/CVContext";

export function InterestsPreview() {
  const { cvData } = useCVContext();
  const { interests } = cvData;
  
  // Filter out empty interests
  const validInterests = interests.filter(interest => interest.name);

  if (validInterests.length === 0) {
    return null;
  }
  
  return (
    <div>
      <ul className="list-disc pl-5 space-y-1">
        {validInterests.map((interest) => (
          <li key={interest.id}>
            {interest.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
