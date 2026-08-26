/**
 * Event names and property shapes for AskTIM analytics.
 *
 * These are strings and types only — no analytics client is imported, and
 * callers keep using whatever they already have (`posthog.capture`, etc). They
 * live here because more than one frontend fires the same events, and a
 * divergence in property names silently corrupts a dashboard rather than
 * throwing.
 */

const ASK_TIM_CLICKED = "asktim_clicked"

type AskTimClickedProperties =
  /** The recommendation bot, which is not scoped to a resource. */
  | { type: "recommendation_bot" }
  /** The syllabus bot, scoped to the resource being discussed. */
  | {
      type: "syllabus_bot"
      readableId: string
      resourceType: string
      platformCode?: string
      /**
       * MIT Learn's numeric id for the resource. Optional because frontends
       * outside MIT Learn identify resources by readable id only.
       */
      resourceId?: number
    }

export { ASK_TIM_CLICKED }
export type { AskTimClickedProperties }
