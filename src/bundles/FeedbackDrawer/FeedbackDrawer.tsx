import * as React from "react"
import { FC, useEffect, useLayoutEffect, useId, useRef, useState } from "react"
import styled from "@emotion/styled"
import Drawer from "@mui/material/Drawer"
import {
  RiMegaphoneLine,
  RiThumbUpLine,
  RiThumbUpFill,
  RiThumbDownLine,
  RiThumbDownFill,
  RiLightbulbLine,
  RiLightbulbFill,
  RiCloseLine,
} from "@remixicon/react"
import type { RemixiconComponentType } from "@remixicon/react"
import { ActionButton } from "../../components/Button/ActionButton"
import { Alert } from "../../components/Alert/Alert"
import { Button, ButtonLoadingIcon } from "../../components/Button/Button"
import { Input } from "../../components/Input/Input"
import { VERSION } from "../../VERSION"

const RATE_LIMIT_STATUS = 429
const RATE_LIMIT_MESSAGE =
  "You're sending feedback too quickly. Please wait a moment and try again."
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again."
const COMMENT_REQUIRED_MESSAGE = "Add a comment to submit your suggestion."

type Sentiment = "positive" | "negative" | "idea"

type FeedbackData = {
  sentiment: Sentiment
  comment: string
}

type ReactionColorKey = "green" | "red" | "orange"

type ReactionConfig = {
  key: Sentiment
  LineIcon: RemixiconComponentType
  FillIcon: RemixiconComponentType
  label: string
  prompt: string
  colorKey: ReactionColorKey
  tintAlpha: number
}

const FRIENDLY_BLOCK_TYPES: Record<string, string> = {
  video: "video",
  problem: "problem",
  html: "text",
  discussion: "discussion",
  "drag-and-drop-v2": "drag-and-drop",
  openassessment: "open response",
  lti: "tool",
  lti_consumer: "tool",
  poll: "poll",
  survey: "survey",
  word_cloud: "word cloud",
  book: "reading",
  image: "image",
}

const REACTIONS: ReactionConfig[] = [
  {
    key: "positive",
    LineIcon: RiThumbUpLine,
    FillIcon: RiThumbUpFill,
    label: "Liked it",
    prompt: "What did you like?",
    colorKey: "green",
    tintAlpha: 0.12,
  },
  {
    key: "negative",
    LineIcon: RiThumbDownLine,
    FillIcon: RiThumbDownFill,
    label: "Not working",
    prompt: "What's not working?",
    colorKey: "red",
    tintAlpha: 0.1,
  },
  {
    key: "idea",
    LineIcon: RiLightbulbLine,
    FillIcon: RiLightbulbFill,
    label: "Suggestion",
    prompt: "What is your suggestion?",
    colorKey: "orange",
    tintAlpha: 0.16,
  },
]

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "")
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const Container = styled.div(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.custom.colors.white,
  boxSizing: "border-box",
  border: `1px solid ${theme.custom.colors.lightGray2}`,
  borderRadius: "8px",
  padding: "0 32px 8px",
  [theme.breakpoints.down("md")]: {
    padding: "0 16px 8px",
  },
}))

const Header = styled.div(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "4px",
  position: "sticky",
  top: 0,
  padding: "32px 0 8px 0",
  zIndex: 2,
  backgroundColor: theme.custom.colors.white,
}))

const Title = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  flex: 1,
  minWidth: 0,
  color: theme.custom.colors.darkGray2,
  svg: {
    fill: theme.custom.colors.silverGrayDark,
    width: "24px",
    height: "24px",
    flexShrink: 0,
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

const Heading = styled.h1(({ theme }) => ({
  ...theme.typography.h5,
  flex: 1,
  minWidth: 0,
  margin: 0,
  color: theme.custom.colors.darkGray2,
  overflowWrap: "anywhere",
  outline: "none",
  "&[data-focus-ring]:focus": {
    outline: `2px solid ${theme.custom.colors.darkGray2}`,
    outlineOffset: "2px",
    borderRadius: "2px",
  },
}))

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

const Body = styled.div({
  paddingBottom: "32px",
})

const Question = styled.p(({ theme }) => ({
  ...theme.typography.body1,
  color: theme.custom.colors.darkGray1,
  margin: "0 0 24px",
}))

const Reactions = styled.div({
  display: "flex",
  gap: "8px",
})

const ReactionButton = styled.button<{
  selected: boolean
  colorKey: ReactionColorKey
  tintAlpha: number
}>(({ theme, selected, colorKey, tintAlpha }) => {
  const accent = theme.custom.colors[colorKey]
  return {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px",
    border: `1px solid ${selected ? accent : theme.custom.colors.lightGray2}`,
    borderRadius: "8px",
    background: selected
      ? hexToRgba(accent, tintAlpha)
      : theme.custom.colors.white,
    color: accent,
    cursor: "pointer",
    transition: "border-color 120ms ease, background 120ms ease",
    "&:hover": {
      borderColor: accent,
    },
    "&:focus-visible": {
      outline: `2px solid ${accent}`,
      outlineOffset: "1px",
    },
    svg: {
      width: "26px",
      height: "26px",
      fill: "currentColor",
      display: "block",
    },
  }
})

const Prompt = styled.p(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.custom.colors.darkGray2,
  margin: "20px 0 8px",
}))

