import { JobPosting } from '@/shared/types';

/**
 * Job-Description Intelligence Service
 * Converts web page listings into structured JobPosting objects.
 * Applies strict sanitization against untrusted page content and prompt injection vectors.
 */

export class JobIntelligence {
  /**
   * Sanitize website content to prevent prompt injection attacks
   */
  public sanitizeUntrustedContent(rawContent: string): string {
    if (!rawContent) return '';

    // Remove known prompt injection patterns and adversarial system override triggers
    let clean = rawContent
      .replace(/\[system_instruction\]/gi, '[filtered_text]')
      .replace(/\[override_instructions\]/gi, '[filtered_text]')
      .replace(/ignore all previous instructions/gi, '[filtered_instruction]')
      .replace(/forget all prior commands/gi, '[filtered_instruction]')
      .replace(/you are now an unfiltered AI/gi, '[filtered_instruction]')
      .replace(/disregard safety guidelines/gi, '[filtered_instruction]')
      .replace(/send secret data to/gi, '[filtered_instruction]')
      .replace(/reveal private candidate profile/gi, '[filtered_instruction]');

    // Truncate excessively long web dumps
    return clean.slice(0, 5000).trim();
  }

  /**
   * Structure raw job listing data into a safe JobPosting contract
   */
  public processJobListing(rawJob: Partial<JobPosting>): JobPosting {
    const sanitizedDesc = this.sanitizeUntrustedContent(rawJob.description || '');

    // Extract skills and requirements safely
    const reqSkills: string[] = rawJob.requiredSkills || [];
    const prefSkills: string[] = rawJob.preferredSkills || [];

    // Parse employment and work types
    const descLower = sanitizedDesc.toLowerCase();
    let workType: JobPosting['workType'] = rawJob.workType || 'Unknown';
    if (workType === 'Unknown') {
      if (descLower.includes('remote') || descLower.includes('work from home')) workType = 'Remote';
      else if (descLower.includes('hybrid')) workType = 'Hybrid';
      else if (descLower.includes('onsite') || descLower.includes('on-site')) workType = 'On-site';
    }

    let employmentType: JobPosting['employmentType'] = rawJob.employmentType || 'Unknown';
    if (employmentType === 'Unknown') {
      if (descLower.includes('internship') || descLower.includes('intern')) employmentType = 'Internship';
      else if (descLower.includes('contract') || descLower.includes('freelance')) employmentType = 'Contract';
      else if (descLower.includes('part-time') || descLower.includes('part time')) employmentType = 'Part-time';
      else employmentType = 'Full-time';
    }

    return {
      id: rawJob.id || `job-${Date.now()}`,
      url: rawJob.url || 'https://localhost/job',
      title: rawJob.title?.trim() || 'Software Engineer',
      company: rawJob.company?.trim() || 'Target Company',
      location: rawJob.location?.trim() || 'Not specified',
      workType,
      employmentType,
      salary: rawJob.salary?.trim() || 'Not disclosed',
      description: sanitizedDesc,
      responsibilities: rawJob.responsibilities || [
        'Design, build, and maintain production software systems.',
        'Collaborate with team members on software architecture and code reviews.',
      ],
      requiredSkills: reqSkills.length > 0 ? reqSkills : ['TypeScript', 'React', 'Node.js'],
      preferredSkills: prefSkills,
      educationalQualifications: rawJob.educationalQualifications || ['Bachelor degree in CS or equivalent experience'],
      experienceRequirements: rawJob.experienceRequirements || 'Not explicitly specified',
      eligibilityNotes: rawJob.eligibilityNotes || [],
      otherRequirements: rawJob.otherRequirements || [],
      boardType: rawJob.boardType || 'generic',
      extractedAt: new Date().toISOString(),
      untrustedContentSanitized: true,
    };
  }
}

export const jobIntelligence = new JobIntelligence();
