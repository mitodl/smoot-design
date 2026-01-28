import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs"
import invariant from "tiny-invariant"
import { http, HttpResponse } from "msw"
import { handlers } from "../../components/AiChat/test-utils/api"
import { AiDrawerManager } from "./AiDrawerManager"
import type { AiDrawerInitMessage } from "./AiDrawerManager"

type InitPayload = AiDrawerInitMessage["payload"]

const TEST_API_STREAMING = "http://localhost:4567/streaming"
const TRACKING_EVENTS_ENDPOINT = "http://localhost:4567/tracking-events"
const CONTENT_FILE_URL =
  "http://localhost:4567/api/v1/contentfiles/?edx_module_id=1"

const INITIAL_MESSAGES: InitPayload["chat"]["initialMessages"] = [
  {
    content: "Hi! What are you interested in learning about?",
    role: "assistant",
  },
]

const STARTERS = [
  { content: "I'm interested in quantum computing" },
  { content: "I want to understand global warming. " },
  { content: "I am curious about AI applications for business" },
]

const buildIFrame = (payload: InitPayload) => (el: HTMLIFrameElement) => {
  if (!el) return
  const doc = el.contentDocument
  const parent = el.contentWindow?.parent
  invariant(doc && parent)

  const button = doc.createElement("button")
  button.style["padding"] = "6px"
  button.textContent = "Open drawer (send message to parent)"
  doc.body.appendChild(button)

  doc.body.style.fontFamily = "Nunito Sans, sans-serif"
  doc.body.style.color = "#2e3438"

  const div = doc.createElement("div")
  doc.body.appendChild(div)

  const p = doc.createElement("p")
  p.textContent = "Message Data:"
  div.appendChild(p)

  const textarea = doc.createElement("textarea")
  div.append(textarea)
  textarea.style["display"] = "block"
  textarea.style["width"] = "100%"
  textarea.style["height"] = "500px"

  const message: AiDrawerInitMessage = {
    type: "smoot-design::tutor-drawer-open",
    payload,
  }
  textarea.value = JSON.stringify(message, null, 2)
  button.addEventListener("click", () => {
    parent.postMessage(JSON.parse(textarea.value))
  })
}

const IFrame = ({ payload }: { payload: InitPayload }) => {
  return (
    <iframe
      width="100%"
      height="600px"
      ref={buildIFrame(payload)}
      title="button frame"
    />
  )
}

const meta: Meta<typeof AiDrawerManager> = {
  title: "smoot-design/AI/AiDrawerManager",
  component: AiDrawerManager,
  render: () => (
    <div style={{ fontFamily: "Nunito Sans, sans-serif", color: "#2e3438" }}>
      <h3>Tutor Bot</h3>
      <IFrame
        payload={{
          blockType: "problem",
          blockUsageKey: "problem-frame",
          title: "AskTIM for help with Problem: Derivatives 1.1",
          trackingUrl: TRACKING_EVENTS_ENDPOINT,
          chat: {
            apiUrl: TEST_API_STREAMING,
            initialMessages: INITIAL_MESSAGES,
            conversationStarters: STARTERS,
          },
        }}
      />
      <h3>Tutor Bot with default initial messages</h3>
      <IFrame
        payload={{
          blockType: "problem",
          blockUsageKey: "problem-frame-default",
          title: "AskTIM for help with Problem: Derivatives 1.1",
          trackingUrl: TRACKING_EVENTS_ENDPOINT,
          chat: {
            apiUrl: TEST_API_STREAMING,
            conversationStarters: STARTERS,
          },
        }}
      />
      <h3>Tutor Bot with entry screen</h3>
      <IFrame
        payload={{
          blockType: "problem",
          blockUsageKey: "problem-frame-entry",
          trackingUrl: TRACKING_EVENTS_ENDPOINT,
          chat: {
            apiUrl: TEST_API_STREAMING,
            initialMessages: INITIAL_MESSAGES,
            conversationStarters: STARTERS,
            entryScreenEnabled: true,
            entryScreenTitle: "AskTIM about this problem",
          },
        }}
      />
      <h3>Video Drawer</h3>
      <p>
        The chat entry screen is shown by default for the video blocks Tutor
        drawer.
      </p>
      <IFrame
        payload={{
          blockType: "video",
          blockUsageKey: "video-frame",
          trackingUrl: TRACKING_EVENTS_ENDPOINT,
          chat: {
            apiUrl: TEST_API_STREAMING,
            conversationStarters: STARTERS,
          },
          summary: {
            apiUrl: CONTENT_FILE_URL,
          },
        }}
      />

      <h3>Video Drawer Flashcard Conversation Starters</h3>
      <p>
        Where conversation starters are not provided, they will be selected at
        random from the returned flashcard questions or from
        <code> DEFAULT_VIDEO_STARTERS</code> provided.
      </p>
      <IFrame
        payload={{
          blockType: "video",
          blockUsageKey: "video-frame-flashcard",
          trackingUrl: TRACKING_EVENTS_ENDPOINT,
          chat: {
            apiUrl: TEST_API_STREAMING,
          },
          summary: {
            apiUrl: CONTENT_FILE_URL,
          },
        }}
      />
      <AiDrawerManager messageOrigin="http://localhost:6006" />
    </div>
  ),
}

