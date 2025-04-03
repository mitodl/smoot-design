import * as React from "react"
import { FC, useEffect, useState, useRef, useMemo } from "react"
import styled from "@emotion/styled"
import Markdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { RiCloseLine, RiSparkling2Line } from "@remixicon/react"
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
    /**
     * If the title begins "AskTIM", it is styled as the AskTIM logo.
     */
    title?: string
    chat: {
      chatId?: AiChatProps["chatId"]
      conversationStarters?: AiChatProps["conversationStarters"]
      initialMessages?: AiChatProps["initialMessages"]
      apiUrl: AiChatProps["requestOpts"]["apiUrl"]
      requestBody?: Record<string, unknown>
      entryScreenEnabled?: AiChatProps["entryScreenEnabled"]
      entryScreenTitle?: AiChatProps["entryScreenTitle"]
    }
    summary?: {
      apiUrl: string
    }
  }
}

const Header = styled.div<{ externalScroll?: boolean }>(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "4px",
  color: theme.custom.colors.white,
  position: "sticky",
  top: 0,
  padding: "32px 0 16px 0",
  zIndex: 2,
  backgroundColor: theme.custom.colors.white,
  borderRadius: 0,
}))

const Title = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: theme.custom.colors.darkGray2,
  img: {
    width: "24px",
    height: "24px",
  },
  svg: {
    fill: theme.custom.colors.red,
    width: "24px",
    height: "24px",
    flexShrink: 0,
  },
  overflow: "hidden",
  p: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
}))

const CloseButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.custom.colors.lightGray2,
  "&&:hover": {
    backgroundColor: theme.custom.colors.red,
    color: theme.custom.colors.white,
  },
  zIndex: 3,
  flexShrink: 0,
}))

const StyledTabButtonList = styled(TabButtonList)(({ theme }) => ({
  padding: "0 0 16px",
  backgroundColor: theme.custom.colors.white,
  position: "sticky",
  top: "88px",
  zIndex: 2,
  overflow: "visible",
}))

const StyledTabPanel = styled(TabPanel)({
  padding: "0",
  height: "calc(100% - 138px)",
  position: "relative",
})

const StyledAiChat = styled(AiChat)<{ hasTabs: boolean }>(
  ({ hasTabs, theme }) => ({
    ".MitAiChat--entryScreenContainer": {
      padding: hasTabs ? "114px 0 24px" : "168px 32px 24px",
      [theme.breakpoints.down("md")]: {
        padding: hasTabs ? "114px 0 24px" : "168px 16px 24px",
      },
    },
    ".MitAiChat--chatScreenContainer": {
      padding: hasTabs ? 0 : "0 32px",
      [theme.breakpoints.down("md")]: {
        padding: hasTabs ? 0 : "0 16px",
      },
    },
    ".MitAiChat--messagesContainer": {
      paddingTop: hasTabs ? "8px" : "88px",
    },
  }),
)

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

const useContentFetch = (contentUrl: string | undefined) => {
  const [response, setResponse] = useState<{
    summary: string | null
    flashcards: Flashcard[]
  } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!contentUrl) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(contentUrl)
        const result = await response.json()
        if (!result.results) {
          throw new Error("Unexpected response")
        }
        const [contentFile] = result.results
        if (!contentFile) {
          throw new Error("No result found")
        }
        setResponse({
          summary: contentFile.summary,
          flashcards: contentFile.flashcards,
        })
      } catch (error) {
        console.error("Error fetching content", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [contentUrl])

  return { response, loading }
}

const DEFAULT_VIDEO_ENTRY_SCREEN_TITLE =
  "What do you want to know about this video?"

const DEFAULT_VIDEO_STARTERS = [
  { content: "What are the most important concepts introduced in the video?" },
  {
    content:
      "What examples are used to illustrate concepts covered in the video?",
  },
  { content: "What are the key terms introduced in this video?" },
]

