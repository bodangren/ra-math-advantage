export { withRetry, isRetryableStatus, EmptyResponseError, type RetryOptions } from "./retry";

export {
  createOpenRouterProvider,
  createOpenRouterProviderWithMessages,
  resolveOpenRouterProviderFromEnv,
  resolveOpenRouterProviderWithMessagesFromEnv,
  clearProviderCache,
  isOpenRouterError,
  getErrorStatus,
  type OpenRouterProviderOptions,
  type ChatMessage,
} from "./providers";

export { AI_ROLES, resolveRoleModel, buildProviderPreferences, type AiRole } from "./roles";

export { assembleLessonChatbotContext, type LessonChatbotContext } from "./lesson-context";

export {
  resolveStructuredProviderFromEnv,
  type StructuredProvider,
  type StructuredRequest,
  type StructuredResult,
  type StructuredFailureReason,
  type ChatMessage as StructuredChatMessage,
} from "./structured";

export {
  detectPromptInjection,
  isInjectionAttempt,
  normalizeInput,
  type InjectionDetection,
} from "./prompt-guard";
