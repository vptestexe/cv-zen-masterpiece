
export const downloadCvAsWord = (cv: any, downloadId: string) => {
  // Prepare photo HTML if exists
  const photoHtml = cv.data?.personalInfo?.profilePhoto ? `
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${cv.data.personalInfo.profilePhoto}" 
           alt="Profile Photo" 
           style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;" crossOrigin="anonymous" />
    </div>
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${cv.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        h1 { color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 24px; margin-bottom: 5px; }
        h2 { color: ${cv.theme?.primaryColor || '#0170c4'}; font-size: 18px; margin-bottom: 10px; }
        h3 { font-size: 16px; margin-bottom: 5px; }
        .watermark { color: #cccccc; font-size: 8pt; margin-top: 40px; }
      </style>
    </head>
    <body>
      <h1>${cv.title}</h1>
      <p>Dernière modification: ${new Date(cv.lastUpdated).toLocaleDateString()}</p>
      ${photoHtml}
      ${cv.data?.personalInfo?.fullName ? `
        <div style="margin-bottom: 20px;">
          <h2>Informations personnelles</h2>
          <p><strong>Nom complet:</strong> ${cv.data.personalInfo.fullName}</p>
          ${cv.data.personalInfo.jobTitle ? `<p><strong>Poste:</strong> ${cv.data.personalInfo.jobTitle}</p>` : ''}
          ${cv.data.personalInfo.email ? `<p><strong>Email:</strong> ${cv.data.personalInfo.email}</p>` : ''}
          ${cv.data.personalInfo.phone ? `<p><strong>Téléphone:</strong> ${cv.data.personalInfo.phone}</p>` : ''}
          ${cv.data.personalInfo.address ? `<p><strong>Adresse:</strong> ${cv.data.personalInfo.address}</p>` : ''}
        </div>
      ` : ''}
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
