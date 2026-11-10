import * as pdfParseModule from 'pdf-parse';
const pdfParse = (pdfParseModule as any).default || pdfParseModule;
import mammoth from 'mammoth';
import { CandidateProfile, ResumeDocumentRecord, EvidenceSource } from '@/shared/types';
import { db } from '../db/database';

/**
 * Professional Profile Intelligence Service
 * Handles local PDF/DOCX/Text resume extraction, structured profile evidence building,
 * and user correction management.
 */

export class ProfileIntelligence {
  /**
   * Extract text locally from PDF, DOCX, or Plain Text buffer
   */
  public async parseResumeFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ResumeDocumentRecord> {
    const fileId = `res-${Date.now()}`;
    const fileSize = fileBuffer.length;
    let fileType: 'pdf' | 'docx' | 'txt' = 'txt';
    let extractedText = '';
    let status: ResumeDocumentRecord['extractionStatus'] = 'success';
    let warning: string | undefined;

    const lowerName = fileName.toLowerCase();

    try {
      if (mimeType.includes('pdf') || lowerName.endsWith('.pdf')) {
        fileType = 'pdf';
        try {
          const pdfData = await pdfParse(fileBuffer);
          extractedText = pdfData.text || '';
          
          if (!extractedText || extractedText.trim().length < 50) {
            status = 'scanned_unsupported';
            warning = 'The uploaded PDF appears to be an image/scanned document without selectable text layers. Optical Character Recognition (OCR) is recommended or provide plain-text/DOCX format.';
          }
        } catch (pdfErr: any) {
          status = 'failed';
          warning = `PDF parsing error: ${pdfErr.message}. Please upload a standard text PDF or DOCX file.`;
        }
      } else if (
        mimeType.includes('word') ||
        mimeType.includes('docx') ||
        lowerName.endsWith('.docx')
      ) {
        fileType = 'docx';
        try {
          const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
          extractedText = docxResult.value || '';
          if (docxResult.messages && docxResult.messages.length > 0) {
            warning = docxResult.messages.map(m => m.message).join('; ');
          }
        } catch (docxErr: any) {
          status = 'failed';
          warning = `DOCX parsing error: ${docxErr.message}`;
        }
      } else {
        // Plain text file
        fileType = 'txt';
        extractedText = fileBuffer.toString('utf-8');
      }

      // Record document in SQLite profile data
      const record: ResumeDocumentRecord = {
        id: fileId,
        fileName,
        fileType,
        fileSize,
        uploadedAt: new Date().toISOString(),
        extractedText: extractedText.trim(),
        extractionStatus: status,
        extractionWarning: warning,
      };

      // Add document record to candidate profile
      const currentProfile = db.getProfile();
      const updatedDocs = [record, ...(currentProfile.resumeDocuments || [])];
      
      // Auto-extract structured factual evidence if extraction succeeded
      let updatedProfile = { ...currentProfile, resumeDocuments: updatedDocs };

      if (status === 'success' && extractedText.length > 100) {
        updatedProfile = this.extractFactualEvidenceFromText(extractedText, updatedProfile);
      }

      db.updateProfile(updatedProfile);
      return record;
    } catch (err: any) {
      return {
        id: fileId,
        fileName,
        fileType,
        fileSize,
        uploadedAt: new Date().toISOString(),
        extractedText: '',
        extractionStatus: 'failed',
        extractionWarning: `File processing error: ${err.message}`,
      };
    }
  }

  /**
   * Extract factual skills, links, contact info, and education from text
   */
  private extractFactualEvidenceFromText(text: string, currentProfile: CandidateProfile): CandidateProfile {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // Extract email regex
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : currentProfile.email;

    // Extract phone regex
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : currentProfile.phone;

    // Extract social links
    const linkedinMatch = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const githubMatch = text.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);

    // Extract skills keywords
    const commonTechSkills = [
      'TypeScript', 'JavaScript', 'React', 'Node.js', 'Express', 'Python', 'Java', 'C++', 
      'Go', 'Rust', 'SQL', 'PostgreSQL', 'SQLite', 'MongoDB', 'GraphQL', 'REST API', 
      'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Git', 'Vite', 'TailwindCSS', 
      'Next.js', 'Ollama', 'Llama', 'Zod', 'PyTorch', 'TensorFlow'
    ];

    const detectedSkills = new Set<string>(currentProfile.skills);
    commonTechSkills.forEach(tech => {
      if (text.toLowerCase().includes(tech.toLowerCase())) {
        detectedSkills.add(tech);
      }
    });

    return {
      ...currentProfile,
      email: email || currentProfile.email,
      phone: phone || currentProfile.phone,
      linkedIn: linkedinMatch ? linkedinMatch[0] : currentProfile.linkedIn,
      github: githubMatch ? githubMatch[0] : currentProfile.github,
      skills: Array.from(detectedSkills),
      summary: currentProfile.summary || lines.slice(0, 3).join(' '),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const profileIntelligence = new ProfileIntelligence();
