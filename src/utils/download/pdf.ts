
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateUniqueId } from "@/utils/generateUniqueId";

// Downloads the CV as a PDF
export const downloadCvAsPdf = async (cv: any, downloadId: string) => {
  // Create a temporary container to render the CV
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '210mm'; // A4 width
  document.body.appendChild(container);

  try {
    // Prepare photo HTML if exists
    const photoHtml = cv.data?.personalInfo?.profilePhoto ? `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${cv.data.personalInfo.profilePhoto}" 
             alt="Profile Photo" 
             style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;" crossOrigin="anonymous" />
      </div>
    ` : '';

    // Create content as in preview
    container.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h1 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 24px; margin-bottom: 5px;">${cv.title}</h1>
        <p style="margin-bottom: 20px;">Dernière modification: ${new Date(cv.lastUpdated).toLocaleDateString()}</p>
        ${photoHtml}
        ${cv.data?.personalInfo?.fullName ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 18px; margin-bottom: 10px;">Informations personnelles</h2>
            <p><strong>Nom complet:</strong> ${cv.data.personalInfo.fullName}</p>
            ${cv.data.personalInfo.jobTitle ? `<p><strong>Poste:</strong> ${cv.data.personalInfo.jobTitle}</p>` : ''}
            ${cv.data.personalInfo.email ? `<p><strong>Email:</strong> ${cv.data.personalInfo.email}</p>` : ''}
            ${cv.data.personalInfo.phone ? `<p><strong>Téléphone:</strong> ${cv.data.personalInfo.phone}</p>` : ''}
            ${cv.data.personalInfo.address ? `<p><strong>Adresse:</strong> ${cv.data.personalInfo.address}</p>` : ''}
          </div>
        ` : ''}
        ${cv.data?.summary ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 18px; margin-bottom: 10px;">Profil</h2>
            <p>${cv.data.summary}</p>
          </div>
        ` : ''}
        ${cv.data?.workExperiences?.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 18px; margin-bottom: 10px;">Expériences Professionnelles</h2>
            ${cv.data.workExperiences.map((exp: any) => `
              <div style="margin-bottom: 15px;">
                <h3 style="font-size: 16px; margin-bottom: 5px;">${exp.position || ''} ${exp.company ? `chez ${exp.company}` : ''}</h3>
                <p>${exp.startDate || ''} - ${exp.endDate || 'Présent'} ${exp.location ? `| ${exp.location}` : ''}</p>
                <p>${exp.description || ''}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${cv.data?.educations?.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 18px; margin-bottom: 10px;">Formations</h2>
            ${cv.data.educations.map((edu: any) => `
              <div style="margin-bottom: 15px;">
                <h3 style="font-size: 16px; margin-bottom: 5px;">${edu.degree || ''} ${edu.institution ? `à ${edu.institution}` : ''}</h3>
                <p>${edu.startDate || ''} - ${edu.endDate || ''} ${edu.location ? `| ${edu.location}` : ''}</p>
                <p>${edu.description || ''}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${cv.data?.skills?.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 18px; margin-bottom: 10px;">Compétences</h2>
            <ul>
              ${cv.data.skills.map((skill: any) => `
                <li><strong>${skill.name}</strong> ${skill.level ? `(${skill.level}/5)` : ''}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        ${cv.data?.languages?.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 18px; margin-bottom: 10px;">Langues</h2>
            <ul>
              ${cv.data.languages.map((lang: any) => `
                <li><strong>${lang.name}</strong> ${lang.level ? `(${lang.level})` : ''}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        <div style="color: #cccccc; font-size: 8pt; margin-top: 40px; position: absolute; bottom: 20px; left: 20px;">
          CV Zen Masterpiece - ID: ${downloadId}
        </div>
      </div>
    `;

    // Convert to image using html2canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

    // Add watermark
    pdf.setFontSize(8);
    pdf.setTextColor(200, 200, 200);
    pdf.text(`CV Zen Masterpiece - ID: ${downloadId}`, 10, 290);

    pdf.save(`cv-${cv.id}.pdf`);
  } finally {
    // Clean up
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};
