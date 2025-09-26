import { http, HttpResponse, delay } from "msw"

const SAMPLE_RESPONSES = [
  `For exploring AI applications in business, I recommend the following course from MIT:

1. **[Machine Learning, Modeling, and Simulation Principles](https://xpro.mit.edu/courses/course-v1:xPRO+MLx1/)**: Offered by MIT xPRO, this course is part of the program "Machine Learning, Modeling, and Simulation: Engineering Problem-Solving in the Age of AI." It focuses on the principles of machine learning and how they can be applied to solve engineering problems, which is highly relevant for business applications of AI.

This course is not free, but it provides a certification upon completion, which can be valuable for professionals looking to apply AI in business contexts. It covers essential concepts that can help you understand how AI can be leveraged to improve business processes and decision-making.
Here is some inline  math: $x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$

And some block math:
\n

$$
x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}
$$

<!-- Comment! -->
`,
  `
To understand global warming, I recommend the following resources from MIT:

1. **[Global Warming Science](https://www.edx.org/learn/global-warming/massachusetts-institute-of-technology-global-warming-science)**: This course offered by MITx covers the physics, chemistry, biology, and geology of the earth’s climate system. It's a comprehensive introduction to the scientific principles underlying global warming.

2. **[Global Warming Science](https://openlearninglibrary.mit.edu/courses/course-v1:MITx+12.340x+1T2020/about)**: Another offering of the same course by MITx, available through the Open Learning Library. It provides the same in-depth exploration of the earth's climate system.

These courses are free and provide a solid foundation in understanding the scientific aspects of global warming. They are suitable for anyone interested in the topic, regardless of prior knowledge.
Here is some inline  math: $x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$

And some block math:
\n

$$
x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}
$$

<!-- Comment! -->
`,
  `
Here are some courses on linear algebra that you can explore:

1. **[Linear Algebra (MIT OpenCourseWare)](https://openlearninglibrary.mit.edu/courses/course-v1:OCW+18.06SC+2T2019/about)**: This course covers matrix theory and linear algebra, emphasizing topics useful in various disciplines such as physics, economics, social sciences, natural sciences, and engineering. It parallels the combination of theory and applications in Professor Strang's textbook "Introduction to Linear Algebra." This course is free and available through MIT OpenCourseWare.

2. **[Mathematical Methods for Quantitative Finance (MITx)](https://www.edx.org/learn/finance/massachusetts-institute-of-technology-mathematical-methods-for-quantitative-finance)**: This course covers the mathematical foundations essential for financial engineering and quantitative finance, including linear algebra, optimization, probability, stochastic processes, statistics, and applied computational techniques in R. It is free and offers certification upon completion.

3. **[Quantum Information Science I, Part 1 (MITx)](https://openlearninglibrary.mit.edu/courses/course-v1:MITx+8.370.1x+1T2018/about)**: While primarily focused on quantum information science, this course requires some knowledge of linear algebra and is suitable for those interested in quantum mechanics. It is free and available through MITx.

These courses provide a comprehensive introduction to linear algebra and its applications across various fields.

Here is some inline  math: $x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$

And some block math:
\n

$$
x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}
$$

<!-- Comment! -->
`,
  `Here are some courses on quantum computing that offer certificates:

1. [Introduction to Quantum Computing](https://xpro.mit.edu/courses/course-v1:xPRO+QCFx1/)
   - **Description**: This is the first course in the Quantum Computing Fundamentals professional certificate program. You can earn a Professional Certificate and CEUs by completing both courses in the program. Alternatively, you can take this course individually for a certificate of completion and CEUs.
   - **Offered by**: MIT xPRO
   - **Instructors**: Isaac Chuang, William Oliver, Peter Shor, Aram Harrow

2. [Practical Realities of Quantum Computation and Quantum Communication](https://xpro.mit.edu/courses/course-v1:xPRO+QCRx1/)
   - **Description**: This course is part of the Quantum Computing Realities professional certificate program. Completing both courses in the program will earn you a Professional Certificate and CEUs. You can also take this course individually for a certificate of completion and CEUs.
   - **Offered by**: MIT xPRO
   - **Instructors**: Isaac Chuang, William Oliver, Peter Shor, Aram Harrow

These courses are part of professional certificate programs, and you can choose to complete the entire program or take individual courses for certification.


Here is some inline  math: $x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$

And some block math:
\n

$$
x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}
$$
`,
  `Great question! Let's start by understanding what the problem is asking. You need to prove that the Adaptive Lasso is equivalent to a robust regression problem with a specific perturbation in the data matrix.

To begin, consider the two expressions given in the problem:

1. The Adaptive Lasso objective:
   $$\\min_{\\boldsymbol{\\beta}} \\| \\mathbf{y} - \\mathbf{X} \\boldsymbol{\\beta} \\|_2 + \\lambda \\| \\mathbf{W}\\boldsymbol{\\beta}\\|_1$$

2. The robust regression problem:
   $$\\min_{\\boldsymbol{\\beta}} \\max_{ \\mathbf{\\Delta} \\in \\mathcal{U}} \\| \\mathbf{y} - (\\mathbf{X} + \\mathbf{\\Delta} )\\boldsymbol{\\beta} \\|_2$$

The goal is to show that these two are equivalent.

Start by thinking about what the perturbation $\\mathbf{\\Delta}$ represents in the context of the robust regression problem. How does it relate to the weights $\\mathbf{W}$ in the Adaptive Lasso? What role does the uncertainty set $\\mathcal{U}$ play in this equivalence?

Once you have a sense of these relationships, consider how you might manipulate the expressions to show they are equivalent. What properties of norms and perturbations can you use to bridge the gap between these two formulations?

Here's an advanced mathematical analysis involving various AMS symbols and operators:

## Analysis with AMS Symbols

Let's explore some advanced mathematical concepts using specialized notation:

### Approximation and Equivalence Relations

The function $f(x)$ can be approximated as:
$$f(x) \\approxeq g(x) + O(h^2)$$

where $g(x) \\asymp h(x)$ for large values of $x$.

### Set Theory and Logic

Consider the following relationships:
$$A \\subseteq B \\iff \\forall x \\in A, x \\in B$$
$$A \\subsetneq B \\iff A \\subseteq B \\land A \\neq B$$

The symmetric difference is defined as:
$$A \\triangle B = (A \\setminus B) \\cup (B \\setminus A)$$

### Advanced Inequalities and Comparisons

For sequences $\\{a_n\\}$ and $\\{b_n\\}$:
$$a_n \\lesssim b_n \\iff \\limsup_{n \\to \\infty} \\frac{a_n}{b_n} < \\infty$$
$$a_n \\gtrsim b_n \\iff b_n \\lesssim a_n$$
$$a_n \\eqsim b_n \\iff a_n \\lesssim b_n \\land b_n \\lesssim a_n$$

### Geometric Relations

In geometric analysis, we often encounter:
$$\\angle ABC \\cong \\angle DEF$$
$$\\triangle ABC \\sim \\triangle XYZ$$

Where lines can be:
- Parallel: $\\ell_1 \\parallel \\ell_2$
- Perpendicular: $\\ell_1 \\perp \\ell_2$

### Advanced Operators

The convolution operator:
$$f \\ast g = \\int_{-\\infty}^{\\infty} f(t)g(x-t) dt$$

And the composition:
$$f \\circ g = f(g(x))$$

### Logical Implications

$$P \\implies Q \\iff \\neg P \\lor Q$$
$$P \\iff Q \\iff (P \\implies Q) \\land (Q \\implies P)$$

These symbols are essential in advanced mathematical notation and provide precise ways to express complex relationships.

## Physics Package Examples

The physics package provides convenient macros for mathematical notation commonly used in physics:

#### Absolute Values and Norms
$$\\abs{x} = |x|$$
$$\\absolutevalue{\\psi} = |\\psi|$$

#### Trigonometric Functions
$$\\acos{x} = \\arccos(x)$$
$$\\acosine{x} = \\arccos(x)$$
$$\\acomm{A}{B} = [A, B]_+$$

#### Inverse Trigonometric Functions
$$\\acosecant{x} = \\csc^{-1}(x)$$
$$\\acsc{x} = \\csc^{-1}(x)$$
$$\\acot{x} = \\cot^{-1}(x)$$
$$\\acotangent{x} = \\cot^{-1}(x)$$

#### Derivatives and Differentials
$$\\dd{x} \\quad \\text{differential}$$
$$\\dv{f}{x} = \\frac{df}{dx} \\quad \\text{derivative}$$
$$\\pdv{f}{x} = \\frac{\\partial f}{\\partial x} \\quad \\text{partial derivative}$$
$$\\fdv{f}{x}{y} = \\frac{d^2f}{dxdy} \\quad \\text{functional derivative}$$

#### Vector Notation
$$\\vb{v} = \\mathbf{v} \\quad \\text{vector bold}$$
$$\\vb*{F} = \\vec{F} \\quad \\text{vector arrow}$$
$$\\vu{n} = \\hat{n} \\quad \\text{unit vector}$$
$$\\va{a} = \\vec{a} \\quad \\text{vector arrow}$$

#### Vector Operations
$$\\grad f = \\nabla f \\quad \\text{gradient}$$
$$\\div \\vb{F} = \\nabla \\cdot \\vb{F} \\quad \\text{divergence}$$
$$\\curl \\vb{F} = \\nabla \\times \\vb{F} \\quad \\text{curl}$$
$$\\laplacian f = \\nabla^2 f \\quad \\text{laplacian}$$

#### Quantum Mechanics
$$\\bra{\\psi} \\quad \\text{bra notation}$$
$$\\ket{\\phi} \\quad \\text{ket notation}$$
$$\\braket{\\psi}{\\phi} \\quad \\text{inner product}$$
$$\\ketbra{\\psi}{\\phi} \\quad \\text{outer product}$$
$$\\expectationvalue{A}{\\psi} = \\langle\\psi|A|\\psi\\rangle \\quad \\text{expectation value}$$
$$\\matrixelement{i}{A}{j} = \\langle i|A|j\\rangle \\quad \\text{matrix element}$$

#### Commutators and Anticommutators
$$\\comm{A}{B} = [A,B] = AB - BA \\quad \\text{commutator}$$
$$\\acomm{A}{B} = \\{A,B\\} = AB + BA \\quad \\text{anticommutator}$$
$$\\poissonbracket{f}{g} = \\{f,g\\} \\quad \\text{Poisson bracket}$$

#### Matrix Notation
$$\\mqty(a & b \\\\ c & d) \\quad \\text{matrix quantity with parentheses}$$
$$\\mqty[a & b \\\\ c & d] \\quad \\text{matrix quantity with brackets}$$
$$\\pqty{\\frac{a}{b}} \\quad \\text{parentheses quantity}$$
$$\\bqty{\\frac{a}{b}} \\quad \\text{bracket quantity}$$

#### Special Functions and Constants
$$\\Re{z} \\quad \\text{real part}$$
$$\\Im{z} \\quad \\text{imaginary part}$$
$$\\Tr{A} \\quad \\text{trace}$$
$$\\det{A} \\quad \\text{determinant}$$
$$\\rank{A} \\quad \\text{rank}$$
$$\\norm{\\vb{v}} \\quad \\text{norm}$$

#### Order and Evaluation
$$\\order{x^2} \\quad \\text{order notation}$$
$$\\eval{f(x)}_{x=0} \\quad \\text{evaluated at}$$
$$\\qty(\\frac{\\partial f}{\\partial x})_{y} \\quad \\text{quantity with subscript}$$
`,
]

