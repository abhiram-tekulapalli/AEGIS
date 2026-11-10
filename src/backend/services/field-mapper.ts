import { DetectedFormField, FormFillAction, CandidateProfile } from '@/shared/types';
import { db } from '../db/database';

/**
 * Field Mapper Service
 * Semantic & heuristic engine for matching page form fields to candidate profile properties.
 */

export class FieldMapper {
  public mapFields(fields: DetectedFormField[], profile: CandidateProfile): FormFillAction[] {
    const customRules = db.getFieldRules();

    return fields.map((field) => {
      const labelLower = (field.label || '').toLowerCase();
      const nameLower = (field.name || '').toLowerCase();
      const placeholderLower = (field.placeholder || '').toLowerCase();
      const ariaLower = (field.ariaLabel || '').toLowerCase();
      const combined = `${labelLower} ${nameLower} ${placeholderLower} ${ariaLower}`;

      let proposedValue = '';
      let confidence = 0.0;
      let reasoning = 'Unrecognized form field';
      let matchedKey = '';

      // Check custom rules first
      for (const [pattern, key] of Object.entries(customRules)) {
        if (combined.includes(pattern)) {
          matchedKey = key;
          confidence = 0.95;
          reasoning = `Matched saved rule pattern "${pattern}"`;
          break;
        }
      }

      // First Name
      if (!matchedKey && (combined.includes('first name') || combined.includes('given name') || nameLower === 'fname' || nameLower === 'first_name')) {
        proposedValue = profile.firstName;
        confidence = 0.98;
        reasoning = 'High confidence matching candidate first name';
      }
      // Last Name
      else if (!matchedKey && (combined.includes('last name') || combined.includes('surname') || nameLower === 'lname' || nameLower === 'last_name')) {
        proposedValue = profile.lastName;
        confidence = 0.98;
        reasoning = 'High confidence matching candidate last name';
      }
      // Full Name
      else if (!matchedKey && (combined.includes('full name') || combined.includes('your name') || nameLower === 'name')) {
        proposedValue = `${profile.firstName} ${profile.lastName}`.trim();
        confidence = 0.95;
        reasoning = 'Matched full candidate name';
      }
      // Email
      else if (!matchedKey && (field.type === 'email' || combined.includes('email') || combined.includes('e-mail'))) {
        proposedValue = profile.email;
        confidence = 0.99;
        reasoning = 'Matched candidate primary email address';
      }
      // Phone
      else if (!matchedKey && (field.type === 'tel' || combined.includes('phone') || combined.includes('mobile') || combined.includes('contact number'))) {
        proposedValue = profile.phone;
        confidence = 0.95;
        reasoning = 'Matched candidate contact telephone number';
      }
      // Location / Address / City
      else if (!matchedKey && (combined.includes('location') || combined.includes('city') || combined.includes('address') || combined.includes('residence'))) {
        proposedValue = profile.location;
        confidence = 0.90;
        reasoning = 'Matched candidate current city/location';
      }
      // LinkedIn
      else if (!matchedKey && (combined.includes('linkedin') || combined.includes('linked in'))) {
        proposedValue = profile.linkedIn;
        confidence = 0.96;
        reasoning = 'Matched candidate LinkedIn profile URL';
      }
      // GitHub
      else if (!matchedKey && (combined.includes('github') || combined.includes('git hub'))) {
        proposedValue = profile.github;
        confidence = 0.96;
        reasoning = 'Matched candidate GitHub profile URL';
      }
      // Portfolio / Website / Personal Site
      else if (!matchedKey && (combined.includes('portfolio') || combined.includes('website') || combined.includes('personal site') || combined.includes('url'))) {
        proposedValue = profile.portfolio || profile.website;
        confidence = 0.92;
        reasoning = 'Matched candidate portfolio or website link';
      }
      // Work Authorization / Sponsorship
      else if (!matchedKey && (combined.includes('authorized') || combined.includes('sponsorship') || combined.includes('work in the u.s') || combined.includes('visa'))) {
        if (combined.includes('sponsor') || combined.includes('require')) {
          proposedValue = profile.requiresSponsorship ? 'Yes' : 'No';
          confidence = 0.90;
          reasoning = 'Matched work sponsorship requirement question';
        } else {
          proposedValue = profile.workAuthorization;
          confidence = 0.88;
          reasoning = 'Matched work authorization status';
        }
      }
      // Desired Salary
      else if (!matchedKey && (combined.includes('salary') || combined.includes('compensation') || combined.includes('pay expectation'))) {
        proposedValue = profile.desiredSalary;
        confidence = 0.85;
        reasoning = 'Matched target salary expectation range';
      }
      // Headline / Position Title
      else if (!matchedKey && (combined.includes('headline') || combined.includes('title') || combined.includes('current role'))) {
        proposedValue = profile.headline;
        confidence = 0.88;
        reasoning = 'Matched professional headline / role';
      }
      // Cover Letter / Tell us about yourself / Custom
      else if (!matchedKey && (combined.includes('cover letter') || combined.includes('why company') || combined.includes('about yourself') || combined.includes('additional information') || field.type === 'textarea')) {
        if (combined.includes('why') && profile.customAnswers['why_company']) {
          proposedValue = profile.customAnswers['why_company'];
          confidence = 0.82;
          reasoning = 'Matched stored custom response for company interest';
        } else {
          proposedValue = profile.summary;
          confidence = 0.80;
          reasoning = 'Matched candidate professional summary for open text area';
        }
      }
      // Years of Experience
      else if (!matchedKey && (combined.includes('years of experience') || combined.includes('how many years'))) {
        proposedValue = String(profile.yearsOfExperience);
        confidence = 0.90;
        reasoning = 'Matched candidate years of total experience';
      }
      // If matchedKey was set from custom rule
      else if (matchedKey) {
        const val = (profile as unknown as Record<string, unknown>)[matchedKey];
        proposedValue = typeof val === 'string' ? val : String(val || '');
      }

      // Format select / radio dropdown option matching if field has options
      if (field.options && field.options.length > 0 && proposedValue) {
        const matchingOption = field.options.find((opt: string) => 
          opt.toLowerCase().includes(proposedValue.toLowerCase()) || 
          proposedValue.toLowerCase().includes(opt.toLowerCase())
        );
        if (matchingOption) {
          proposedValue = matchingOption;
        }
      }

      let riskClassification: FormFillAction['riskClassification'] = 'low';
      if (combined.includes('salary') || combined.includes('authorized') || combined.includes('sponsorship')) {
        riskClassification = 'high';
      }

      return {
        fieldId: field.id,
        selector: field.selector,
        fieldName: field.name,
        fieldLabel: field.label || field.name,
        fieldType: field.type,
        proposedValue: proposedValue || '',
        evidenceSource: matchedKey ? 'custom_rule' : 'profile_evidence',
        confidence: proposedValue ? confidence : 0.0,
        riskClassification,
        reasoning: proposedValue ? reasoning : 'No confident match found in profile. Please review manually.',
        requiresUserApproval: true, // ALWAYS MANDATORY REQUIREMENT!
        userApproved: false,
        status: 'pending',
      };
    });
  }
}

export const fieldMapper = new FieldMapper();
