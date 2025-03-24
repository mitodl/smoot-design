import * as React from "react"
import { FC, useEffect, useRef, useState } from "react"
import styled from "@emotion/styled"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { RiCloseLine } from "@remixicon/react"
import Drawer from "@mui/material/Drawer"
import {
  TabButtonList,
  TabButton,
} from "../../components/TabButtons/TabButtonList"
import Typography from "@mui/material/Typography"
import TabContext from "@mui/lab/TabContext"
import TabPanel from "@mui/lab/TabPanel"
import { AiChat } from "../../components/AiChat/AiChat"
import { AiChatMessage } from "../../components/AiChat/types"
import type { AiChatProps } from "../../components/AiChat/AiChat"
import { ActionButton } from "../../components/Button/ActionButton"
import { FlashcardsScreen } from "./FlashcardsScreen"
import type { Flashcard } from "./FlashcardsScreen"

type RemoteTutorDrawerInitMessage = {
  type: "smoot-design::tutor-drawer-open"
  payload: {
    blockType?: "problem" | "video"
    target?: string
    chat: {
      chatId?: AiChatProps["chatId"]
      askTimTitle?: AiChatProps["title"]
      conversationStarters?: AiChatProps["conversationStarters"]
      initialMessages: AiChatProps["initialMessages"]
      apiUrl: AiChatProps["requestOpts"]["apiUrl"]
      requestBody?: Record<string, unknown>
    }
    summary?: {
      contentUrl: string
    }
  }
}

const CloseButton = styled(ActionButton)(({ theme }) => ({
  position: "fixed",
  top: "24px",
  right: "40px",
  backgroundColor: theme.custom.colors.lightGray2,
  "&&:hover": {
    backgroundColor: theme.custom.colors.red,
    color: theme.custom.colors.white,
  },
  zIndex: 2,
}))

const StyledTabButtonList = styled(TabButtonList)(({ theme }) => ({
  padding: "80px 0 16px",
  backgroundColor: theme.custom.colors.white,
  position: "sticky",
  top: 0,
  zIndex: 1,
  overflow: "visible",
}))

const StyledTabPanel = styled(TabPanel)({
  padding: "0",
  height: "calc(100% - 138px)",
})

const StyledAiChat = styled(AiChat)({
  ".MitAiChat--title": {
    paddingTop: "8px",
  },
})

const StyledHTML = styled.div(({ theme }) => ({
  color: theme.custom.colors.darkGray2,
  backgroundColor: theme.custom.colors.white,
  padding: "12px 0 100px",
  ...theme.typography.body2,
  "p:first-of-type": {
    marginTop: 0,
  },
  "p:last-of-type": {
    marginBottom: 0,
  },
  "ol, ul": {
    paddingInlineStart: "32px",
    li: {
      margin: "16px 0",
    },
  },
  ul: {
    marginInlineStart: "-16px",
  },
  a: {
    color: theme.custom.colors.red,
    fontWeight: "normal",
  },
}))

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

const parseContent = (contentString: string) => {
  try {
    const parsed = JSON.parse(contentString)
    const content = parsed[0]?.content
    const unescaped = content
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")

    return unescaped
  } catch (e) {
    console.warn("Could not parse content:", e)
    return contentString
  }
}

