import { debugBus } from "../../utils/debug/debugBus"
import type { DebugEvent } from "../../utils/debug/debugBus"

const WS_OPEN = 1

export function debugRoutes(app: any) {
  if (!debugBus.isActive) return

  app.ws("/ws/debug", (ws: any) => {
    const cleanup = () => debugBus.off("debug", handler)

    const handler = (event: DebugEvent) => {
      if (ws.readyState !== WS_OPEN) {
        cleanup()
        return
      }
      try {
        const str = JSON.stringify(event)
        if (str.length > 100_000) return
        ws.send(str)
      } catch {
        cleanup()
      }
    }

    debugBus.on("debug", handler)
    ws.on("close", cleanup)
    ws.on("error", cleanup)

    try {
      ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }))
    } catch {
      cleanup()
    }
  })
}