const ChatComponent = ({
  payload,
  transformBody,
  fetchOpts,
  scrollElement,
  entryScreenEnabled,
  entryScreenTitle,
  conversationStarters,
  hasTabs,
}: {
  payload: RemoteTutorDrawerInitMessage["payload"]["chat"]
  transformBody: (messages: AiChatMessage[]) => Iterable<unknown>
  fetchOpts: AiChatProps["requestOpts"]["fetchOpts"]
  scrollElement: AiChatProps["scrollElement"]
  entryScreenEnabled: boolean
  entryScreenTitle?: AiChatProps["entryScreenTitle"]
  conversationStarters?: AiChatProps["conversationStarters"]
  hasTabs: boolean
}) => {
  if (!payload) return null
  return (
    <StyledAiChat
      chatId={payload.chatId}
      conversationStarters={conversationStarters}
      initialMessages={payload.initialMessages}
      scrollElement={scrollElement}
      entryScreenEnabled={entryScreenEnabled}
      entryScreenTitle={entryScreenTitle}
      requestOpts={{
        transformBody: (messages) => ({
          ...payload.requestBody,
          ...transformBody?.(messages),
        }),
        apiUrl: payload.apiUrl,
        fetchOpts: { ...DEFAULT_FETCH_OPTS, ...fetchOpts },
      }}
      hasTabs={hasTabs}
    />
  )
}

const randomItems = <T,>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
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
  const { response } = useContentFetch(payload?.summary?.apiUrl)

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

  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null)

  const paperRefCallback = (node: HTMLDivElement | null) => {
    if (node) {
      setScrollElement(node)
    }
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

  const conversationStarters = useMemo(() => {
    if (!payload) return []
    return (
      payload.chat.conversationStarters ||
      (response?.flashcards
        ? randomItems(response.flashcards, 3).map((flashcard) => ({
            content: flashcard.question,
          }))
        : DEFAULT_VIDEO_STARTERS)
    )
  }, [payload, response])

  if (!payload) {
    return null
  }

  const { blockType, chat } = payload
  const hasTabs = blockType === "video"

  return (
    <Drawer
      className={className}
      PaperProps={{
        ref: paperRefCallback,
        sx: {
          width: "900px",
          maxWidth: "100%",
          boxSizing: "border-box",
          padding: {
            xs: "0 16px",
            md: "0 32px",
          },
        },
      }}
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
    >
      <Header>
        <Title>
          {payload.title ? <RiSparkling2Line /> : null}
          <Typography variant="body1">
            {payload.title?.includes("AskTIM") ? (
              <>
                Ask<strong>TIM</strong>
                {payload.title.replace("AskTIM", "")}
              </>
            ) : (
              payload.title
            )}
          </Typography>
        </Title>
        <CloseButton
          variant="text"
          size="medium"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <RiCloseLine />
        </CloseButton>
      </Header>
      {blockType === "problem" ? (
        <ChatComponent
          payload={chat}
          transformBody={transformBody}
          fetchOpts={fetchOpts}
          scrollElement={scrollElement}
          entryScreenEnabled={payload.chat?.entryScreenEnabled ?? false}
          entryScreenTitle={payload.chat.entryScreenTitle}
          hasTabs={hasTabs}
        />
      ) : null}
      {blockType === "video" ? (
        <TabContext value={tab}>
          <StyledTabButtonList
            styleVariant="chat"
            onChange={(_event, val) => setTab(val)}
          >
            <TabButton value="chat" label="Chat" />
            {response?.flashcards?.length ? (
              <TabButton
                value="flashcards"
                label="Flashcards"
                onMouseDown={handleMouseDown}
                onFocus={handleFocus}
              />
            ) : null}
            <TabButton value="summary" label="Summary" />
          </StyledTabButtonList>
          <StyledTabPanel value="chat" keepMounted>
            <ChatComponent
              payload={{
                ...chat,
              }}
              transformBody={transformBody}
              fetchOpts={fetchOpts}
              scrollElement={scrollElement}
              entryScreenEnabled={payload.chat?.entryScreenEnabled ?? true}
              entryScreenTitle={
                payload.chat.entryScreenTitle ??
                DEFAULT_VIDEO_ENTRY_SCREEN_TITLE
              }
              conversationStarters={conversationStarters}
              hasTabs={hasTabs}
            />
          </StyledTabPanel>
          {response?.flashcards?.length ? (
            <StyledTabPanel value="flashcards">
              <FlashcardsScreen
                flashcards={response?.flashcards}
                wasKeyboardFocus={_wasKeyboardFocus}
              />
            </StyledTabPanel>
          ) : null}
          <StyledTabPanel value="summary">
            <Typography variant="h4" component="h4"></Typography>
            <StyledHTML>
              <Markdown rehypePlugins={[rehypeRaw]}>
                {response?.summary ?? ""}
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