const useContentFetch = (contentUrl: string | undefined) => {
  const [response, setResponse] = useState<{
    summary: string | null
    flashcards: Flashcard[]
  } | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!contentUrl) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(contentUrl)
        const result = await response.json()
        const parsedContent = parseContent(result.content)
        setResponse({
          summary: parsedContent,
          flashcards: result.flashcards,
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch"))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [contentUrl])

  return { response, error, loading }
}

const ChatComponent = ({
  payload,
  transformBody,
  fetchOpts,
}: {
  payload: RemoteTutorDrawerInitMessage["payload"]["chat"]
  transformBody: (messages: AiChatMessage[]) => Iterable<unknown>
  fetchOpts: AiChatProps["requestOpts"]["fetchOpts"]
}) => {
  if (!payload) return null

  return (
    <StyledAiChat
      chatId={payload.chatId}
      askTimTitle={payload.askTimTitle}
      conversationStarters={payload.conversationStarters}
      initialMessages={payload.initialMessages}
      requestOpts={{
        transformBody: (messages) => ({
          ...payload.requestBody,
          ...transformBody?.(messages),
        }),
        apiUrl: payload.apiUrl,
        fetchOpts: { ...DEFAULT_FETCH_OPTS, ...fetchOpts },
      }}
    />
  )
}

const RemoteTutorDrawer: FC<RemoteTutorDrawerProps> = ({
  messageOrigin,
  transformBody = identity,
  className,
  fetchOpts,
  target,
}: RemoteTutorDrawerProps) => {
  const [open, setOpen] = useState(false)
  const [payload, setPayload] = useState<
    RemoteTutorDrawerInitMessage["payload"] | null
  >(null)

  const [tab, setTab] = useState("chat")
  const paperRef = useRef<HTMLDivElement>(null)
  const { response } = useContentFetch(payload?.summary?.contentUrl)

  const [_wasKeyboardFocus, setWasKeyboardFocus] = useState(false)
  const mouseInteracted = useRef(false)

  const handleMouseDown = () => {
    mouseInteracted.current = true
  }

  const handleFocus = () => {
    if (!mouseInteracted.current) {
      setWasKeyboardFocus(true)
    }
    mouseInteracted.current = false
  }

  useEffect(() => {
    const cb = (event: MessageEvent) => {
      if (event.origin !== messageOrigin) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `RemoteTutorDrawer: received message from unexpected origin: ${event.origin}`,
          )
        }
        return
      }

      if (
        event.data.type === "smoot-design::tutor-drawer-open" &&
        event.data.payload.target === target
      ) {
        setOpen(true)
        setPayload(event.data.payload)
      }
    }
    window.addEventListener("message", cb)
    return () => {
      window.removeEventListener("message", cb)
    }
  }, [messageOrigin, target])

  if (!payload) {
    return null
  }

  const { blockType, chat } = payload
  const hasTabs = blockType === "video"

  return (
    <Drawer
      className={className}
      PaperProps={{
        ref: paperRef,
        sx: {
          width: "900px",
          maxWidth: "100%",
          boxSizing: "border-box",
          scrollbarGutter: "stable",
          padding: hasTabs ? "0 25px 24px 40px" : "24px 25px 24px 40px",
          ".MitAiChat--title": {
            paddingTop: "0px",
          },
        },
      }}
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
    >
      <CloseButton
        variant="text"
        size="medium"
        onClick={() => setOpen(false)}
        aria-label="Close"
      >
        <RiCloseLine />
      </CloseButton>
      {blockType === "problem" ? (
        <ChatComponent
          payload={chat}
          transformBody={transformBody}
          fetchOpts={fetchOpts}
        />
      ) : null}
      {blockType === "video" ? (
        <TabContext value={tab}>
          <StyledTabButtonList
            styleVariant="chat"
            onChange={(_event, val) => setTab(val)}
          >
            <TabButton value="chat" label="Chat" />
            <TabButton
              value="flashcards"
              label="Flashcards"
              onMouseDown={handleMouseDown}
              onFocus={handleFocus}
            />
            <TabButton value="summary" label="Summary" />
          </StyledTabButtonList>
          <StyledTabPanel value="chat">
            <ChatComponent
              payload={chat}
              transformBody={transformBody}
              fetchOpts={fetchOpts}
            />
          </StyledTabPanel>
          <StyledTabPanel value="flashcards">
            <FlashcardsScreen
              flashcards={response?.flashcards}
              wasKeyboardFocus={_wasKeyboardFocus}
            />
          </StyledTabPanel>
          <StyledTabPanel value="summary">
            <Typography variant="h4" component="h4"></Typography>
            <StyledHTML>
              <Markdown rehypePlugins={[rehypeRaw]}>
                {response?.summary}
              </Markdown>
            </StyledHTML>
          </StyledTabPanel>
        </TabContext>
      ) : null}
    </Drawer>
  )
}

export { RemoteTutorDrawer }
export type { RemoteTutorDrawerProps, RemoteTutorDrawerInitMessage }
