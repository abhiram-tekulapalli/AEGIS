import { DetectedFormField, FormFillAction, CandidateProfile, RiskClassification } from '@/shared/types';

/**
 * Form Automation & Platform Adapter Infrastructure
 */

export interface FormAdapter {
  platformName: 'greenhouse' | 'lever' | 'workday' | 'generic';
  canHandleUrl(url: string): boolean;
  mapFieldToAction(field: DetectedFormField, profile: CandidateProfile): FormFillAction;
}

export class GenericFormAdapter implements FormAdapter {
  public platformName: 'greenhouse' | 'lever' | 'workday' | 'generic' = 'generic';

  public canHandleUrl(url: string): boolean {
    return true; // Fallback adapter for all web forms
  }

  public mapFieldToAction(field: DetectedFormField, profile: CandidateProfile): FormFillAction {
    const labelLower = (field.label || '').toLowerCase();
    const nameLower = (field.name || '').toLowerCase();
    const combined = `${labelLower} ${nameLower} ${field.placeholder}`.toLowerCase();

    let proposedValue = '';
    let confidence = 0.85;
    let riskClassification: RiskClassification = 'low';
    let reasoning = 'Matched generic field pattern';
    let evidenceSource = 'candidate_profile';

    if (field.isPasswordOrCaptcha || combined.includes('password') || combined.includes('captcha') || combined.includes('otp')) {
      return {
        fieldId: field.id,
        selector: field.selector,
        fieldName: field.name,
        fieldLabel: field.label,
        fieldType: field.type,
        proposedValue: '',
        evidenceSource: 'security_policy',
        confidence: 0,
        riskClassification: 'high',
        reasoning: 'Security Policy: Password, OTP, and CAPTCHA fields are strictly excluded from automated filling.',
        requiresUserApproval: true,
        userApproved: false,
        status: 'rejected',
      };
    }

    // Name & Contact
    if (combined.includes('first name') || nameLower === 'fname' || nameLower === 'first_name') {
      proposedValue = profile.firstName;
      reasoning = 'Matched candidate first name';
    } else if (combined.includes('last name') || nameLower === 'lname' || nameLower === 'last_name') {
      proposedValue = profile.lastName;
      reasoning = 'Matched candidate last name';
    } else if (combined.includes('email') || field.type === 'email') {
      proposedValue = profile.email;
      reasoning = 'Matched candidate primary email';
    } else if (combined.includes('phone') || field.type === 'tel') {
      proposedValue = profile.phone;
      reasoning = 'Matched candidate contact telephone number';
    } else if (combined.includes('linkedin')) {
      proposedValue = profile.linkedIn;
      reasoning = 'Matched candidate LinkedIn URL';
    } else if (combined.includes('github')) {
      proposedValue = profile.github;
      reasoning = 'Matched candidate GitHub URL';
    } else if (combined.includes('portfolio') || combined.includes('website')) {
      proposedValue = profile.portfolio || profile.website;
      reasoning = 'Matched candidate portfolio website';
    } else if (combined.includes('salary')) {
      proposedValue = profile.desiredSalary;
      riskClassification = 'high';
      reasoning = 'High risk: Target salary expectation field';
      evidenceSource = 'user_preference';
    } else if (combined.includes('sponsorship') || combined.includes('authorized')) {
      proposedValue = profile.workAuthorization;
      riskClassification = 'sensitive';
      reasoning = 'Sensitive: Work authorization / sponsorship field';
      evidenceSource = 'legal_profile';
    } else {
      proposedValue = profile.summary;
      reasoning = 'Matched default summary response';
    }

    return {
      fieldId: field.id,
      selector: field.selector,
      fieldName: field.name,
      fieldLabel: field.label,
      fieldType: field.type,
      proposedValue,
      evidenceSource,
      confidence: proposedValue ? confidence : 0.0,
      riskClassification,
      reasoning,
      requiresUserApproval: true, // MANDATORY SAFETY GUARANTEE
      userApproved: false,
      status: 'pending',
    };
  }
}

export class GreenhouseAdapter extends GenericFormAdapter {
  public override platformName: 'greenhouse' | 'lever' | 'workday' | 'generic' = 'greenhouse';

  public override canHandleUrl(url: string): boolean {
    return url.includes('greenhouse.io');
  }
}

export class LeverAdapter extends GenericFormAdapter {
  public override platformName: 'greenhouse' | 'lever' | 'workday' | 'generic' = 'lever';

  public override canHandleUrl(url: string): boolean {
    return url.includes('lever.co');
  }
}

export class FormAutomationEngine {
  private adapters: FormAdapter[] = [
    new GreenhouseAdapter(),
    new LeverAdapter(),
    new GenericFormAdapter(),
  ];

  public getAdapterForUrl(url: string): FormAdapter {
    return this.adapters.find(a => a.canHandleUrl(url)) || new GenericFormAdapter();
  }

  public mapFormFields(fields: DetectedFormField[], profile: CandidateProfile, url: string): FormFillAction[] {
    const adapter = this.getAdapterForUrl(url);
    return fields.map(f => adapter.mapFieldToAction(f, profile));
  }
}

export const formAutomationEngine = new FormAutomationEngine();
