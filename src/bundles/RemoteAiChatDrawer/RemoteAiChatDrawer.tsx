import * as React from "react"
import { AiChat } from "../../components/AiChat/AiChat"
import type { AiChatProps } from "../../components/AiChat/AiChat"
import Drawer from "@mui/material/Drawer"

type ChatInitMessage = {
  type: "smoot-design::chat-open"
  payload: {
    chatId?: AiChatProps["chatId"]
    askTimTitle?: AiChatProps["title"]
    conversationStarters?: AiChatProps["conversationStarters"]
    initialMessages: AiChatProps["initialMessages"]
    apiUrl: AiChatProps["requestOpts"]["apiUrl"]
  }
}

type AiChatDrawerProps = {
  className?: string
  /**
   * The origin of the messages that will be received to open the chat.
   * The drawer will ignore all message events not from this origin.
   */
  messageOrigin: string
  /**
   * Transform the body of the request before sending it to the server.
   * *This cannot be supplied via message events since the function is not serializable.*
   */
  transformBody?: AiChatProps["requestOpts"]["transformBody"]
  /**
   * Fetch options to be passed to the fetch call.
   *
   * NOTE: By default, the credentials are set to "include".
   */
  fetchOpts?: AiChatProps["requestOpts"]["fetchOpts"]
}

const DEFAULT_FETCH_OPTS: AiChatDrawerProps["fetchOpts"] = {
  credentials: "include",
}

const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  messageOrigin,
  transformBody,
  className,
  fetchOpts,
}: AiChatDrawerProps) => {
  const [open, setOpen] = React.useState(false)
  const [chatSettings, setChatSettings] = React.useState<
    ChatInitMessage["payload"] | null
  >(null)
  React.useEffect(() => {
    const cb = (event: MessageEvent) => {
      if (event.origin !== messageOrigin) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `AiChatDrawer: received message from unexpected origin: ${event.origin}`,
          )
        }
        return
      }
      if (event.data.type === "smoot-design::chat-open") {
        setOpen(true)
        setChatSettings(event.data.payload)
      }
    }
    console.log("Attaching listener")
    window.addEventListener("message", cb)
    return () => {
      window.removeEventListener("message", cb)
    }
  }, [messageOrigin])
  return (
    <Drawer
      className={className}
      PaperProps={{
        sx: {
          width: "600px",
          maxWidth: "100%",
          boxSizing: "border-box",
          padding: "24px 40px",
          ".MitAiChat--title": {
            paddingTop: "0px",
          },
        },
      }}
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
    >
      {chatSettings ? (
        <AiChat
          {...chatSettings}
          requestOpts={{
            transformBody,
            apiUrl: chatSettings?.apiUrl,
            fetchOpts: {
              ...DEFAULT_FETCH_OPTS,
              ...fetchOpts,
            },
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </Drawer>
  )
}

export { AiChatDrawer }
export type { AiChatDrawerProps, ChatInitMessage }
