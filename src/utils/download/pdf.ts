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
    // Photo soignée (layout horizontal, non compressée)
    const photoHtml = cv.data?.personalInfo?.profilePhoto ? `
      <div style="display: flex; align-items: flex-start; gap: 28px; margin-bottom: 20px;">
        <div style="border-radius: 50%; overflow: hidden; border: 1px solid #eee; width: 112px; height: 112px; flex-shrink: 0; background: #fff;">
          <img src="${cv.data.personalInfo.profilePhoto}" 
               alt="Profile Photo" 
               style="width: 112px; height: 112px; object-fit: cover; border-radius: 50%;" crossOrigin="anonymous" />
        </div>
        <div style="flex: 1;">
          ${cv.data.personalInfo.fullName ? `<h1 style="font-weight:bold;font-size:22px;margin:0 0 6px 0;color:${cv.theme?.primaryColor || '#0170c4'}">${cv.data.personalInfo.fullName}</h1>` : ''}
          ${cv.data.personalInfo.jobTitle ? `<span style="font-size:15px;display:block;margin-bottom:8px;"><b>${cv.data.personalInfo.jobTitle}</b></span>` : ''}
          <div>
          ${cv.data.personalInfo.nationality?.name ? `<p style="margin:0 0 2px 0;"><b>Nationalité:</b> ${cv.data.personalInfo.nationality.name}</p>` : ""}
          ${cv.data.personalInfo.address ? `<p style="margin:0 0 2px 0;"><b>Adresse:</b> ${cv.data.personalInfo.address}</p>` : ""}
          ${cv.data.personalInfo.phone ? `<p style="margin:0 0 2px 0;"><b>Téléphone:</b> ${cv.data.personalInfo.phone}</p>` : ""}
          ${cv.data.personalInfo.email ? `<p style="margin:0 0 2px 0;"><b>Email:</b> ${cv.data.personalInfo.email}</p>` : ""}
          </div>
        </div>
      </div>
    ` : '';

    // Contenu SANS titre principal ni date modif, titres majuscules
    container.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        ${photoHtml}
        ${cv.data?.summary ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 16px; margin-bottom: 10px; text-transform:uppercase;">Profil</h2>
            <p>${cv.data.summary}</p>
          </div>
        ` : ''}
        ${cv.data?.workExperiences?.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 16px; margin-bottom: 10px; text-transform:uppercase;">Expériences Professionnelles</h2>
            ${cv.data.workExperiences.map((exp: any) => `
              <div style="margin-bottom: 15px;">
                <h3 style="font-size: 14px; margin-bottom: 5px;">${exp.position || ''} ${exp.company ? `chez ${exp.company}` : ''}</h3>
                <p>${exp.startDate || ''} - ${exp.endDate || 'Présent'} ${exp.location ? `| ${exp.location}` : ''}</p>
                <p>${exp.description || ''}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${cv.data?.educations?.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 16px; margin-bottom: 10px; text-transform:uppercase;">Formations</h2>
            ${cv.data.educations.map((edu: any) => `
              <div style="margin-bottom: 15px;">
                <h3 style="font-size: 14px; margin-bottom: 5px;">${edu.degree || ''} ${edu.institution ? `à ${edu.institution}` : ''}</h3>
                <p>${edu.startDate || ''} - ${edu.endDate || ''} ${edu.location ? `| ${edu.location}` : ''}</p>
                <p>${edu.description || ''}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${cv.data?.skills?.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 16px; margin-bottom: 10px; text-transform:uppercase;">Compétences</h2>
            <ul>
              ${cv.data.skills.map((skill: any) => `
                <li><strong>${skill.name}</strong> ${skill.level ? `(${skill.level}/5)` : ''}</li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        ${cv.data?.languages?.length > 0 ? `
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 16px; margin-bottom: 10px; text-transform:uppercase;">Langues</h2>
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

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    });

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
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
};
