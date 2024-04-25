// Interface for Event
export interface BunjiEvent {
  id: string;
  isDone: boolean;
  description: string;
  startAtDate: string;
  startAtTime: string;
  endAtDate: string;
  endAtTime: string;
  userId: number;
}