const RequiredMark = styled.span(({ theme }) => ({
  color: theme.custom.colors.red,
  marginLeft: "2px",
}))

const Footer = styled.div({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "16px",
})

const ErrorText = styled.p(({ theme }) => ({
  ...theme.typography.body3,
  color: theme.custom.colors.red,
  margin: "10px 0 0",
}))

const SuccessWrapper = styled.div({
  outline: "none",
  marginTop: "16px",
  "& .MuiAlert-root": {
    boxShadow: "none",
  },
})

type SubmitStatus = "idle" | "submitting" | "success" | "error"

type FeedbackDrawerProps = {
  className?: string
  /**
   * Rendering variant:
   * - "drawer" (default): MUI Drawer that slides in from the right.
   * - "slot": plain container for placement inside a slot/sidebar.
   */
  variant?: "drawer" | "slot"
  open?: boolean
  /** Keyboard-initiated open: the slot shows a focus ring on the heading. */
  openedViaKeyboard?: boolean
  onClose?: () => void
  onReturnToBlock?: () => void
  onSubmit?: (data: FeedbackData) => Promise<void> | void
  /** Drawer heading. */
  title?: string
  /** Content title (block display name) named in the subheader question. */
  subtitle?: string
  /** Block type (e.g. "video", "problem"); used in the subheader when there's no title. */
  blockType?: string
  defaultSentiment?: Sentiment
}

