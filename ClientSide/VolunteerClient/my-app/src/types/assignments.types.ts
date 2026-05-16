export enum AssignmentStatus {
  Active = 'Active',
  Finished = 'Finished',
  Cancelled = 'Cancelled',
}

export interface AssignmentType {
  id: number;
  volunteerID: number;
  helpRequestID: number;
  assignedAt: string;
  status: AssignmentStatus;
  // enriched fields (joined on backend or fetched separately)
  helpRequestTitle?: string;
  requesterName?: string;
  requesterCity?: string;
  volunteerName?: string; // enriched for needy side
}

export interface ChatMessageType {
  id: number;
  assignmentID: number;
  senderID: number;
  messageContent: string;
  timestamp: string;
}