const rand = (min: number, max: number) => {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

const getReadableStream = (index?: number) => {
  let timerId: NodeJS.Timeout
  const response =
    SAMPLE_RESPONSES[index ?? rand(0, SAMPLE_RESPONSES.length - 1)]
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

  const num = chunks.length
  let i = 0

  return new ReadableStream({
    start(controller) {
      timerId = setInterval(() => {
        const msg = new TextEncoder().encode(chunks[i])
        controller.enqueue(msg)
        i++
        if (i === num) {
          controller.close()
          clearInterval(timerId)
        }
      }, 100)
    },
    cancel() {
      if (timerId) {
        clearInterval(timerId)
      }
    },
  })
}

const handlers = [
  http.post("http://localhost:4567/streaming", async ({ request }) => {
    await delay(600)
    const body = getReadableStream()

    const requestBody = await request.json()
    if (Array.isArray(requestBody)) {
      const last = requestBody[requestBody.length - 1]
      const { content } = last
      if (content === "error") {
        return new HttpResponse("Internal Server Error", {
          status: 500,
        })
      }
    }

    return new HttpResponse(body, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }),
  http.post("http://localhost:4567/streaming-math", async () => {
    await delay(600)
    const body = getReadableStream(4)
    return new HttpResponse(body, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }),
  http.post("http://localhost:4567/json", async () => {
    const message = SAMPLE_RESPONSES[rand(0, SAMPLE_RESPONSES.length - 1)]
    await delay(800)
    return HttpResponse.json({ message })
  }),
]

export { handlers }
