export interface Day {
  day: number;
  workType: string;
}

export interface Person {
  alias: string;
  name: string;
  role?: string;
  principle?: string;
  days: Day[];
}

export interface Member {
  alias: string;
  name: string;
}

export interface TagArrangement {
  member: Member[];
  full_name: string;
}

export interface ShiftData {
  lockdate: number[];
  year: number;
  month: number;
  pod: string;
  people: Person[];
  tag_arrangement: TagArrangement[];
}

export interface ShiftMapping {
  dayTypes: {
    [key: string]: {
      tag: string;
      color: string;
      content: string;
      isOnDuty: number;
    };
  };
}
