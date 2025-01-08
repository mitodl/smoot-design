import * as React from "react"
import { AiChatDisplay } from "./AiChatDisplay"
import { AiChatHttpProvider } from "./ChatContextHttp"
import type { AiChatProps } from "./types"

const AiChat: React.FC<AiChatProps> = (props) => {
  return (
    <AiChatHttpProvider
      initialMessages={props.initialMessages}
      requestOpts={props.requestOpts}
      parseContent={props.parseContent}
    >
      <AiChatDisplay
        srLoadingMessages={props.srLoadingMessages}
        conversationStarters={props.conversationStarters}
        className={props.className}
      />
    </AiChatHttpProvider>
  )
}

export { AiChat }
export type { AiChatProps }
