import * as React from "react"
import { AiChat } from "../../components/AiChat/AiChat"
import { AiChatMessage } from "../../components/AiChat/types"
import type { AiChatProps } from "../../components/AiChat/AiChat"
import Drawer from "@mui/material/Drawer"
import {
  TabButtonList,
  TabButton,
} from "../../components/TabButtons/TabButtonList"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import TabContext from "@mui/lab/TabContext"
import TabPanel from "@mui/lab/TabPanel"

type ChatInitMessage = {
  type: "smoot-design::chat-open"
  payload: {
    chatId?: AiChatProps["chatId"]
    askTimTitle?: AiChatProps["title"]
    conversationStarters?: AiChatProps["conversationStarters"]
    initialMessages: AiChatProps["initialMessages"]
    apiUrl: AiChatProps["requestOpts"]["apiUrl"]
    requestBody?: Record<string, unknown>
  }
}

const identity = <T,>(x: T): T => x

type RemoteTutorDrawerProps = {
  blockType?: "problem" | "video"

  className?: string
  /**
   * The origin of the messages that will be received to open the chat.
   * The drawer will ignore all message events not from this origin.
   */
  messageOrigin: string
  /**
   * Transform the body of the request before sending it to the server.
   * Its result will be merged with the per-message requestBody opt, with
   * transformBody taking precedence.
   *
   * *This cannot be supplied via message events since the function is not serializable.*
   *
   */
  transformBody?: (messages: AiChatMessage[]) => Iterable<unknown>
  /**
   * Fetch options to be passed to the fetch call.
   *
   * NOTE: By default, the credentials are set to "include" to enable thread-
   * identifying cookies.
   */
  fetchOpts?: AiChatProps["requestOpts"]["fetchOpts"]

  /**
   * Pass to target a specific drawer instance where multiple are on the page.
   */
  target?: string
}

const DEFAULT_FETCH_OPTS: RemoteTutorDrawerProps["fetchOpts"] = {
  credentials: "include",
}

const RemoteTutorDrawer: React.FC<RemoteTutorDrawerProps> = ({
  blockType = "problem",
  messageOrigin,
  transformBody = identity,
  className,
  fetchOpts,
  target,
}: RemoteTutorDrawerProps) => {
  const [open, setOpen] = React.useState(false)
  const [chatSettings, setChatSettings] = React.useState<
    ChatInitMessage["payload"] | null
  >(null)
  const [tab, setTab] = React.useState("chat")

  React.useEffect(() => {
    const cb = (event: MessageEvent) => {
      if (event.origin !== messageOrigin) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `RemoteTutorDrawer: received message from unexpected origin: ${event.origin}`,
          )
        }
        return
      }
      console.log("event", event.data)
      console.log("target", target)
      if (
        event.data.type === "smoot-design::chat-open" &&
        event.data.payload.target === target
      ) {
        setOpen(true)
        setChatSettings(event.data.payload)
      }
    }
    window.addEventListener("message", cb)
    return () => {
      window.removeEventListener("message", cb)
    }
  }, [messageOrigin, target])

  return (
    <Drawer
      className={className}
      PaperProps={{
        sx: {
          width: "900px",
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
      {blockType === "problem" && chatSettings ? (
        <AiChat
          {...chatSettings}
          requestOpts={{
            transformBody: (messages) => {
              return {
                ...chatSettings.requestBody,
                ...transformBody?.(messages),
              }
            },
            apiUrl: chatSettings?.apiUrl,
            fetchOpts: { ...DEFAULT_FETCH_OPTS, ...fetchOpts },
          }}
          onClose={() => setOpen(false)}
        />
      ) : null}
      {blockType === "video" ? (
        <TabContext value={tab}>
          <Stack direction="row">
            <TabButtonList
              styleVariant="chat"
              onChange={(_event, val) => setTab(val)}
            >
              <TabButton
                // key={`tab-${i}`}
                value="chat"
                label="Chat"
              />
              <TabButton
                // key={`tab-${i}`}
                value="summary"
                label="Summary"
              />
            </TabButtonList>
          </Stack>
          <TabPanel value="chat">
            <Typography variant="h4" component="h4">
              Chat
            </Typography>
          </TabPanel>
          <TabPanel value="summary">
            <Typography variant="h4" component="h4">
              Summary
            </Typography>
          </TabPanel>
        </TabContext>
      ) : null}
    </Drawer>
  )
}

export { RemoteTutorDrawer }
export type { RemoteTutorDrawerProps, ChatInitMessage }
