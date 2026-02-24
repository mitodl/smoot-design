/**
 * Translation keys used by the AI drawer/chat UI.
 * Learning MFE (and other hosts) can pass a Record of these keys to init()
 * for locale-specific strings. Missing keys fall back to DEFAULT_TRANSLATIONS.
 */
export const TRANSLATION_KEYS = {
  feedbackGood: "feedbackGood",
  feedbackBad: "feedbackBad",
  assignmentsLabel: "assignmentsLabel",
  selectAssignment: "selectAssignment",
  srYouSaid: "srYouSaid",
  srAssistantSaid: "srAssistantSaid",
  noAssignmentsMessage: "noAssignmentsMessage",
  errorGeneric: "errorGeneric",
  askQuestion: "askQuestion",
  stop: "stop",
  send: "send",
  disclaimer: "disclaimer",
  videoEntryScreenTitle: "videoEntryScreenTitle",
  tabLabelChat: "tabLabelChat",
  tabLabelFlashcards: "tabLabelFlashcards",
  tabLabelSummary: "tabLabelSummary",
  ariaClose: "ariaClose",
  flashcardQuestion: "flashcardQuestion",
  flashcardAnswer: "flashcardAnswer",
  flashcardCount: "flashcardCount",
  flashcardPrevious: "flashcardPrevious",
  flashcardNext: "flashcardNext",
  problemInitialMessage: "problemInitialMessage",
  videoStarterConcepts: "videoStarterConcepts",
  videoStarterExamples: "videoStarterExamples",
  videoStarterKeyTerms: "videoStarterKeyTerms",
} as const

export type TranslationKey =
  (typeof TRANSLATION_KEYS)[keyof typeof TRANSLATION_KEYS]

export const DEFAULT_TRANSLATIONS: Record<TranslationKey, string> = {
  [TRANSLATION_KEYS.feedbackGood]: "Good response",
  [TRANSLATION_KEYS.feedbackBad]: "Bad response",
  [TRANSLATION_KEYS.assignmentsLabel]: "Assignments",
  [TRANSLATION_KEYS.selectAssignment]: "Select an assignment",
  [TRANSLATION_KEYS.srYouSaid]: "You said: ",
  [TRANSLATION_KEYS.srAssistantSaid]: "Assistant said: ",
  [TRANSLATION_KEYS.noAssignmentsMessage]:
    "Hi! It looks like there are no assignments available right now. I'm here to help when there is an assignment ready to start.",
  [TRANSLATION_KEYS.errorGeneric]: "An unexpected error has occurred.",
  [TRANSLATION_KEYS.askQuestion]: "Ask a question",
  [TRANSLATION_KEYS.stop]: "Stop",
  [TRANSLATION_KEYS.send]: "Send",
  [TRANSLATION_KEYS.disclaimer]: "AI-generated content may be incorrect.",
  [TRANSLATION_KEYS.videoEntryScreenTitle]:
    "What do you want to know about this video?",
  [TRANSLATION_KEYS.tabLabelChat]: "Chat",
  [TRANSLATION_KEYS.tabLabelFlashcards]: "Flashcards",
  [TRANSLATION_KEYS.tabLabelSummary]: "Summary",
  [TRANSLATION_KEYS.ariaClose]: "Close",
  [TRANSLATION_KEYS.flashcardQuestion]: "Q: ",
  [TRANSLATION_KEYS.flashcardAnswer]: "Answer: ",
  [TRANSLATION_KEYS.flashcardCount]: "Flashcard {index} of {total}",
  [TRANSLATION_KEYS.flashcardPrevious]: "Previous card",
  [TRANSLATION_KEYS.flashcardNext]: "Next card",
  [TRANSLATION_KEYS.problemInitialMessage]:
    "Let's try to work on this problem together. It would be great to hear how you're thinking about solving it. Can you walk me through the approach you're considering?",
  [TRANSLATION_KEYS.videoStarterConcepts]:
    "What are the most important concepts introduced in the video?",
  [TRANSLATION_KEYS.videoStarterExamples]:
    "What examples are used to illustrate concepts covered in the video?",
  [TRANSLATION_KEYS.videoStarterKeyTerms]:
    "What are the key terms introduced in this video?",
}
