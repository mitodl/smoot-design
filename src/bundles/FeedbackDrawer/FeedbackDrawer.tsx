import * as React from "react"
import { FC, useEffect, useId, useRef, useState } from "react"
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
  RiCheckLine,
} from "@remixicon/react"
import type { RemixiconComponentType } from "@remixicon/react"
import { ActionButton } from "../../components/Button/ActionButton"
import { Button, ButtonLoadingIcon } from "../../components/Button/Button"
import { Input } from "../../components/Input/Input"
import { VERSION } from "../../VERSION"

// A 429 from the submit endpoint means the learner is being throttled; the
// status and both error strings live here so the check + copy stay in one
// place, are reusable in tests, and give us a single spot to localize later.
const RATE_LIMIT_STATUS = 429
const RATE_LIMIT_MESSAGE =
  "You're sending feedback too quickly. Please wait a moment and try again."
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again."

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
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "4px",
  position: "sticky",
  top: 0,
  padding: "32px 0 16px 0",
  zIndex: 2,
  backgroundColor: theme.custom.colors.white,
}))

const Title = styled.div(({ theme }) => ({
  display: "flex",
  alignItems: "flex-start",
  gap: "8px",
  flex: 1,
  minWidth: 0,
  color: theme.custom.colors.darkGray2,
  svg: {
    fill: theme.custom.colors.silverGrayDark,
    width: "24px",
    height: "24px",
    flexShrink: 0,
    marginTop: "2px",
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
  ...theme.typography.body1,
  flex: 1,
  minWidth: 0,
  margin: 0,
  color: theme.custom.colors.darkGray2,
  overflowWrap: "anywhere",
}))

const BlockName = styled.span(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}))

const Body = styled.div({
  paddingBottom: "32px",
})

const Question = styled.h2(({ theme }) => ({
  ...theme.typography.subtitle1,
  color: theme.custom.colors.darkGray2,
  margin: "0 0 12px",
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

const Success = styled.div(({ theme }) => ({
  ...theme.typography.subtitle1,
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: theme.custom.colors.darkGreen,
  padding: "8px 0",
  svg: {
    fill: theme.custom.colors.darkGreen,
    width: "22px",
    height: "22px",
    flexShrink: 0,
  },
}))

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
  onClose?: () => void
  onSubmit?: (data: FeedbackData) => Promise<void> | void
  /** Drawer heading. */
  title?: string
  /** Content title (block/unit) shown under the heading. */
  subtitle?: string
  defaultSentiment?: Sentiment
}

const FeedbackDrawer: FC<FeedbackDrawerProps> = ({
  className,
  variant = "drawer",
  open,
  onClose,
  onSubmit,
  title = "Share your feedback",
  subtitle,
  defaultSentiment,
}) => {
  const [sentiment, setSentiment] = useState<Sentiment | null>(
    defaultSentiment ?? null,
  )
  const [comment, setComment] = useState("")
  const [status, setStatus] = useState<SubmitStatus>("idle")
  const [rateLimited, setRateLimited] = useState(false)

  const active =
    REACTIONS.find((reaction) => reaction.key === sentiment) ?? null

  const reactionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const successRef = useRef<HTMLDivElement | null>(null)
  const headingId = useId()

  // Move focus to the success message so screen-reader users are told the
  // submission succeeded (role="status" alone isn't reliably announced when the
  // node is newly rendered).
  useEffect(() => {
    if (status === "success") {
      successRef.current?.focus()
    }
  }, [status])

  const selectReaction = (key: Sentiment) => {
    setSentiment(key)
    setStatus("idle")
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
    if (!sentiment) {
      return
    }
    setStatus("submitting")
    setRateLimited(false)
    try {
      await onSubmit?.({ sentiment, comment })
      setStatus("success")
    } catch (error) {
      setRateLimited(
        (error as { status?: number })?.status === RATE_LIMIT_STATUS,
      )
      setStatus("error")
    }
  }

  const content = (
    <>
      <Header>
        <Title>
          <RiMegaphoneLine aria-hidden />
          <Heading id={headingId}>
            {subtitle ? (
              <>
                {title} about <BlockName>{subtitle}</BlockName>
              </>
            ) : (
              title
            )}
          </Heading>
        </Title>
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
          <Success ref={successRef} role="status" tabIndex={-1}>
            <RiCheckLine aria-hidden /> Thank you for your feedback!
          </Success>
        ) : (
          <>
            <Question>How was this content?</Question>

            <Reactions role="radiogroup" aria-label="How would you rate this?">
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
                    onClick={() => selectReaction(reaction.key)}
                    onKeyDown={(event) => handleReactionKeyDown(event, index)}
                  >
                    <Icon />
                  </ReactionButton>
                )
              })}
            </Reactions>

            {active ? (
              <>
                <Prompt>{active.prompt}</Prompt>
                <Input
                  multiline
                  minRows={3}
                  fullWidth
                  value={comment}
                  inputProps={{ maxLength: 1000, "aria-label": active.prompt }}
                  onChange={(event) => setComment(event.target.value)}
                />
                {status === "error" ? (
                  <ErrorText role="alert">
                    {rateLimited ? RATE_LIMIT_MESSAGE : GENERIC_ERROR_MESSAGE}
                  </ErrorText>
                ) : null}
                <Footer>
                  <Button
                    variant="primary"
                    size="medium"
                    disabled={status === "submitting"}
                    aria-busy={status === "submitting"}
                    startIcon={
                      status === "submitting" ? (
                        <ButtonLoadingIcon />
                      ) : undefined
                    }
                    onClick={handleSubmit}
                  >
                    Submit
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
      <Container className={className} data-smoot-version={VERSION}>
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
