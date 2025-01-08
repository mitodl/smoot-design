const SAMPLE_RESPONSES = [
  `For exploring AI applications in business, I recommend the following course from MIT:

1. **[Machine Learning, Modeling, and Simulation Principles](https://xpro.mit.edu/courses/course-v1:xPRO+MLx1/)**: Offered by MIT xPRO, this course is part of the program "Machine Learning, Modeling, and Simulation: Engineering Problem-Solving in the Age of AI." It focuses on the principles of machine learning and how they can be applied to solve engineering problems, which is highly relevant for business applications of AI.

This course is not free, but it provides a certification upon completion, which can be valuable for professionals looking to apply AI in business contexts. It covers essential concepts that can help you understand how AI can be leveraged to improve business processes and decision-making.
`,
  `
To understand global warming, I recommend the following resources from MIT:

1. **[Global Warming Science](https://www.edx.org/learn/global-warming/massachusetts-institute-of-technology-global-warming-science)**: This course offered by MITx covers the physics, chemistry, biology, and geology of the earth’s climate system. It's a comprehensive introduction to the scientific principles underlying global warming.

2. **[Global Warming Science](https://openlearninglibrary.mit.edu/courses/course-v1:MITx+12.340x+1T2020/about)**: Another offering of the same course by MITx, available through the Open Learning Library. It provides the same in-depth exploration of the earth's climate system.

These courses are free and provide a solid foundation in understanding the scientific aspects of global warming. They are suitable for anyone interested in the topic, regardless of prior knowledge.
`,
  `
Here are some courses on linear algebra that you can explore:

1. **[Linear Algebra (MIT OpenCourseWare)](https://openlearninglibrary.mit.edu/courses/course-v1:OCW+18.06SC+2T2019/about)**: This course covers matrix theory and linear algebra, emphasizing topics useful in various disciplines such as physics, economics, social sciences, natural sciences, and engineering. It parallels the combination of theory and applications in Professor Strang's textbook "Introduction to Linear Algebra." This course is free and available through MIT OpenCourseWare.

2. **[Mathematical Methods for Quantitative Finance (MITx)](https://www.edx.org/learn/finance/massachusetts-institute-of-technology-mathematical-methods-for-quantitative-finance)**: This course covers the mathematical foundations essential for financial engineering and quantitative finance, including linear algebra, optimization, probability, stochastic processes, statistics, and applied computational techniques in R. It is free and offers certification upon completion.

3. **[Quantum Information Science I, Part 1 (MITx)](https://openlearninglibrary.mit.edu/courses/course-v1:MITx+8.370.1x+1T2018/about)**: While primarily focused on quantum information science, this course requires some knowledge of linear algebra and is suitable for those interested in quantum mechanics. It is free and available through MITx.

These courses provide a comprehensive introduction to linear algebra and its applications across various fields.
`,
]

const rand = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const getMessageChunks = () => {
  const response = SAMPLE_RESPONSES[rand(0, SAMPLE_RESPONSES.length - 1)]
  const chunks: string[] = response.split(" ").reduce((acc, word) => {
    const last = acc[acc.length - 1]
    if (acc.length === 0) {
      acc.push(word)
    } else if (Math.random() < 0.75) {
      acc[acc.length - 1] = `${last} ${word}`
    } else {
      acc.push(` ${word}`)
    }
    return acc
  }, [] as string[])
  return chunks
}
const processChunks = (
  chunks: string[],
  {
    onChunk,
    onDone,
  }: {
    onChunk: (chunk: string) => void
    onDone?: () => void
  },
) => {
  let i = 0
  const num = chunks.length
  const timerId = setInterval(() => {
    onChunk(chunks[i])
    i++
    if (i === num) {
      onDone?.()
      clearInterval(timerId)
    }
  }, 250)
}

const mockStreaming = async function mockApi() {
  let timerId: NodeJS.Timeout
  const chunks = getMessageChunks()

  await new Promise((resolve) => setTimeout(resolve, 1500))

  const body = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      processChunks(chunks, {
        onChunk: (chunk) => {
          encoder.encode(chunk)
        },
        onDone: () => {
          controller.close()
        },
      })
    },
    cancel() {
      if (timerId) {
        clearInterval(timerId)
      }
    },
  })

  return Promise.resolve(
    new Response(body, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    }),
  )
}

const mockJson = async () => {
  const message = SAMPLE_RESPONSES[rand(0, SAMPLE_RESPONSES.length - 1)]
  await new Promise((res) => setTimeout(res, 2000))
  return Promise.resolve(
    new Response(JSON.stringify({ message }), {
      headers: {
        "Content-Type": "application/json",
      },
    }),
  )
}

class MockWebSocket extends EventTarget {
  readyState: WebSocket["readyState"] = WebSocket.CONNECTING

  constructor(public readonly url: string) {
    super()
    this.url = url

    setTimeout(() => {
      this.readyState = WebSocket.OPEN
      this.dispatchEvent(new Event("open"))
    }, 300)
  }

  async send(_data: string) {
    const chunks = getMessageChunks()
    await new Promise((res) => setTimeout(res, 400))
    processChunks(chunks, {
      onChunk: (chunk) => {
        const event = new Event("message")
        // @ts-expect-error Should be passed to constructor, but the event isn't trusted.
        event.data = chunk
        this.dispatchEvent(event)
      },
      onDone: () => {
        const event = new Event("message")
        // @ts-expect-error Should be passed to constructor, but the event isn't trusted.
        event.data = "!endResponse"
      },
    })
  }
}

export { mockStreaming, mockJson, MockWebSocket }
