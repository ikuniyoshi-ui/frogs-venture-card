
export enum UserType {
  ELEMENTARY = 'ELEMENTARY',
  MIDDLE_SCHOOL = 'MIDDLE_SCHOOL',
  NONE = 'NONE'
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface VentureCardData {
  name: string;
  who: string;
  what: string;
  why: string;
  how: string;
  whenWhere: string;
}

export interface AppState {
  userType: UserType;
  messages: Message[];
  isCardFinished: boolean;
  cardData: VentureCardData | null;
  nextSteps: string[];
  interviewQuestions: string[];
}
