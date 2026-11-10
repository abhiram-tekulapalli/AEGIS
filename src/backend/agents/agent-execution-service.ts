import { agentRegistry } from './agent-registry';
import { aiModelGateway } from '../ai-gateway/ai-model-gateway';
import { aiConfigService } from '../ai-gateway/ai-config-service';

export class AgentExecutionService {
  public async executeAgent<TInput, TOutput>(
    agentId: string,
    input: TInput,
    modelOverride?: string
  ): Promise<TOutput> {
    const agent = agentRegistry.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent with ID "${agentId}" is not registered.`);
    }

    console.log(`[AgentExecutionService] Executing agent "${agent.name}" (${agent.id})...`);
    return await agent.execute(input, modelOverride);
  }

  public getAgentMetadata() {
    return {
      registeredAgentsCount: agentRegistry.listAgents().length,
      agents: agentRegistry.listAgents(),
      providerInfo: aiConfigService.getProviderInfo(),
    };
  }
}

export const agentExecutionService = new AgentExecutionService();
