import { ActionButton } from "../../components/Button/ActionButton"
import Typography from "@mui/material/Typography"
import * as React from "react"
import { useState, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import { RiArrowRightLine, RiArrowLeftLine } from "@remixicon/react"
import {
  useTranslation,
  TRANSLATION_KEYS,
} from "../../contexts/TranslationContext"

export type Flashcard = {
  question: string
  answer: string
}

const Container = styled.div``

const FlashcardContainer = styled.button(({ theme }) => ({
  display: "flex",
  width: "100%",
  height: 300,
  padding: 40,
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "stretch",
  borderRadius: 8,
  border: `1px solid ${theme.custom.colors.lightGray2}`,
  marginTop: "8px",
  cursor: "pointer",
  textAlign: "center",
  background: "none",
}))

const FlashcardPanel = styled.div<{ $focused: boolean }>(
  ({ theme, $focused }) => ({
    ...($focused && {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 4,
      borderRadius: 8,
    }),
  }),
)

const Navigation = styled.div({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  marginTop: "24px",
})

const Page = styled.div(({ theme }) => ({
  color: theme.custom.colors.silverGrayDark,
  ...theme.typography.body2,
}))

const SrOnly = styled.div({
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
})

const Flashcard = ({
  content,
  screen,
  onClick,
}: {
  content: Flashcard
  screen: 0 | 1
  onClick: () => void
}) => {
  const { t } = useTranslation()

  return (
    <FlashcardContainer type="button" onClick={onClick} tabIndex={-1}>
      <Typography variant="h5">
        {screen === 0 ? (
          <>
            <span aria-label={t(TRANSLATION_KEYS.flashcards.questionAria)}>
              {t(TRANSLATION_KEYS.flashcards.question)}
            </span>
            {content.question}
          </>
        ) : (
          <>
            <span>{t(TRANSLATION_KEYS.flashcards.answer)}</span>
            {content.answer}
          </>
        )}
      </Typography>
    </FlashcardContainer>
  )
}

export const FlashcardsScreen = ({
  flashcards,
}: {
  flashcards: Flashcard[]
}) => {
  const { t } = useTranslation()
  const [cardIndex, setCardIndex] = useState(0)
  const [screen, setScreen] = useState<0 | 1>(0)
  const [appFocused, setAppFocused] = useState(false)
  const [liveAnnouncement, setLiveAnnouncement] = useState("")
  const prevButtonRef = useRef<HTMLButtonElement>(null)
  const nextButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setScreen(0)
  }, [cardIndex])

  const cardAnnouncement = (index: number) =>
    `${t(TRANSLATION_KEYS.flashcards.count, { index: index + 1, total: flashcards.length })}: ${flashcards[index].question}`

  const goToPrev = () => {
    const next = Math.max(cardIndex - 1, 0)
    setCardIndex(next)
    setLiveAnnouncement(cardAnnouncement(next))
    if (next === 0) nextButtonRef.current?.focus()
  }

  const goToNext = () => {
    const next = Math.min(cardIndex + 1, flashcards.length - 1)
    setCardIndex(next)
    setLiveAnnouncement(cardAnnouncement(next))
    if (next === flashcards.length - 1) prevButtonRef.current?.focus()
  }

  const handleFlip = () => {
    const next = screen === 0 ? 1 : 0
    setScreen(next)
    setLiveAnnouncement(
      next === 0
        ? `${t(TRANSLATION_KEYS.flashcards.questionAria)} ${flashcards[cardIndex].question}`
        : `${t(TRANSLATION_KEYS.flashcards.answer)} ${flashcards[cardIndex].answer}`,
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      setCardIndex((prev) => {
        const next = Math.min(prev + 1, flashcards.length - 1)
        setLiveAnnouncement(cardAnnouncement(next))
        return next
      })
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      setCardIndex((prev) => {
        const next = Math.max(prev - 1, 0)
        setLiveAnnouncement(cardAnnouncement(next))
        return next
      })
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleFlip()
    }
  }

  return (
    <Container>
      <SrOnly>
        {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <div
          role="application"
          tabIndex={0} // Make the div focusable to capture keyboard events
          aria-label={t(TRANSLATION_KEYS.aiDrawer.tabLabelFlashcards)}
          onFocus={() => {
            setAppFocused(true)
            setLiveAnnouncement(cardAnnouncement(cardIndex))
          }}
          onBlur={() => setAppFocused(false)}
          onKeyDown={handleKeyDown}
        />
        {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <span aria-live="polite">{liveAnnouncement}</span>
      </SrOnly>
      <FlashcardPanel $focused={appFocused}>
        <Flashcard
          content={flashcards[cardIndex]}
          screen={screen}
          onClick={handleFlip}
        />
      </FlashcardPanel>
      <Navigation>
        <ActionButton
          ref={prevButtonRef}
          onClick={goToPrev}
          disabled={cardIndex === 0}
          variant="secondary"
          color="secondary"
          size="small"
          aria-label={t(TRANSLATION_KEYS.flashcards.previous)}
        >
          <RiArrowLeftLine aria-hidden />
        </ActionButton>
        <Page aria-hidden>
          {cardIndex + 1} / {flashcards.length}
        </Page>
        <ActionButton
          ref={nextButtonRef}
          onClick={goToNext}
          disabled={cardIndex === flashcards.length - 1}
          variant="secondary"
          color="secondary"
          size="small"
          aria-label={t(TRANSLATION_KEYS.flashcards.next)}
        >
          <RiArrowRightLine aria-hidden />
        </ActionButton>
      </Navigation>
    </Container>
  )
}
