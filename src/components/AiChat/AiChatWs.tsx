import * as React from "react"
import { AiChatDisplay } from "./AiChatDisplay"
import { AiChatWsProvider } from "./ChatContextWs"
import type { AiChatProps } from "./types"

const AiChatWs: React.FC<AiChatProps> = (props) => {
  return (
    <AiChatWsProvider
      initialMessages={props.initialMessages}
      requestOpts={props.requestOpts}
      parseContent={props.parseContent}
    >
      <AiChatDisplay
        srLoadingMessages={props.srLoadingMessages}
        conversationStarters={props.conversationStarters}
        className={props.className}
      />
    </AiChatWsProvider>
  )
}

export { AiChatWs }
