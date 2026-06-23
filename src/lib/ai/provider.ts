/** AI provider abstraction. The local stub ships now; a live Claude provider
 *  (via the user's own key) drops in behind this interface in Phase 19. */
export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ProjectSnapshot {
  name: string;
  status: string;
  contractValue: number;
  billed: number;
  collected: number;
  outstanding: number;
  progress: number;
}

export interface AssistantContext {
  orgName: string;
  activeCount: number;
  overdueAmount: number;
  collected: number;
  projects: ProjectSnapshot[];
}

export interface AIProvider {
  readonly name: string;
  readonly live: boolean;
  complete(messages: ChatMessage[], ctx: AssistantContext): Promise<string>;
}
