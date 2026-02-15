import { EventEmitter } from "events"

export interface DebugEvent {
  type: string
  requestId: string
  timestamp: number
  [key: string]: any
}

class DebugBus extends EventEmitter {
  private active: boolean

  constructor() {
    super()
    this.active = process.env.DEBUG_AGENT === "true"
    this.setMaxListeners(20)
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.active) return false
    return super.emit(event, ...args)
  }

  debugEmit(data: Omit<DebugEvent, "timestamp">) {
    if (!this.active || this.listenerCount("debug") === 0) return
    super.emit("debug", { ...data, timestamp: Date.now() })
  }

  get isActive() {
    return this.active
  }
}

export const debugBus = new DebugBus()
