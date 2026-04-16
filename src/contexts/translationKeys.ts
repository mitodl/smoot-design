/**
 * Translation keys used by the AI drawer/chat UI.
 * Keys are namespaced by area (aiDrawer, aiChat, flashcards, entryScreen).
 * Learning MFE (and other hosts) can pass a Record of these keys to init()
 * for locale-specific strings. Missing keys fall back to DEFAULT_TRANSLATIONS.
 */
export const TRANSLATION_KEYS = {
  aiDrawer: {
    ariaClose: "aiDrawer.ariaClose",
    tabLabelChat: "aiDrawer.tabLabelChat",
    tabLabelFlashcards: "aiDrawer.tabLabelFlashcards",
    tabLabelSummary: "aiDrawer.tabLabelSummary",
    videoEntryScreenTitle: "aiDrawer.videoEntryScreenTitle",
  },
  aiChat: {
    feedbackGood: "aiChat.feedbackGood",
    feedbackBad: "aiChat.feedbackBad",
    assignmentsLabel: "aiChat.assignmentsLabel",
    selectAssignment: "aiChat.selectAssignment",
    srYouSaid: "aiChat.srYouSaid",
    srAssistantSaid: "aiChat.srAssistantSaid",
    noAssignmentsMessage: "aiChat.noAssignmentsMessage",
    errorGeneric: "aiChat.errorGeneric",
    errorHiddenResponse: "aiChat.errorHiddenResponse",
    askQuestion: "aiChat.askQuestion",
    stop: "aiChat.stop",
    send: "aiChat.send",
    disclaimer: "aiChat.disclaimer",
  },
  flashcards: {
    question: "flashcards.question",
    questionAria: "flashcards.questionAria",
    answer: "flashcards.answer",
    count: "flashcards.count",
    previous: "flashcards.previous",
    next: "flashcards.next",
  },
  entryScreen: {
    problemInitialMessage: "entryScreen.problemInitialMessage",
    videoStarterConcepts: "entryScreen.videoStarterConcepts",
    videoStarterExamples: "entryScreen.videoStarterExamples",
    videoStarterKeyTerms: "entryScreen.videoStarterKeyTerms",
  },
} as const

export type TranslationKey =
  | (typeof TRANSLATION_KEYS.aiDrawer)[keyof typeof TRANSLATION_KEYS.aiDrawer]
  | (typeof TRANSLATION_KEYS.aiChat)[keyof typeof TRANSLATION_KEYS.aiChat]
  | (typeof TRANSLATION_KEYS.flashcards)[keyof typeof TRANSLATION_KEYS.flashcards]
  | (typeof TRANSLATION_KEYS.entryScreen)[keyof typeof TRANSLATION_KEYS.entryScreen]

export const DEFAULT_TRANSLATIONS: Record<TranslationKey, string> = {
  [TRANSLATION_KEYS.aiDrawer.ariaClose]: "Close",
  [TRANSLATION_KEYS.aiDrawer.tabLabelChat]: "Chat",
  [TRANSLATION_KEYS.aiDrawer.tabLabelFlashcards]: "Flashcards",
  [TRANSLATION_KEYS.aiDrawer.tabLabelSummary]: "Summary",
  [TRANSLATION_KEYS.aiDrawer.videoEntryScreenTitle]:
    "What do you want to know about this video?",

  [TRANSLATION_KEYS.aiChat.feedbackGood]: "Good response",
  [TRANSLATION_KEYS.aiChat.feedbackBad]: "Bad response",
  [TRANSLATION_KEYS.aiChat.assignmentsLabel]: "Assignments",
  [TRANSLATION_KEYS.aiChat.selectAssignment]: "Select an assignment",
  [TRANSLATION_KEYS.aiChat.srYouSaid]: "You said: ",
  [TRANSLATION_KEYS.aiChat.srAssistantSaid]: "Assistant said: ",
  [TRANSLATION_KEYS.aiChat.noAssignmentsMessage]:
    "Hi! It looks like there are no assignments available right now. I'm here to help when there is an assignment ready to start.",
  [TRANSLATION_KEYS.aiChat.errorGeneric]: "An unexpected error has occurred.",
  [TRANSLATION_KEYS.aiChat.errorHiddenResponse]:
    "Sorry, an error occurred. Please try again.",
  [TRANSLATION_KEYS.aiChat.askQuestion]: "Ask a question",
  [TRANSLATION_KEYS.aiChat.stop]: "Stop",
  [TRANSLATION_KEYS.aiChat.send]: "Send",
  [TRANSLATION_KEYS.aiChat.disclaimer]:
    "AI-generated content may be incorrect.",

  [TRANSLATION_KEYS.flashcards.question]: "Q: ",
  [TRANSLATION_KEYS.flashcards.questionAria]: "Question: ",
  [TRANSLATION_KEYS.flashcards.answer]: "Answer: ",
  [TRANSLATION_KEYS.flashcards.count]: "Flashcard {index} of {total}",
  [TRANSLATION_KEYS.flashcards.previous]: "Previous card",
  [TRANSLATION_KEYS.flashcards.next]: "Next card",

  [TRANSLATION_KEYS.entryScreen.problemInitialMessage]:
    "Let's try to work on this problem together. It would be great to hear how you're thinking about solving it. Can you walk me through the approach you're considering?",
  [TRANSLATION_KEYS.entryScreen.videoStarterConcepts]:
    "What are the most important concepts introduced in the video?",
  [TRANSLATION_KEYS.entryScreen.videoStarterExamples]:
    "What examples are used to illustrate concepts covered in the video?",
  [TRANSLATION_KEYS.entryScreen.videoStarterKeyTerms]:
    "What are the key terms introduced in this video?",
}
