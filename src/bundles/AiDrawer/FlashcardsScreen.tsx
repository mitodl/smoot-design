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

const Flashcard = React.forwardRef<HTMLButtonElement, { content: Flashcard }>(
  ({ content }, ref) => {
    const { t } = useTranslation()
    const [screen, setScreen] = useState<0 | 1>(0)

    useEffect(() => {
      setScreen(0)
    }, [content])

    const handleClick = () => {
      setScreen((current) => (current === 0 ? 1 : 0))
    }

    return (
      <FlashcardContainer
        ref={ref}
        type="button"
        onClick={handleClick}
        tabIndex={0}
        aria-live="polite"
        aria-atomic="true"
      >
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
  },
)

Flashcard.displayName = "Flashcard"

export const FlashcardsScreen = ({
  flashcards,
}: {
  flashcards: Flashcard[]
}) => {
  const { t } = useTranslation()
  const [cardIndex, setCardIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return
      if (e.key === "ArrowRight") {
        e.preventDefault()
        setCardIndex((prev) => (prev + 1) % flashcards.length)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        setCardIndex(
          (prev) => (prev - 1 + flashcards.length) % flashcards.length,
        )
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [flashcards])

  return (
    <Container ref={containerRef}>
      <div
        role="region"
        aria-label={t(TRANSLATION_KEYS.flashcards.count, {
          index: cardIndex + 1,
          total: flashcards.length,
        })}
      >
        <Flashcard content={flashcards[cardIndex]} />
      </div>
      <Navigation>
        <ActionButton
          onClick={() => setCardIndex(cardIndex - 1)}
          disabled={cardIndex === 0}
          variant="secondary"
          color="secondary"
          size="small"
          aria-label={t(TRANSLATION_KEYS.flashcards.previous)}
        >
          <RiArrowLeftLine aria-hidden />
        </ActionButton>
        {/* Hide the index count here. It's used as a region label above. */}
        <Page aria-hidden>
          {cardIndex + 1} / {flashcards.length}
        </Page>
        <ActionButton
          onClick={() => setCardIndex(cardIndex + 1)}
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
