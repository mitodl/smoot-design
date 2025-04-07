import { ActionButton } from "../../components/Button/ActionButton"
import Typography from "@mui/material/Typography"
import * as React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import styled from "@emotion/styled"
import { RiArrowRightLine, RiArrowLeftLine } from "@remixicon/react"

export type Flashcard = {
  question: string
  answer: string
}

const Container = styled.div``

const FlashcardContainer = styled.div(({ theme }) => ({
  display: "flex",
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

const Flashcard = React.forwardRef<
  HTMLDivElement,
  { content: Flashcard; "aria-label": string }
>(({ content, "aria-label": ariaLabel }, ref) => {
  const [screen, setScreen] = useState<0 | 1>(0)

  useEffect(() => setScreen(0), [content])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      setScreen(screen === 0 ? 1 : 0)
    }
  }

  console.log(
    ">>>>>>>>>>>>>>>>>>>>>>>>>>>>",
    screen === 0 ? `Q: ${content.question}` : `Answer: ${content.answer}`,
  )
  return (
    <FlashcardContainer
      ref={ref}
      onClick={() => setScreen(screen === 0 ? 1 : 0)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <Typography variant="h5">
        {screen === 0 ? `Q: ${content.question}` : `Answer: ${content.answer}`}
      </Typography>
    </FlashcardContainer>
  )
})

Flashcard.displayName = "Flashcard"

export const FlashcardsScreen = ({
  flashcards,
  wasKeyboardFocus,
}: {
  flashcards?: Flashcard[]
  wasKeyboardFocus: boolean
}) => {
  const [cardIndex, setCardIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const flashcardRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!flashcards) return
      if (
        !containerRef.current?.contains(document.activeElement) &&
        wasKeyboardFocus
      ) {
        return
      }
      if (e.key === "ArrowRight") {
        setCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length)
      } else if (e.key === "ArrowLeft") {
        setCardIndex(
          (prevIndex) =>
            (prevIndex - 1 + flashcards.length) % flashcards.length,
        )
      }
    },
    [flashcards, wasKeyboardFocus],
  )
  useEffect(() => {
    flashcardRef.current?.focus()
  }, [cardIndex])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  if (!flashcards?.length) {
    return null
  }

  return (
    <Container ref={containerRef}>
      <Flashcard
        ref={flashcardRef}
        content={flashcards[cardIndex]}
        aria-label={`Flashcard ${cardIndex + 1} of ${flashcards.length}`}
      />
      <Navigation>
        <ActionButton
          onClick={() => setCardIndex(cardIndex - 1)}
          disabled={cardIndex === 0}
          variant="secondary"
          color="secondary"
          size="small"
          aria-label="Left arrow"
        >
          <RiArrowLeftLine aria-hidden />
        </ActionButton>
        <Page>
          {cardIndex + 1} / {flashcards.length}
        </Page>
        <ActionButton
          onClick={() => setCardIndex(cardIndex + 1)}
          disabled={cardIndex === flashcards.length - 1}
          variant="secondary"
          color="secondary"
          size="small"
          aria-label="Right arrow"
        >
          <RiArrowRightLine aria-hidden />
        </ActionButton>
      </Navigation>
    </Container>
  )
}
