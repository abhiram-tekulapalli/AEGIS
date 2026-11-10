import { BaseAgent } from './contracts';
import { jobIntelligenceAgent } from './specialized/job-intelligence-agent';
import { candidateProfileAgent } from './specialized/candidate-profile-agent';
import { jobMatchingAgent } from './specialized/job-matching-agent';
import { resumeIntelligenceAgent } from './specialized/resume-intelligence-agent';
import { coverLetterAgent } from './specialized/cover-letter-agent';
import { applicationIntelligenceAgent } from './specialized/application-intelligence-agent';
import { screeningAnswerAgent } from './specialized/screening-answer-agent';
import { agentCoordinator } from './specialized/agent-coordinator';

export class AgentRegistry {
  private agents: Map<string, BaseAgent<any, any>> = new Map();

  constructor() {
    this.registerAgent(jobIntelligenceAgent);
    this.registerAgent(candidateProfileAgent);
    this.registerAgent(jobMatchingAgent);
    this.registerAgent(resumeIntelligenceAgent);
    this.registerAgent(coverLetterAgent);
    this.registerAgent(applicationIntelligenceAgent);
    this.registerAgent(screeningAnswerAgent);
    this.registerAgent(agentCoordinator);
  }

  public registerAgent(agent: BaseAgent<any, any>): void {
    this.agents.set(agent.id, agent);
  }

  public getAgent(id: string): BaseAgent<any, any> | undefined {
    return this.agents.get(id);
  }

  public listAgents(): Array<{ id: string; name: string; description: string; permittedTools: string[] }> {
    return Array.from(this.agents.values()).map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      permittedTools: agent.permittedTools,
    }));
  }
}

export const agentRegistry = new AgentRegistry();
