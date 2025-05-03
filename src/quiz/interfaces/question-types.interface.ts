export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MULTIPLE_ANSWER = 'MULTIPLE_ANSWER',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER',
  ESSAY = 'ESSAY',
  MATCHING = 'MATCHING',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  DRAG_AND_DROP = 'DRAG_AND_DROP',
  HOTSPOT = 'HOTSPOT',
  RANKING = 'RANKING',
  NUMERIC = 'NUMERIC',
  MATRIX = 'MATRIX',
  SLIDER = 'SLIDER',
  FILE_UPLOAD = 'FILE_UPLOAD',
  CODE_SNIPPET = 'CODE_SNIPPET',
  DRAWING = 'DRAWING',
  INTERACTIVE_SIMULATION = 'INTERACTIVE_SIMULATION',
}

export interface BaseQuestionContent {
  prompt: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  explanation?: string;
}

export interface MultipleChoiceContent extends BaseQuestionContent {
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  shuffleOptions?: boolean;
}

export interface MultipleAnswerContent extends BaseQuestionContent {
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  shuffleOptions?: boolean;
  minCorrectOptions?: number;
  maxCorrectOptions?: number;
}

export interface TrueFalseContent extends BaseQuestionContent {
  correctAnswer: boolean;
}

export interface ShortAnswerContent extends BaseQuestionContent {
  correctAnswers: string[];
  caseSensitive?: boolean;
  maxLength?: number;
}

export interface EssayContent extends BaseQuestionContent {
  wordLimit?: number;
  rubric?: {
    criteria: {
      name: string;
      description: string;
      weight: number;
      levels: { score: number; description: string }[];
    }[];
  };
}

export interface MatchingContent extends BaseQuestionContent {
  leftItems: { id: string; text: string }[];
  rightItems: { id: string; text: string }[];
  correctPairs: { leftId: string; rightId: string }[];
  shuffleItems?: boolean;
}

export interface FillInBlankContent extends BaseQuestionContent {
  textWithBlanks: string; // Use [[blank:id]] format for blanks
  blanks: {
    id: string;
    correctAnswers: string[];
    caseSensitive?: boolean;
  }[];
}

export interface DragAndDropContent extends BaseQuestionContent {
  draggableItems: { id: string; text: string; imageUrl?: string }[];
  dropZones: { 
    id: string; 
    label?: string; 
    x?: number; 
    y?: number; 
    width?: number; 
    height?: number;
  }[];
  correctPlacements: { itemId: string; zoneId: string }[];
  backgroundImageUrl?: string;
}

export interface HotspotContent extends BaseQuestionContent {
  correctAreas: {
    id: string;
    shape: 'rectangle' | 'circle' | 'polygon';
    coordinates: number[];
  }[];
  backgroundImageUrl: string;
}

export interface RankingContent extends BaseQuestionContent {
  items: { id: string; text: string }[];
  correctOrder: string[];
}

export interface NumericContent extends BaseQuestionContent {
  correctAnswer?: number;
  acceptableRange?: { min: number; max: number };
  unit?: string;
  precision?: number;
}

export interface MatrixContent extends BaseQuestionContent {
  rows: { id: string; text: string }[];
  columns: { id: string; text: string }[];
  correctCells: { rowId: string; colId: string }[];
}

export interface SliderContent extends BaseQuestionContent {
  min: number;
  max: number;
  step: number;
  correctValue?: number;
  acceptableRange?: { min: number; max: number };
  labels?: { value: number; text: string }[];
}

export interface FileUploadContent extends BaseQuestionContent {
  allowedFileTypes: string[];
  maxFileSizeMb?: number;
  rubric?: {
    criteria: {
      name: string;
      description: string;
      weight: number;
      levels: { score: number; description: string }[];
    }[];
  };
}

export interface CodeSnippetContent extends BaseQuestionContent {
  language: string;
  template?: string;
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
  timeLimit?: number; // in milliseconds
  memoryLimit?: number; // in KB
}

export interface DrawingContent extends BaseQuestionContent {
  tools?: ('pen' | 'line' | 'rectangle' | 'circle' | 'eraser')[];
  backgroundImageUrl?: string;
  width: number;
  height: number;
  rubric?: {
    criteria: {
      name: string;
      description: string;
      weight: number;
      levels: { score: number; description: string }[];
    }[];
  };
}

export interface InteractiveSimulationContent extends BaseQuestionContent {
  simulationType: string;
  config: Record<string, any>;
  successCriteria: Record<string, any>;
}

export type QuestionContent =
  | MultipleChoiceContent
  | MultipleAnswerContent
  | TrueFalseContent
  | ShortAnswerContent
  | EssayContent
  | MatchingContent
  | FillInBlankContent
  | DragAndDropContent
  | HotspotContent
  | RankingContent
  | NumericContent
  | MatrixContent
  | SliderContent
  | FileUploadContent
  | CodeSnippetContent
  | DrawingContent
  | InteractiveSimulationContent;