export default meta

type Story = StoryObj<typeof AiDrawerManager>

export const AiDrawerManagerStory: Story = {
  args: {
    target: "video-frame",
  },
  parameters: {
    msw: {
      handlers: [
        http.get(CONTENT_FILE_URL, () => {
          return HttpResponse.json(sampleResponse)
        }),
        http.post(TRACKING_EVENTS_ENDPOINT, () => {
          return HttpResponse.json({ success: true })
        }),
        ...handlers,
      ],
    },
  },
}

// From https://api.rc.learn.mit.edu/api/v1/contentfiles/?edx_module_id=asset-v1%3AMITxT%2B3.012Sx%2B3T2024%2Btype%40asset%2Bblock%400cc53e11-1f91-4ed8-8bab-0d873db8cb90-en.srt
const sampleResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 16649919,
      run_id: 7462,
      run_title: "Structure of Materials",
      run_slug: null,
      departments: [
        {
          department_id: "3",
          name: "Materials Science and Engineering",
          channel_url:
            "https://rc.learn.mit.edu/c/department/materials-science-and-engineering/",
          school: {
            id: 2,
            name: "School of Engineering",
            url: "https://engineering.mit.edu/",
          },
        },
      ],
      semester: null,
      year: null,
      topics: [
        {
          id: 732,
          name: "Science & Math",
          icon: "RiTestTubeLine",
          parent: null,
          channel_url: "https://rc.learn.mit.edu/c/topic/science-math/",
        },
        {
          id: 734,
          name: "Chemistry",
          icon: "RiTestTubeLine",
          parent: 732,
          channel_url: "https://rc.learn.mit.edu/c/topic/chemistry/",
        },
        {
          id: 748,
          name: "Engineering",
          icon: "RiRobot2Line",
          parent: null,
          channel_url: "https://rc.learn.mit.edu/c/topic/engineering/",
        },
        {
          id: 755,
          name: "Materials Science and Engineering",
          icon: "RiRobot2Line",
          parent: 748,
          channel_url:
            "https://rc.learn.mit.edu/c/topic/materials-science-and-engineering/",
        },
      ],
      key: "asset-v1:MITxT+3.012Sx+3T2024+type@asset+block@0cc53e11-1f91-4ed8-8bab-0d873db8cb90-en.srt",
      uid: null,
      title: null,
      description: null,
      url: null,
      content_feature_type: [],
      content_type: "file",
      content:
        " So with this, we will conclude a discussion about the glasses. And I mentioned that there is another class of materials that we'll talk about that form amorphous materials, and they are called polymers. And one very important concept that we will introduce in terms of the polymers is called a random walk model. And it helps us to understand what is the structure of the polymers and how they look in different solvents, how they behave at different temperatures, et cetera. So you've probably heard about polymers. Some of you do know about the internal structure of the polymers. But the polymers, in general, are materials that are composed of individual units that are connected among each other to form relatively long chains. So the name itself comes from Latin that means many parts or units. So it simply means that one individual structural unit within the polymer is composed of many identical or different units. So there are many naturally occurring polymers. So for example, cotton, leather, rubber, wool, et cetera, they're all polymers. And what they all have again in common is that they have the structural units that they're interconnected among each other. There are many biopolymers, so DNA molecules, for example. They belong into the class of polymers simply because they have individual structural units that are connected in a relatively long chain. What we will mostly talk about are synthetic polymers. So these are the polymers that are man-made. And it turns out that they're mostly organic in composition. And I just gave you a couple of examples. So again, most of them are composed of hydrocarbons. They can have other elements, but again, mostly carbon and hydrogen. So one example that they would like to give you is ethylene. So the ethylene itself are two carbon atoms that they're connected among each other, and then each is surrounded by two hydrogen atoms. So this is a monomer, ethylene. if I make a polymer out of the structural unit, I will end up in polyethylene. So you've probably heard about this particular polymer. And its composition would be it is as follows. So you would, again, have carbon atoms that they're connected among each other. And they're surrounded by hydrogen atoms. And there would be many, many of them connected among each other. And again this would be my structural unit, or this would be my monomer. So the polyethylene would be, again, how I would typically write this is would be CH2 CH2, et cetera. And there would be n of them. And this n can be arbitrary. So we will see that there can be polyethylene polymers that are relatively short in the chain length, but some of them are relatively long. Another example would be vinyl chloride, or PVC in the polymer phase. So the vinyl chloride, again, the structure of the PVC would be that, again, you have carbon atoms that are connected among each other. You have hydrogen atoms that is surrounding one, but one has a chlorine atom. And this would be a monomer. And there would be, again, a number or n of these individual monitor units that would be connected among each other. And again, how we typically present this polymers is, again, we have individual units, or monomers, that are connected among each other in a relatively long chain. So this would be a relatively low molecular weight polymer, meaning that each polymer chain is relatively short. Or this would represent the high molecular weight polymer, meaning that the number of the monomer units is relatively high. So do you happen to know about what is the number of monomers in a typical polymer? What would be your guess? Here of we are drawing maybe 10 of them or maybe 30 of them. Yes? A couple thousands. Couple of thousands, that's right. So just to illustrate that fact, the molecular weight, typical molecular weight of a polymer would be, let's say, 10 to the fourth up to 10 to 15 grams per mole. And the molecular weight of an individual ethylene units would be C2 H2 is 28 grams per mole. So you can see that in individual polymer unit can have thousands and thousands of these individual monomer units. So these are very, very long chains. So how do we understand the structure of these materials when there are a number and number of these chains that are somehow forming the solid material? So to understand that we will represent polymers in a form that is shown here. So in other words, just to understand what this image here represents, if this was an example or representation of a polymer chain right-- these are just paper clips that they clip together-- if this is my monument, this would be a polymer chain. So if you have a material, if you have a solid material, if you have a piece of a polymer in the solid form, it's very, very unlikely, almost impossible to have this in a crystalline form where all of the chains are aligned like this. And they are periodically arranged in space. How this polymer units or polymer chains actually look like in this polymer is that they're somehow they form this type of a structure. So they are somehow clumped together, or they form as something that looks like a mess. So the question that we are trying to answer and that we will try to answer in the next couple of minutes is, how do we describe that mess? How do I describe whether the extension of this chain will be like this, or perhaps this chain will collapse completely like this? And this will strongly depend on the environment. For example, if you have a polymer in a specific solvent, how it behaves in that solvent and how far this chain extends in space will strongly depend on the interaction of that polymer with the solvent. But the main idea is that we are trying to quantify how far in space that chain expands. And to do that, we will use this random walk model that I will try to explain in the next couple of minutes. So the random walk model simply describes a set of steps that each monomer is taking. So this particular image shows a very, very long chain. And each individual component of this chain is a single monomer. So we are trying to quantify how this polymer chain behaves in space. So what we're doing is that we are describing a random walk model in which we are trying to make steps of individual monomers units, and we are trying to understand how they arrange in space. So you might be familiar with the random walk model, for example, from Brownian motion. So if you think about Brownian motion or how particles move in different liquids, you would use this random walk model. So it's a similar way how we describe, for example, diffusion of the atoms, et cetera. So one way to think about this is to have so-called a lattice random walk model, in which each unit, monomer unit is taking a step. So this arrow here will represent one monomer. So I'm going from the starting position to the end position of the monomer. And the lattice this random walk model would assume that each of these monomer units is making a specific steps in lattice. So this would be an example of a specific structure where, again, the lattice and the angle, where the length of this arrow, the monomer size, and the angle are fixed. So the angle is 90 degrees always. So in the lattice random walk model, the length of each step and the angle are fixed. And this would explain very well diffusion within a material-- So when you assume that each step has a very well-defined length and a very well-defined angle. On the other hand, in polymers, this angle is not necessarily fixed. So if I have one monomer unit, there is no reason to believe that the next monomer unit will be 90 degrees relatively to that first step. So we will develop something that is called variable angle of random walk model. So this is the variable angle of a random walk. Again, we are assuming that each step is, of the same length, which we'll call l. So the next monomer unit has the same length l, but it can have any angle relative to the first one. And so in this particular case, the length is fixed, but the angle is random. And this would be a very good example of a random walk model applied to polymers. ",
      content_title: "",
      content_author: null,
      content_language: null,
      image_src: null,
      resource_id: "5124",
      resource_readable_id: "course-v1:MITxT+3.012Sx",
      course_number: ["course-v1:MITxT+3.012Sx"],
      file_type: null,
      file_extension: ".srt",
      offered_by: {
        code: "mitx",
        name: "MITx",
        channel_url: "https://rc.learn.mit.edu/c/unit/mitx/",
      },
      platform: {
        code: "mitxonline",
        name: "MITx Online",
      },
      run_readable_id: "course-v1:MITxT+3.012Sx+3T2024",
      edx_module_id:
        "asset-v1:MITxT+3.012Sx+3T2024+type@asset+block@0cc53e11-1f91-4ed8-8bab-0d873db8cb90-en.srt",
      summary:
        'The video discusses polymers, a class of materials composed of long chains of interconnected structural units or monomers. Key points include:\n\n1. **Definition and Structure**: Polymers consist of many repeating units, which can be identical or different. They can be naturally occurring (like cotton and DNA) or synthetic (like polyethylene and PVC).\n\n2. **Monomers and Polymers**: Monomers are the individual units that make up polymers. For example, ethylene is a monomer that forms polyethylene when linked together. The molecular weight of polymers can be very high, often ranging from 10,000 to 10^15 grams per mole.\n\n3. **Random Walk Model**: This model is introduced to understand the structure and behavior of polymers in different environments. It describes how individual monomers take steps in space, akin to Brownian motion. \n\n4. **Lattice Random Walk vs. Variable Angle Random Walk**: The lattice model assumes fixed step lengths and angles, while the variable angle model allows for random angles between steps, better representing the behavior of polymer chains.\n\n5. **Impact of Environment**: The extension and arrangement of polymer chains depend on their interactions with solvents and environmental conditions, leading to a "messy" structure rather than a crystalline form.\n\nOverall, the video emphasizes the complexity and variability in the structure and behavior of polymers, which can be modeled using random walk principles.',
      flashcards: [
        {
          answer:
            "The main topic is about polymers and their structure, particularly the random walk model.",
          question:
            "What is the main topic discussed in the transcript regarding materials?",
        },
        {
          answer:
            "Polymers are materials composed of individual units connected to form long chains, derived from the Latin term meaning 'many parts or units'.",
          question: "What does the term 'polymers' mean?",
        },
        {
          answer:
            "Examples of naturally occurring polymers include cotton, leather, rubber, and wool.",
          question:
            "Can you name some naturally occurring polymers mentioned in the transcript?",
        },
        {
          answer:
            "Synthetic polymers are man-made polymers, mostly organic in composition, primarily composed of hydrocarbons.",
          question: "What is a synthetic polymer?",
        },
        {
          answer:
            "The monomer for polyethylene is ethylene, which consists of two carbon atoms connected to each other, each surrounded by two hydrogen atoms.",
          question: "What is the monomer for polyethylene?",
        },
        {
          answer:
            "The typical molecular weight of a polymer ranges from 10^4 to 10^15 grams per mole.",
          question: "What is the typical molecular weight range for polymers?",
        },
        {
          answer:
            "The random walk model helps to describe how polymer chains behave in space and their arrangement in different environments.",
          question:
            "What does the random walk model help to describe in polymers?",
        },
        {
          answer:
            "In the lattice random walk model, each step has a fixed length and angle (90 degrees), while in the variable angle random walk model, the length is fixed but the angle can vary.",
          question:
            "How does the lattice random walk model differ from the variable angle random walk model?",
        },
        {
          answer:
            "An example of a polymer derived from vinyl chloride is PVC (polyvinyl chloride).",
          question:
            "What is an example of a polymer mentioned that is derived from vinyl chloride?",
        },
        {
          answer:
            "The interactions of polymers with solvents strongly influence how far the polymer chain extends in space.",
          question:
            "How do the interactions of polymers with solvents affect their behavior?",
        },
      ],
    },
  ],
}
