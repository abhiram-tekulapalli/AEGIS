import { CandidateProfile } from '@/shared/types';

/**
 * Profile Readiness Analyzer Service
 * Assesses candidate profile completeness, checks contact fields, social links,
 * work history items, and custom question answers.
 */

export interface ProfileReadiness {
  score: number; // 0 - 100
  isReadyForAutoFill: boolean;
  missingRequiredFields: string[];
  missingRecommendedFields: string[];
  completionBreakdown: {
    personalInfo: number;
    linksAndSocial: number;
    experienceAndSkills: number;
    customAnswers: number;
  };
  recommendations: string[];
}

export class ProfileAnalyzer {
  public analyzeReadiness(profile: CandidateProfile): ProfileReadiness {
    const missingRequired: string[] = [];
    const missingRecommended: string[] = [];

    // Check personal info
    if (!profile.firstName) missingRequired.push('First Name');
    if (!profile.lastName) missingRequired.push('Last Name');
    if (!profile.email) missingRequired.push('Email');
    if (!profile.phone) missingRequired.push('Phone Number');
    if (!profile.location) missingRecommended.push('Location / City');

    // Check links
    if (!profile.linkedIn) missingRecommended.push('LinkedIn URL');
    if (!profile.github && !profile.portfolio) missingRecommended.push('GitHub / Portfolio URL');

    // Check skills & experience
    if (!profile.skills || profile.skills.length === 0) missingRequired.push('Skills List');
    if (!profile.workHistory || profile.workHistory.length === 0) missingRequired.push('Work History');
    if (!profile.summary) missingRecommended.push('Professional Summary');

    // Calculate score breakdown
    const personalScore = [profile.firstName, profile.lastName, profile.email, profile.phone, profile.location]
      .filter(Boolean).length / 5 * 100;

    const linksScore = [profile.linkedIn, profile.github, profile.portfolio, profile.website]
      .filter(Boolean).length / 4 * 100;

    const expScore = (
      (profile.skills.length > 3 ? 40 : profile.skills.length * 10) +
      (profile.workHistory.length > 0 ? 40 : 0) +
      (profile.summary ? 20 : 0)
    );

    const customCount = Object.keys(profile.customAnswers || {}).length;
    const customScore = Math.min(100, customCount * 33.3);

    const overallScore = Math.round(
      (personalScore * 0.35) +
      (linksScore * 0.20) +
      (expScore * 0.35) +
      (customScore * 0.10)
    );

    const recommendations: string[] = [];
    if (missingRequired.length > 0) {
      recommendations.push(`Add ${missingRequired.join(', ')} to enable 1-click form auto-fill.`);
    }
    if (missingRecommended.length > 0) {
      recommendations.push(`Include ${missingRecommended.slice(0, 2).join(' and ')} for better application response rates.`);
    }
    if (profile.skills.length < 5) {
      recommendations.push('List at least 5 key technical skills in your profile.');
    }

    return {
      score: overallScore,
      isReadyForAutoFill: missingRequired.length === 0,
      missingRequiredFields: missingRequired,
      missingRecommendedFields: missingRecommended,
      completionBreakdown: {
        personalInfo: Math.round(personalScore),
        linksAndSocial: Math.round(linksScore),
        experienceAndSkills: Math.round(expScore),
        customAnswers: Math.round(customScore),
      },
      recommendations,
    };
  }
}

export const profileAnalyzer = new ProfileAnalyzer();
