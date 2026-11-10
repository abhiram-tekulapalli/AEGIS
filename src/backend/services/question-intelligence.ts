import { ScreeningQuestionAnswer, CandidateProfile, RiskClassification } from '@/shared/types';
import { ScreeningQuestionAnswerSchema } from '@/shared/schemas';

/**
 * Application-Question Intelligence Service
 * Answers screening questions using candidate profile evidence while enforcing risk controls.
 */

export class QuestionIntelligence {
  public answerQuestions(
    questions: Array<{ id: string; text: string }>,
    profile: CandidateProfile
  ): ScreeningQuestionAnswer[] {
    return questions.map((q) => {
      const qLower = q.text.toLowerCase();

      let category: ScreeningQuestionAnswer['category'] = 'other';
      let proposedAnswer = '';
      let confidence = 0.8;
      let riskClassification: RiskClassification = 'low';
      let requiresUserConfirmation = true; // Always confirm screening questions!
      let evidenceSource = 'profile_evidence';

      // Classify question category & risk level
      if (qLower.includes('salary') || qLower.includes('compensation') || qLower.includes('pay expectation')) {
        category = 'sensitivity';
        riskClassification = 'high';
        proposedAnswer = profile.desiredSalary || '[Requires User Input: Specify Salary Range]';
        evidenceSource = profile.desiredSalary ? 'user_profile_preference' : 'unspecified';
      } else if (qLower.includes('sponsor') || qLower.includes('authorized') || qLower.includes('visa') || qLower.includes('citizenship')) {
        category = 'sensitivity';
        riskClassification = 'sensitive';
        if (qLower.includes('sponsor')) {
          proposedAnswer = profile.requiresSponsorship ? 'Yes, I require visa sponsorship.' : 'No, I do not require visa sponsorship.';
        } else {
          proposedAnswer = profile.workAuthorization;
        }
        evidenceSource = 'user_legal_profile';
      } else if (qLower.includes('relocat') || qLower.includes('notice period') || qLower.includes('start date') || qLower.includes('available')) {
        category = 'sensitivity';
        riskClassification = 'medium';
        proposedAnswer = `Notice period: ${profile.noticePeriod}. Open to relocation: ${profile.openToRelocation ? 'Yes' : 'No'}.`;
        evidenceSource = 'user_preference';
      } else if (qLower.includes('why') && (qLower.includes('company') || qLower.includes('role') || qLower.includes('interested'))) {
        category = 'motivation';
        proposedAnswer = profile.customAnswers['why_company'] || `I am deeply interested in your engineering mission and building high-performance scalable systems with my experience in ${profile.skills.slice(0, 3).join(', ')}.`;
      } else if (qLower.includes('experience') || qLower.includes('years')) {
        category = 'experience';
        proposedAnswer = `I have ${profile.yearsOfExperience} years of software engineering experience focusing on ${profile.skills.slice(0, 3).join(', ')}.`;
      } else if (qLower.includes('github') || qLower.includes('linkedin') || qLower.includes('portfolio') || qLower.includes('website')) {
        category = 'personal';
        proposedAnswer = qLower.includes('github') ? profile.github : qLower.includes('linkedin') ? profile.linkedIn : profile.portfolio || profile.website;
      } else {
        proposedAnswer = profile.summary || '[Requires User Input]';
      }

      return ScreeningQuestionAnswerSchema.parse({
        questionId: q.id,
        questionText: q.text,
        category,
        proposedAnswer,
        evidenceSource,
        confidence: proposedAnswer.includes('[Requires User Input]') ? 0.0 : confidence,
        riskClassification,
        requiresUserConfirmation,
        userApproved: false,
        status: 'pending',
      });
    });
  }
}

export const questionIntelligence = new QuestionIntelligence();
