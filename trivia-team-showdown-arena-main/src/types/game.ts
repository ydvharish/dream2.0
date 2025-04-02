
export interface Team {
  id: number;
  name: string;
  score: number;
  answers: number;
  isEliminated?: boolean;
  hasPlayed?: boolean;
}

export interface Question {
  id: number;
  text: string;
  answers: Answer[];
  isRevealed: boolean;
  isHidden?: boolean;
  isStriked?: boolean;
}

export interface Answer {
  id: number;
  text: string;
  points: number;
  isRevealed: boolean;
  isHidden?: boolean;
}

export interface TeamPair {
  team1: Team;
  team2: Team;
}

export interface RoundInfo {
  number: number;
  questionsPerPair: number;
  description: string;
}

export interface ExtraQuestion {
  id: number;
  text: string;
  answers: Answer[];
  isRevealed: boolean;
}
