export interface BaseAgent<TInput, TOutput> {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  permittedTools: string[];
  execute(input: TInput, modelOverride?: string): Promise<TOutput>;
}
