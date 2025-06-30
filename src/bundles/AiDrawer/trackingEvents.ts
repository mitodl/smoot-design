interface ITrackingEvent {
  type: string
  data?: Record<string, unknown>
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
  data: {
    value: string
    source: "input" | "conversation-starter"
  }
}
interface ResponseEvent extends ITrackingEvent {
  type: typeof TrackingEventType.Response
  data: {
    value: string
  }
}
interface TabChangeEvent extends ITrackingEvent {
  type: typeof TrackingEventType.TabChange
  data: {
    value: string
  }
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
