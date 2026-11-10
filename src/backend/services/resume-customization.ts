import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { CandidateProfile, JobPosting, TailoredResume } from '@/shared/types';
import { TailoredResumeSchema } from '@/shared/schemas';
import { ollamaProvider } from '../providers/ollama-provider';
import { db } from '../db/database';

/**
 * Resume Customization Engine & DOCX Generator
 * Tailors candidate profile highlights for target job and builds downloadable DOCX files.
 */

export class ResumeCustomization {
  public async generateTailoredResume(
    job: JobPosting,
    profile: CandidateProfile,
    modelOverride?: string
  ): Promise<TailoredResume> {
    const systemPrompt = `You are an expert technical resume writer. Tailor the candidate's verified experience for the target job while maintaining 100% factual accuracy. NEVER invent employment, dates, or degrees.`;

    const userPrompt = `
TARGET JOB:
Title: ${job.title}
Company: ${job.company}
Required Skills: ${job.requiredSkills.join(', ')}
Description: ${job.description}

CANDIDATE FACTUAL EVIDENCE:
Summary: ${profile.summary}
Skills: ${profile.skills.join(', ')}
Work History: ${JSON.stringify(profile.workHistory)}
Projects: ${JSON.stringify(profile.projects)}

Generate JSON with:
- id: "tailored-${Date.now()}"
- jobId: "${job.id}"
- jobTitle: "${job.title}"
- company: "${job.company}"
- summary: "Tailored ATS-optimized executive summary focusing on relevant experience"
- highlightedSkills: array of top matching skills
- tailoredExperienceHighlights: array of company, role, tailoredBullets, originalBullets
- tailoredProjects: array of title, tailoredDescription
- coverLetterText: "Custom 3-paragraph cover letter addressing hiring team at ${job.company}"
`;

    const fallbackGenerator = (): TailoredResume => {
      const topSkills = profile.skills.slice(0, 8);

      const tailoredBullets = profile.workHistory.map(wh => ({
        company: wh.company,
        role: wh.role,
        tailoredBullets: wh.highlights.map(h => 
          `${h} (Demonstrates key execution aligned with ${job.company}'s engineering standards).`
        ),
        originalBullets: wh.highlights,
      }));

      const tailoredProjects = profile.projects.map(p => ({
        title: p.title,
        tailoredDescription: `${p.description} Developed using ${p.technologies.join(', ')}, demonstrating hands-on experience relevant to ${job.title}.`,
      }));

      const coverLetterText = `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} position. Having reviewed your engineering roadmap and focus on ${job.requiredSkills.slice(0, 3).join(', ')}, I am confident that my background in full-stack engineering and agent architectures aligns directly with your team's objectives.

In my recent work at ${profile.workHistory[0]?.company || 'Apex Tech'}, I led technical initiatives that improved system uptime, reduced build latencies, and streamlined user workflows. My experience with ${topSkills.slice(0, 3).join(', ')} enables me to contribute immediately to ${job.company}.

I look forward to discussing how my experience can support your team's goals.

Sincerely,
${profile.firstName} ${profile.lastName}
${profile.email} | ${profile.phone} | ${profile.linkedIn}`;

      return {
        id: `tailored-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        summary: `${profile.headline} with ${profile.yearsOfExperience}+ years of experience. Tailored for ${job.title} at ${job.company}, focusing on ${topSkills.slice(0, 4).join(', ')}.`,
        highlightedSkills: topSkills,
        tailoredExperienceHighlights: tailoredBullets,
        tailoredProjects,
        coverLetterText,
        generatedAt: new Date().toISOString(),
      };
    };

    const raw = await ollamaProvider.generateStructuredJSON<TailoredResume>(
      userPrompt,
      systemPrompt,
      fallbackGenerator,
      modelOverride
    );

    let tailored: TailoredResume;
    try {
      tailored = TailoredResumeSchema.parse({
        ...raw,
        id: raw.id || `tailored-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        generatedAt: new Date().toISOString(),
      });
    } catch {
      tailored = fallbackGenerator();
    }

    db.saveResume(tailored);
    return tailored;
  }

  /**
   * Build a clean, formatted DOCX file buffer for the tailored resume
   */
  public async createResumeDocxBuffer(tailored: TailoredResume, profile: CandidateProfile): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header Name
            new Paragraph({
              text: `${profile.firstName} ${profile.lastName}`,
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `${profile.email}  |  ${profile.phone}  |  ${profile.location}`, size: 20 }),
              ],
            }),
            new Paragraph({ text: '' }), // Spacer

            // Professional Summary
            new Paragraph({ text: 'PROFESSIONAL SUMMARY', heading: HeadingLevel.HEADING_2 }),
            new Paragraph({
              children: [new TextRun({ text: tailored.summary, size: 22 })],
            }),
            new Paragraph({ text: '' }),

            // Technical Skills
            new Paragraph({ text: 'TECHNICAL SKILLS', heading: HeadingLevel.HEADING_2 }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Key Competencies: ', bold: true }),
                new TextRun({ text: tailored.highlightedSkills.join(', ') }),
              ],
            }),
            new Paragraph({ text: '' }),

            // Experience
            new Paragraph({ text: 'WORK EXPERIENCE', heading: HeadingLevel.HEADING_2 }),
            ...tailored.tailoredExperienceHighlights.flatMap(exp => [
              new Paragraph({
                children: [
                  new TextRun({ text: `${exp.role} `, bold: true }),
                  new TextRun({ text: `— ${exp.company}`, italics: true }),
                ],
              }),
              ...exp.tailoredBullets.map(bullet => 
                new Paragraph({
                  text: `• ${bullet}`,
                  indent: { left: 360 },
                })
              ),
              new Paragraph({ text: '' }),
            ]),

            // Education
            new Paragraph({ text: 'EDUCATION', heading: HeadingLevel.HEADING_2 }),
            ...profile.education.map(edu => 
              new Paragraph({
                text: `${edu.degree} in ${edu.fieldOfStudy} — ${edu.institution} (${edu.graduationYear})`,
              })
            ),
          ],
        },
      ],
    });

    return await Packer.toBuffer(doc);
  }
}

export const resumeCustomization = new ResumeCustomization();
