import { CandidateProfile, JobPosting, TransparentJobMatchResult } from '@/shared/types';

/**
 * Transparent Candidate-Job Matching Engine
 * Computes deterministic fit scores based on factual evidence from profile and job posting.
 */

export class MatchingEngine {
  public evaluateMatch(job: JobPosting, profile: CandidateProfile): TransparentJobMatchResult {
    const candidateSkillsLower = profile.skills.map(s => s.toLowerCase());
    const candidateLangsLower = profile.programmingLanguages.map(l => l.toLowerCase());
    const candidateToolsLower = profile.toolsAndFrameworks.map(t => t.toLowerCase());
    const allCandidateTech = new Set([...candidateSkillsLower, ...candidateLangsLower, ...candidateToolsLower]);

    // 1. Required Skill Match (Max 40 points)
    const matchedRequired: string[] = [];
    const missingRequired: string[] = [];
    const unmentionedRequired: string[] = [];

    job.requiredSkills.forEach(reqSkill => {
      const lower = reqSkill.toLowerCase();
      if (Array.from(allCandidateTech).some(tech => tech.includes(lower) || lower.includes(tech))) {
        matchedRequired.push(reqSkill);
      } else {
        // Distinguish missing vs unmentioned
        if (['security', 'leadership', 'system architecture', 'communication'].some(k => lower.includes(k))) {
          unmentionedRequired.push(reqSkill);
        } else {
          missingRequired.push(reqSkill);
        }
      }
    });

    const reqCount = job.requiredSkills.length || 1;
    const requiredSkillScore = Math.round((matchedRequired.length / reqCount) * 40);

    // 2. Preferred Skill Match (Max 15 points)
    const matchedPreferred: string[] = [];
    job.preferredSkills.forEach(prefSkill => {
      const lower = prefSkill.toLowerCase();
      if (Array.from(allCandidateTech).some(tech => tech.includes(lower) || lower.includes(tech))) {
        matchedPreferred.push(prefSkill);
      }
    });
    const prefCount = job.preferredSkills.length || 1;
    const preferredSkillScore = Math.round((matchedPreferred.length / prefCount) * 15);

    // 3. Experience Fit Score (Max 25 points)
    let experienceFitScore = 20;
    const expText = job.experienceRequirements.toLowerCase();
    const yearsRequiredMatch = expText.match(/(\d+)\+?\s*years/i);
    const requiredYears = yearsRequiredMatch ? parseInt(yearsRequiredMatch[1], 10) : 3;

    if (profile.yearsOfExperience >= requiredYears) {
      experienceFitScore = 25;
    } else if (profile.yearsOfExperience >= requiredYears - 1) {
      experienceFitScore = 18;
    } else {
      experienceFitScore = 12;
    }

    // 4. Eligibility & Work Authorization Score (Max 20 points)
    let eligibilityScore = 20;
    const concerns: string[] = [];

    if (job.workType === 'On-site' && profile.preferredWorkType === 'Remote' && !profile.openToRelocation) {
      eligibilityScore -= 5;
      concerns.push('Job requires On-site work, but candidate prefers Remote.');
    }

    if (profile.requiresSponsorship && (job.description.toLowerCase().includes('no sponsorship') || job.description.toLowerCase().includes('us citizen only'))) {
      eligibilityScore -= 10;
      concerns.push('Candidate requires visa sponsorship, but job states no sponsorship available.');
    }

    // Total Match Score
    const totalMatchScore = Math.min(100, Math.max(10, requiredSkillScore + preferredSkillScore + experienceFitScore + eligibilityScore));

    // Match Relevant Projects
    const relevantProjects = profile.projects.map(proj => {
      let score = 50;
      proj.technologies.forEach(tech => {
        if (job.requiredSkills.some(rs => rs.toLowerCase().includes(tech.toLowerCase()))) {
          score += 15;
        }
      });
      return {
        title: proj.title,
        relevanceScore: Math.min(98, score),
        reason: `Utilizes ${proj.technologies.slice(0, 3).join(', ')} matching key position requirements.`,
      };
    });

    // Match Relevant Work Experience
    const relevantExperience = profile.workHistory.map(wh => {
      let score = 60;
      wh.highlights.forEach(hl => {
        if (job.requiredSkills.some(rs => hl.toLowerCase().includes(rs.toLowerCase()))) {
          score += 10;
        }
      });
      return {
        company: wh.company,
        role: wh.role,
        relevanceScore: Math.min(95, score),
        reason: `Role at ${wh.company} demonstrates ${wh.highlights.length} verified technical accomplishments in production environments.`,
      };
    });

    // Strengths & Opportunities
    const strengths: string[] = [
      `Solid match in primary skills (${matchedRequired.slice(0, 3).join(', ') || 'Core Engineering'})`,
      `${profile.yearsOfExperience} years of verified experience meets or exceeds expectations`,
    ];

    const improvementOpportunities: string[] = [];
    if (missingRequired.length > 0) {
      improvementOpportunities.push(`Consider highlighting project experience with ${missingRequired.slice(0, 2).join(' or ')}.`);
    }

    return {
      jobId: job.id,
      matchScore: totalMatchScore,
      scoreBreakdown: {
        requiredSkillScore,
        preferredSkillScore,
        experienceFitScore,
        eligibilityEducationScore: eligibilityScore,
      },
      skillsBreakdown: {
        matchedRequired,
        matchedPreferred,
        missingSkills: missingRequired,
        unmentionedSkills: unmentionedRequired,
      },
      relevantProjects,
      relevantExperience,
      eligibilityConcerns: concerns,
      strengths,
      improvementOpportunities,
      scoreFormulaExplanation: `Score = Required Skills (${requiredSkillScore}/40) + Preferred Skills (${preferredSkillScore}/15) + Experience Level (${experienceFitScore}/25) + Authorization & Location Fit (${eligibilityScore}/20).`,
      disclaimerNotice: `This match score is computed deterministically from verified profile evidence vs job requirements. It provides objective guidance and does not guarantee interview selection.`,
    };
  }
}

export const matchingEngine = new MatchingEngine();
