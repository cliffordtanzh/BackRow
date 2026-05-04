import { type BiLabel, DEFAULT_BILABEL } from './BiLabel.ts';


class EventCreate {
  public ID: number
  public eventType: BiLabel
  public pointDelta: number 

  constructor(
    ID: number,
    eventType: BiLabel,
    pointDelta: number,
  ) {
    this.ID = ID ;
    this.eventType = eventType ;
    this.pointDelta = pointDelta ;
  }
}

export default EventCreate;

export const DEFAULT_EVENT_CREATE = new EventCreate(0, DEFAULT_BILABEL, 0)