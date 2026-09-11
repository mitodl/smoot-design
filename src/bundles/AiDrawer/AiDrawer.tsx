import * as React from "react"
import {
  FC,
  useCallback,
  useEffect,
  useId,
  useState,
  useRef,
  useMemo,
} from "react"
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
import type { AiChatProps, AiChatMessage } from "../../components/AiChat/types"
import { ActionButton } from "../../components/Button/ActionButton"
import { FlashcardsScreen } from "./FlashcardsScreen"
import type { Flashcard } from "./FlashcardsScreen"
import { VERSION } from "../../VERSION"
import { TrackingEventType, TrackingEventHandler } from "./trackingEvents"
import {
  useTranslation,
  TRANSLATION_KEYS,
} from "../../contexts/TranslationContext"

type AiDrawerSettings = {
  blockType?: "problem" | "video"
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

const Header = styled.div<{ externalScroll?: boolean }>(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
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
  flex: 1,
  minWidth: 0,
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
  // Heading is focused on open; suppress the native outline and drive the ring
  // via data-focus-ring for keyboard opens only (WCAG 2.4.7).
  h1: {
    flex: 1,
    minWidth: 0,
    overflowWrap: "anywhere",
    outline: "none",
  },
  "h1[data-focus-ring]:focus": {
    outline: `2px solid ${theme.custom.colors.darkGray2}`,
    outlineOffset: "2px",
    borderRadius: "2px",
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

// Skip link (WCAG 2.4.1): visually hidden until focused. Activating it hands
// keyboard focus back to the cross-origin LMS trigger while the drawer stays open.
const ReturnToBlock = styled.button(({ theme }) => ({
  ...theme.typography.body3,
  position: "absolute",
  left: 0,
  top: 0,
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  width: "1px",
  margin: "-1px",
  padding: 0,
  overflow: "hidden",
  whiteSpace: "nowrap",
  border: 0,
  "&:focus": {
    position: "static",
    order: -1,
    flexBasis: "100%",
    width: "100%",
    height: "auto",
    clip: "auto",
    clipPath: "none",
    overflow: "visible",
    whiteSpace: "normal",
    textAlign: "left",
    margin: "0 0 8px",
    padding: "8px 12px",
    background: theme.custom.colors.white,
    color: theme.custom.colors.darkGray2,
    border: `1px solid ${theme.custom.colors.lightGray2}`,
    borderRadius: "4px",
    outline: `2px solid ${theme.custom.colors.darkGray2}`,
    outlineOffset: "2px",
    cursor: "pointer",
  },
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

const StyledAiChat = styled(AiChat)<{
  hasTabs: boolean
  variant: "drawer" | "slot"
}>(({ hasTabs, variant, theme }) => ({
  ".MitAiChat--entryScreenContainer": {
    padding:
      hasTabs && variant === "slot"
        ? "24px 0 24px"
        : hasTabs
          ? "114px 0 24px"
          : "168px 32px 24px",
    ...(hasTabs &&
      variant === "slot" && {
        overflowY: "auto",
        "> *": {
          flexShrink: 0,
        },
        "> :first-child": {
          marginTop: "auto",
        },
        "> :last-child": {
          marginBottom: "auto",
        },
      }),
    [theme.breakpoints.down("md")]: {
      padding:
        hasTabs && variant === "slot"
          ? "24px 0 24px"
          : hasTabs
            ? "114px 0 24px"
            : "168px 16px 24px",
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
    ...(variant === "slot" && {
      "> .MitAiChat--messageRowAssistant:first-child": {
        marginTop: 0,
      },
    }),
  },
}))

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

const SlotContainer = styled.div(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.custom.colors.white,
  position: "relative",
  boxSizing: "border-box",
  padding: "0 32px",
  [theme.breakpoints.down("md")]: {
    padding: "0 16px",
  },
}))

const identity = <T,>(x: T): T => x

type AiDrawerProps = {
  className?: string
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

  settings?: AiDrawerSettings

  open?: boolean
  /** Keyboard-initiated open: the slot shows a focus ring on the heading. */
  openedViaKeyboard?: boolean
  /**
   * Bumped on every open request, so re-activating the trigger while the slot is
   * already open (e.g. after "Return to block") re-focuses the heading — the
   * `open` boolean alone can't, since it never changes on a repeat open.
   */
  openNonce?: number
  onClose?: () => void
  /**
   * "Return to block" skip link handler. When provided, a visually-hidden skip
   * link renders in the header; activating it returns keyboard focus to the
   * cross-origin LMS trigger without closing the drawer.
   */
  onReturnToBlock?: () => void
  onTrackingEvent?: TrackingEventHandler
  /**
   * Rendering variant:
   * - "drawer" (default): Renders as Material-UI Drawer overlay that slides in from the side
   * - "slot": Renders as a regular div container for placement in slots/containers
   *
   * @default "drawer"
   */
  variant?: "drawer" | "slot"
}

const DEFAULT_FETCH_OPTS: AiDrawerProps["fetchOpts"] = {
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

const ChatComponent = ({
  settings,
  transformBody,
  fetchOpts,
  scrollElement,
  entryScreenEnabled,
  entryScreenTitle,
  conversationStarters,
  initialMessages,
  hasTabs,
  needsMathJax,
  variant,
  onTrackingEvent,
}: {
  settings: AiDrawerSettings["chat"]
  transformBody: (messages: AiChatMessage[]) => Iterable<unknown>
  fetchOpts: AiChatProps["requestOpts"]["fetchOpts"]
  scrollElement: AiChatProps["scrollElement"]
  entryScreenEnabled: boolean
  entryScreenTitle?: AiChatProps["entryScreenTitle"]
  conversationStarters?: AiChatProps["conversationStarters"]
  initialMessages?: AiChatProps["initialMessages"]
  hasTabs: boolean
  needsMathJax: boolean
  variant: "drawer" | "slot"
  onTrackingEvent?: TrackingEventHandler
}) => {
  if (!settings) return null
  return (
    <StyledAiChat
      key={settings.chatId}
      chatId={settings.chatId}
      conversationStarters={conversationStarters}
      initialMessages={initialMessages}
      scrollElement={scrollElement}
      entryScreenEnabled={entryScreenEnabled}
      entryScreenTitle={entryScreenTitle}
      requestOpts={{
        transformBody: (messages) => ({
          ...settings.requestBody,
          ...transformBody?.(messages),
        }),
        apiUrl: settings.apiUrl,
        fetchOpts: { ...DEFAULT_FETCH_OPTS, ...fetchOpts },
        onFinish: (message) =>
          onTrackingEvent?.({
            type: TrackingEventType.Response,
            data: {
              value: message.content,
            },
          }),
      }}
      hasTabs={hasTabs}
      variant={variant}
      useMathJax={needsMathJax}
      onSubmit={(message, meta) => {
        onTrackingEvent?.({
          type: TrackingEventType.Submit,
          data: {
            value: message,
            source: meta.source,
          },
        })
      }}
    />
  )
}

/**
 * Call the callback when open changes from false to true.
 */
const useOnDrawerOpened = (open: boolean | undefined, callback: () => void) => {
  /**
   * Implementation Notes:
   *  - Uses a ref to ensure the current value of the callback is used
   *  - All handling of open events could be handled in AiDrawerManager.tsx, but
   *   keeping it here lets as keep all event-tracking handler calling in
   *   AiDrawerManager.
   */
  const cb = useRef(callback)
  React.useEffect(() => {
    cb.current = callback
  }, [callback])
  useEffect(() => {
    if (open) {
      cb.current()
    }
  }, [open])
}

const randomItems = <T,>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

const AiDrawer: FC<AiDrawerProps> = ({
  transformBody = identity,
  className,
  fetchOpts,
  settings,
  open,
  openedViaKeyboard,
  openNonce,
  onClose,
  onReturnToBlock,
  onTrackingEvent,
  variant = "drawer",
}: AiDrawerProps) => {
  const { t } = useTranslation()
  const [tab, setTab] = useState("chat")
  const headingRef = useRef<HTMLHeadingElement>(null)
  // Strip guillemets from useId so the value is CSS-selector safe.
  const headingId = `ai-drawer-heading-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

  const defaultProblemInitialMessages = useMemo<AiChatProps["initialMessages"]>(
    () => [
      {
        role: "assistant",
        content: t(TRANSLATION_KEYS.entryScreen.problemInitialMessage),
      },
    ],
    [t],
  )

  const defaultVideoStarters = useMemo(
    () => [
      { content: t(TRANSLATION_KEYS.entryScreen.videoStarterConcepts) },
      { content: t(TRANSLATION_KEYS.entryScreen.videoStarterExamples) },
      { content: t(TRANSLATION_KEYS.entryScreen.videoStarterKeyTerms) },
    ],
    [t],
  )
  const { response } = useContentFetch(settings?.summary?.apiUrl)

  const handleClose = useCallback(() => {
    onClose?.()
    onTrackingEvent?.({ type: TrackingEventType.Close })
  }, [onClose, onTrackingEvent])

  // On slot open, focus the heading (the modal "drawer" variant self-manages).
  // openNonce is a dep so a repeat open re-focuses too (see the prop; WCAG 2.4.3).
  useEffect(() => {
    if (open && variant === "slot") {
      headingRef.current?.focus()
    }
  }, [open, variant, openNonce])

  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null)

  // Non-modal slot needs its own Escape-to-close (WCAG 2.1.2), but only while
  // focus is inside it: a host may hide the slot without closing it, and a stray
  // Escape elsewhere must not dismiss the hidden drawer.
  useEffect(() => {
    if (!open || variant !== "slot" || !scrollElement) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        scrollElement.contains(document.activeElement)
      ) {
        handleClose()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, variant, scrollElement, handleClose])

  const paperRefCallback = (node: HTMLDivElement | null) => {
    if (node) {
      setScrollElement(node)
    }
  }

  // Trap Tab/Shift+Tab within the non-modal slot (WCAG 2.4.3); the "drawer"
  // variant is a MUI Modal and traps focus itself. Attached natively so the
  // non-interactive region doesn't take a JSX event listener.
  useEffect(() => {
    if (!open || variant !== "slot" || !scrollElement) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return
      }
      const tabbable = Array.from(
        scrollElement.querySelectorAll<HTMLElement>(
          "a[href], button, input, textarea, select, [tabindex]",
        ),
      ).filter(
        (el) =>
          el.tabIndex >= 0 &&
          !(el as HTMLButtonElement).disabled &&
          // Exclude [hidden] subtrees (the kept-mounted, inactive chat panel) the
          // browser skips when tabbing, so first/last match reality on every tab.
          !el.closest("[hidden]"),
      )
      if (tabbable.length === 0) {
        return
      }
      const first = tabbable[0]
      const last = tabbable[tabbable.length - 1]
      const activeEl = document.activeElement
      // On open, focus is on the heading (tabIndex -1, not in `tabbable`); treat
      // it as the leading boundary so the first Shift+Tab wraps.
      const atStart = activeEl === first || activeEl === headingRef.current
      if (event.shiftKey && atStart) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault()
        first.focus()
      }
    }
    scrollElement.addEventListener("keydown", onKeyDown)
    return () => scrollElement.removeEventListener("keydown", onKeyDown)
  }, [open, variant, scrollElement])

  useEffect(() => {
    scrollElement?.scrollTo?.({
      top: tab === "chat" ? scrollElement.scrollHeight : 0,
    })
  }, [tab, scrollElement])

  const conversationStarters = useMemo(() => {
    if (!settings) return []
    return (
      settings.chat.conversationStarters ||
      (response?.flashcards?.length && response.flashcards.length >= 3
        ? randomItems(response.flashcards, 3).map((flashcard) => ({
            content: flashcard.question,
          }))
        : defaultVideoStarters)
    )
  }, [settings, response, defaultVideoStarters])

  useOnDrawerOpened(open, () => {
    onTrackingEvent?.({ type: TrackingEventType.Open })
  })

  if (!settings) {
    return <div data-testid="ai-drawer-waiting"></div>
  }

  const { title, blockType, chat } = settings
  const hasTabs = blockType === "video"

  const returnLabel = t(
    blockType === "video"
      ? TRANSLATION_KEYS.aiDrawer.returnToVideo
      : blockType === "problem"
        ? TRANSLATION_KEYS.aiDrawer.returnToProblem
        : TRANSLATION_KEYS.aiDrawer.returnToContent,
  )

  const drawerContent = (
    <>
      <Header>
        <Title>
          {title ? <RiSparkling2Line aria-hidden /> : null}
          <Typography
            variant="body1"
            component="h1"
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            data-focus-ring={openedViaKeyboard ? "" : undefined}
          >
            {title?.includes("AskTIM") ? (
              <>
                Ask<strong>TIM</strong>
                {title.replace("AskTIM", "")}
              </>
            ) : (
              title
            )}
          </Typography>
        </Title>
        {onReturnToBlock && variant === "slot" ? (
          <ReturnToBlock type="button" onClick={onReturnToBlock}>
            {returnLabel}
          </ReturnToBlock>
        ) : null}
        <CloseButton
          variant="text"
          size="medium"
          onClick={handleClose}
          aria-label={t(TRANSLATION_KEYS.aiDrawer.ariaClose)}
        >
          <RiCloseLine />
        </CloseButton>
      </Header>
      {blockType === "problem" ? (
        <ChatComponent
          settings={chat}
          transformBody={transformBody}
          fetchOpts={fetchOpts}
          scrollElement={scrollElement}
          entryScreenEnabled={chat?.entryScreenEnabled ?? false}
          entryScreenTitle={chat.entryScreenTitle}
          initialMessages={
            chat.initialMessages || defaultProblemInitialMessages
          }
          hasTabs={hasTabs}
          needsMathJax={true}
          variant={variant}
          onTrackingEvent={onTrackingEvent}
        />
      ) : null}
      {blockType === "video" ? (
        <TabContext value={tab}>
          <StyledTabButtonList
            styleVariant="chat"
            selectionFollowsFocus
            onChange={(_e, tab) => {
              setTab(tab)
              onTrackingEvent?.({
                type: TrackingEventType.TabChange,
                data: {
                  value: tab,
                },
              })
            }}
          >
            <TabButton
              value="chat"
              label={t(TRANSLATION_KEYS.aiDrawer.tabLabelChat)}
            />
            {response?.flashcards?.length ? (
              <TabButton
                value="flashcards"
                label={t(TRANSLATION_KEYS.aiDrawer.tabLabelFlashcards)}
              />
            ) : null}
            <TabButton
              value="summary"
              label={t(TRANSLATION_KEYS.aiDrawer.tabLabelSummary)}
            />
          </StyledTabButtonList>
          <StyledTabPanel value="chat" keepMounted>
            <ChatComponent
              settings={chat}
              transformBody={transformBody}
              fetchOpts={fetchOpts}
              scrollElement={scrollElement}
              entryScreenEnabled={chat?.entryScreenEnabled ?? true}
              entryScreenTitle={
                chat.entryScreenTitle ??
                t(TRANSLATION_KEYS.aiDrawer.videoEntryScreenTitle)
              }
              conversationStarters={conversationStarters}
              initialMessages={chat.initialMessages}
              hasTabs={hasTabs}
              needsMathJax={true}
              variant={variant}
              onTrackingEvent={onTrackingEvent}
            />
          </StyledTabPanel>
          {response?.flashcards?.length ? (
            <StyledTabPanel value="flashcards">
              <FlashcardsScreen flashcards={response?.flashcards} />
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
    </>
  )

  // Slot variant: render as regular div container
  if (variant === "slot") {
    if (!open) {
      return null
    }
    return (
      <SlotContainer
        className={className}
        data-smoot-version={VERSION}
        ref={paperRefCallback}
        role="region"
        // Static label, not the heading: we focus the heading on open, so a
        // heading-derived region name would announce the title twice.
        aria-label={t(TRANSLATION_KEYS.aiDrawer.ariaRegion)}
      >
        {drawerContent}
      </SlotContainer>
    )
  }

  // Drawer mode: render as Material-UI Drawer (default, backward compatible)
  return (
    <Drawer
      data-smoot-version={VERSION}
      className={className}
      slotProps={{
        paper: {
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
        },
      }}
      anchor="right"
      open={open}
      onClose={handleClose}
      role="dialog"
      aria-modal="true"
      keepMounted
    >
      {drawerContent}
    </Drawer>
  )
}

export { AiDrawer }
export type { AiDrawerProps, AiDrawerSettings }
