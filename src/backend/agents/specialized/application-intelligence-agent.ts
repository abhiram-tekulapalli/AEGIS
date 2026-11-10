import { BaseAgent } from '../contracts';
import { CandidateProfile, DetectedFormField, FormFillAction } from '@/shared/types';
import { formAutomationEngine } from '../../services/form-automation';

export interface ApplicationFormInput {
  fields: DetectedFormField[];
  profile: CandidateProfile;
  jobUrl: string;
}

export class ApplicationIntelligenceAgent implements BaseAgent<ApplicationFormInput, FormFillAction[]> {
  public readonly id = 'application-intelligence-agent';
  public readonly name = 'Application Intelligence Agent';
  public readonly description = 'Analyzes application form controls, maps candidate profile values, and classifies field sensitivity and security risks.';
  public readonly systemInstruction = `You are the Application Intelligence Agent for AEGIS. Map form fields to candidate facts while strictly excluding password, OTP, and CAPTCHA fields.`;
  public readonly permittedTools = ['map_form_fields', 'classify_field_risk'];

  public async execute(input: ApplicationFormInput): Promise<FormFillAction[]> {
    return formAutomationEngine.mapFormFields(input.fields, input.profile, input.jobUrl);
  }
}

export const applicationIntelligenceAgent = new ApplicationIntelligenceAgent();
