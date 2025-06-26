interface ITrackingEvent {
  type: string
  // The block id with which the drawer is associated
  blockId: string
}

const TrackingEventType = {
  Open: "open",
  Close: "close",
  Submit: "submit",
  Response: "response",
  TabChange: "tabchange",
} as const
type TrackingEventType = keyof typeof TrackingEventType

interface OpenEvent extends ITrackingEvent {
  type: typeof TrackingEventType.Open
}
interface CloseEvent extends ITrackingEvent {
  type: typeof TrackingEventType.Close
}
interface SubmitEvent extends ITrackingEvent {
  type: typeof TrackingEventType.Submit
  value: string
  source: "input" | "conversation-starter"
}
interface ResponseEvent extends ITrackingEvent {
  type: typeof TrackingEventType.Response
  value: string
}
interface TabChangeEvent extends ITrackingEvent {
  type: typeof TrackingEventType.TabChange
  value: string
}

type TrackingEvent =
  | OpenEvent
  | CloseEvent
  | SubmitEvent
  | ResponseEvent
  | TabChangeEvent

type TrackingEventHandler = (event: TrackingEvent) => void

export type {
  ITrackingEvent,
  TrackingEventHandler,
  OpenEvent,
  CloseEvent,
  SubmitEvent,
  ResponseEvent,
  TabChangeEvent,
  TrackingEvent,
}

export { TrackingEventType }
