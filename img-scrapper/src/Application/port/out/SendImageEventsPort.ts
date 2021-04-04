export interface SendImageEventsPort {
  sendImageEvent(value: string, headers: any): Promise<any>;
}