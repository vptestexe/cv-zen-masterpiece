
export const downloadCvAsWord = (cv: any, downloadId: string) => {
  // Prépare la photo s'il y en a
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

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title></title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        h1 { color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 22px; margin-bottom: 5px; }
        h2 { color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 16px; margin-bottom: 10px; text-transform: uppercase; }
        h3 { font-size: 14px; margin-bottom: 5px; }
        .watermark { color: #cccccc; font-size: 8pt; margin-top: 40px; }
      </style>
    </head>
    <body>
      ${photoHtml}
      ${cv.data?.summary ? `
        <div style="margin-bottom: 20px;">
          <h2>Profil</h2>
          <p>${cv.data.summary}</p>
        </div>
      ` : ''}
      ${cv.data?.workExperiences?.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h2>Expériences Professionnelles</h2>
          ${cv.data.workExperiences.map((exp: any) => `
            <div style="margin-bottom: 15px;">
              <h3>${exp.position || ''} ${exp.company ? `chez ${exp.company}` : ''}</h3>
              <p>${exp.startDate || ''} - ${exp.endDate || 'Présent'} ${exp.location ? `| ${exp.location}` : ''}</p>
              <p>${exp.description || ''}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${cv.data?.educations?.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h2>Formations</h2>
          ${cv.data.educations.map((edu: any) => `
            <div style="margin-bottom: 15px;">
              <h3>${edu.degree || ''} ${edu.institution ? `à ${edu.institution}` : ''}</h3>
              <p>${edu.startDate || ''} - ${edu.endDate || ''} ${edu.location ? `| ${edu.location}` : ''}</p>
              <p>${edu.description || ''}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${cv.data?.skills?.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h2>Compétences</h2>
          <ul>
            ${cv.data.skills.map((skill: any) => `
              <li><strong>${skill.name}</strong> ${skill.level ? `(${skill.level}/5)` : ''}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      ${cv.data?.languages?.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h2>Langues</h2>
          <ul>
            ${cv.data.languages.map((lang: any) => `
              <li><strong>${lang.name}</strong> ${lang.level ? `(${lang.level})` : ''}</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      <div class="watermark">CV Zen Masterpiece - ID: ${downloadId}</div>
    </body>
    </html>
  `;

  // Create blob and trigger download
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-word' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `cv-${cv.id}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