const FeedbackDrawer: FC<FeedbackDrawerProps> = ({
  className,
  variant = "drawer",
  open,
  openedViaKeyboard,
  onClose,
  onReturnToBlock,
  onSubmit,
  title = "Tell us what you think",
  subtitle,
  blockType,
  defaultSentiment,
}) => {
  const [sentiment, setSentiment] = useState<Sentiment | null>(
    defaultSentiment ?? null,
  )
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [rateLimited, setRateLimited] = useState(false)
  const [showRequiredError, setShowRequiredError] = useState(false)
  const [commitSeq, setCommitSeq] = useState(0)

  const active =
    REACTIONS.find((reaction) => reaction.key === sentiment) ?? null

  const reactionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const successRef = useRef<HTMLDivElement | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const commentRef = useRef<HTMLTextAreaElement | null>(null)
  const headingId = useId()
  const questionId = useId()
  const commentErrorId = useId()

  const blockTitle = subtitle?.trim()
  const friendlyType = blockType
    ? (FRIENDLY_BLOCK_TYPES[blockType] ?? blockType)
    : null

  const returnLabel = friendlyType
    ? `Return to the ${friendlyType}`
    : "Return to the content"

  const commentRequired = sentiment === "idea"
  const commentMissing = commentRequired && comment.trim() === ""

  useLayoutEffect(() => {
    if (status === "success") {
      successRef.current?.focus()
    }
  }, [status])

  useEffect(() => {
    if (open && variant === "slot") {
      headingRef.current?.focus()
    }
  }, [open, variant])

  useEffect(() => {
    if (!open || variant !== "slot") {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open, variant, onClose])

  useEffect(() => {
    if (commitSeq > 0) {
      commentRef.current?.focus()
    }
  }, [commitSeq])

  const selectReaction = (key: Sentiment) => {
    setSentiment(key)
    setStatus("idle")
    setShowRequiredError(false)
  }

  const commitReaction = (key: Sentiment) => {
    selectReaction(key)
    setCommitSeq((seq) => seq + 1)
  }

  const focusableIndex = sentiment
    ? REACTIONS.findIndex((reaction) => reaction.key === sentiment)
    : 0

  const handleReactionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (index + 1) % REACTIONS.length
        break
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (index - 1 + REACTIONS.length) % REACTIONS.length
        break
      case "Home":
        nextIndex = 0
        break
      case "End":
        nextIndex = REACTIONS.length - 1
        break
      default:
        return
    }
    event.preventDefault()
    selectReaction(REACTIONS[nextIndex].key)
    reactionRefs.current[nextIndex]?.focus()
  }

  const handleClose = () => {
    onClose?.()
  }

  const handleSubmit = async () => {
    if (!sentiment || status === "submitting") {
      return
    }
    if (commentMissing) {
      setShowRequiredError(true)
      commentRef.current?.focus()
      return
    }
    setStatus("submitting")
    setRateLimited(false)
    try {
      await onSubmit?.({ sentiment, comment })
      headingRef.current?.focus()
      setStatus("success")
    } catch (error) {
      setRateLimited(
        (error as { status?: number })?.status === RATE_LIMIT_STATUS,
      )
      setStatus("error")
    }
  }

  const handleContainerKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== "Tab") {
      return
    }
    const tabbable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "a[href], button, input, textarea, select, [tabindex]",
      ),
    ).filter((el) => el.tabIndex >= 0 && !(el as HTMLButtonElement).disabled)
    if (tabbable.length === 0) {
      return
    }
    const first = tabbable[0]
    const last = tabbable[tabbable.length - 1]
    const activeEl = document.activeElement
    if (event.shiftKey && activeEl === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && activeEl === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const content = (
    <>
      <Header>
        <Title>
          <RiMegaphoneLine aria-hidden />
          <Heading
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            aria-describedby={questionId}
            data-focus-ring={openedViaKeyboard ? "" : undefined}
          >
            {title}
          </Heading>
        </Title>
        {onReturnToBlock ? (
          <ReturnToBlock type="button" onClick={onReturnToBlock}>
            {returnLabel}
          </ReturnToBlock>
        ) : null}
        {onClose ? (
          <CloseButton
            variant="text"
            size="medium"
            onClick={handleClose}
            aria-label="Close"
          >
            <RiCloseLine />
          </CloseButton>
        ) : null}
      </Header>

      <Body>
        {status === "success" ? (
          <SuccessWrapper ref={successRef} tabIndex={-1}>
            <Alert severity="success">Thank you for your feedback!</Alert>
          </SuccessWrapper>
        ) : (
          <>
            <Question id={questionId}>
              {blockTitle
                ? `What kind of feedback do you have about ${blockTitle}?`
                : friendlyType
                  ? `What kind of feedback do you have about this ${friendlyType} block?`
                  : "What kind of feedback do you have about this content?"}
            </Question>

            <Reactions role="radiogroup" aria-labelledby={questionId}>
              {REACTIONS.map((reaction, index) => {
                const selected = reaction.key === sentiment
                const Icon = selected ? reaction.FillIcon : reaction.LineIcon
                return (
                  <ReactionButton
                    key={reaction.key}
                    ref={(el) => {
                      reactionRefs.current[index] = el
                    }}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={reaction.label}
                    title={reaction.label}
                    tabIndex={index === focusableIndex ? 0 : -1}
                    selected={selected}
                    colorKey={reaction.colorKey}
                    tintAlpha={reaction.tintAlpha}
                    onFocus={() => selectReaction(reaction.key)}
                    onClick={() => commitReaction(reaction.key)}
                    onKeyDown={(event) => handleReactionKeyDown(event, index)}
                  >
                    <Icon />
                  </ReactionButton>
                )
              })}
            </Reactions>

            {active ? (
              <>
                <Prompt>
                  {active.prompt}
                  {commentRequired ? (
                    <RequiredMark aria-hidden="true">*</RequiredMark>
                  ) : null}
                </Prompt>
                <Input
                  multiline
                  minRows={3}
                  fullWidth
                  inputRef={commentRef}
                  value={comment}
                  inputProps={{
                    maxLength: 1000,
                    "aria-label": active.prompt,
                    "aria-required": commentRequired,
                    "aria-invalid": showRequiredError || undefined,
                    "aria-describedby": showRequiredError
                      ? commentErrorId
                      : undefined,
                  }}
                  onChange={(event) => {
                    const value = event.target.value
                    setComment(value)
                    if (showRequiredError && value.trim() !== "") {
                      setShowRequiredError(false)
                    }
                  }}
                />
                {status === "error" ? (
                  <ErrorText role="alert">
                    {rateLimited ? RATE_LIMIT_MESSAGE : GENERIC_ERROR_MESSAGE}
                  </ErrorText>
                ) : showRequiredError ? (
                  <ErrorText id={commentErrorId} role="alert">
                    {COMMENT_REQUIRED_MESSAGE}
                  </ErrorText>
                ) : null}
                <Footer>
                  <Button
                    variant="primary"
                    size="medium"
                    aria-disabled={status === "submitting"}
                    aria-busy={status === "submitting"}
                    startIcon={
                      status === "submitting" ? (
                        <ButtonLoadingIcon />
                      ) : undefined
                    }
                    onClick={handleSubmit}
                  >
                    {status === "submitting" ? "Submitting…" : "Submit"}
                  </Button>
                </Footer>
              </>
            ) : null}
          </>
        )}
      </Body>
    </>
  )

  if (variant === "slot") {
    if (!open) {
      return null
    }
    return (
      // eslint-disable-next-line styled-components-a11y/no-noninteractive-element-interactions
      <Container
        className={className}
        data-smoot-version={VERSION}
        role="region"
        aria-labelledby={headingId}
        onKeyDown={handleContainerKeyDown}
      >
        {content}
      </Container>
    )
  }

  return (
    <Drawer
      data-smoot-version={VERSION}
      className={className}
      anchor="right"
      open={open}
      onClose={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      keepMounted
      PaperProps={{
        sx: {
          width: "420px",
          maxWidth: "100%",
          boxSizing: "border-box",
          borderLeft: (theme) => `1px solid ${theme.custom.colors.lightGray2}`,
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
          padding: {
            xs: "0 16px",
            md: "0 32px",
          },
        },
      }}
    >
      {content}
    </Drawer>
  )
}

export {
  FeedbackDrawer,
  REACTIONS,
  RATE_LIMIT_STATUS,
  RATE_LIMIT_MESSAGE,
  GENERIC_ERROR_MESSAGE,
}
export type { FeedbackDrawerProps, FeedbackData, Sentiment }
