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
  ({ content, ...others }, ref) => {
    const [screen, setScreen] = useState<0 | 1>(0)

    useEffect(() => setScreen(0), [content])

    const handleClick = () => {
      setScreen((current) => (current === 0 ? 1 : 0))
    }

    return (
      <FlashcardContainer
        ref={ref}
        type="button"
        onClick={handleClick}
        tabIndex={0}
        {...others}
      >
        <Typography variant="h5">
          {screen === 0 ? (
            <>
              <span aria-label="Question:">Q: </span>
              {content.question}
            </>
          ) : (
            <>
              <span>Answer: </span>
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
  wasKeyboardFocus,
}: {
  flashcards: Flashcard[]
  wasKeyboardFocus: boolean
}) => {
  const [cardIndex, setCardIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const flashcardRef = useRef<HTMLButtonElement>(null)

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

  return (
    <Container ref={containerRef}>
      <div
        role="region"
        aria-label={`Flashcard ${cardIndex + 1} of ${flashcards.length}`}
      >
        <Flashcard ref={flashcardRef} content={flashcards[cardIndex]} />
      </div>
      <Navigation>
        <ActionButton
          onClick={() => setCardIndex(cardIndex - 1)}
          disabled={cardIndex === 0}
          variant="secondary"
          color="secondary"
          size="small"
          aria-label="Previous card"
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
          aria-label="Next card"
        >
          <RiArrowRightLine aria-hidden />
        </ActionButton>
      </Navigation>
    </Container>
  )
}
