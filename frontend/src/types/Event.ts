import { type BiLabel, DEFAULT_BILABEL } from './BiLabel.ts';


class Event {
  public eventID: number
  public eventType: BiLabel
  public pointDelta: number 

  constructor(
    eventID: number,
    eventType: BiLabel,
    pointDelta: number,
  ) {
    this.eventID = eventID ;
    this.eventType = eventType ;
    this.pointDelta = pointDelta ;
  }
}

export default Event;

export const DEFAULT_EVENT = new Event(0, DEFAULT_BILABEL, 0)