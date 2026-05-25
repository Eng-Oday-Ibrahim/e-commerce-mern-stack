// interface

export interface MessageBus {
  publish(event: string, payload: unknown): Promise<void>;
  subscribe(event: string, handler: Function): Promise<void>;
}