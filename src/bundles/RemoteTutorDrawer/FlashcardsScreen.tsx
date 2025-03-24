import { ActionButton } from "../../components/Button/ActionButton"
import Typography from "@mui/material/Typography"
import * as React from "react"
import { useState, useCallback, useEffect } from "react"
import styled from "@emotion/styled"
import { RiArrowRightLine, RiArrowLeftLine } from "@remixicon/react"

export type Flashcard = {
  question: string
  answer: string
}

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

enum Screen {
  Question = "question",
  Answer = "answer",
}

const Flashcard = ({ content }: { content: Flashcard }) => {
  const [screen, setScreen] = useState<Screen>(Screen.Question)
  return (
    <FlashcardContainer
      onClick={() =>
        setScreen(screen === Screen.Question ? Screen.Answer : Screen.Question)
      }
    >
      <Typography variant="h5">
        {screen === Screen.Question
          ? `Q: ${content.question}`
          : `A: ${content.answer}`}
      </Typography>
    </FlashcardContainer>
  )
}

export const FlashcardsScreen = ({
  flashcards,
}: {
  flashcards?: Flashcard[]
}) => {
  const [cardIndex, setCardIndex] = useState(0)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!flashcards) return

      if (e.key === "ArrowRight") {
        setCardIndex((prevIndex) => (prevIndex + 1) % flashcards.length)
      } else if (e.key === "ArrowLeft") {
        setCardIndex(
          (prevIndex) =>
            (prevIndex - 1 + flashcards.length) % flashcards.length,
        )
      }
    },
    [flashcards],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  if (!flashcards) {
    return null
  }

  return (
    <>
      <Flashcard key={cardIndex} content={flashcards[cardIndex]} />
      <Navigation>
        <ActionButton
          onClick={() => setCardIndex(cardIndex - 1)}
          disabled={cardIndex === 0}
          variant="secondary"
          color="secondary"
          size="small"
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
        >
          <RiArrowRightLine aria-hidden />
        </ActionButton>
      </Navigation>
    </>
  )
}
