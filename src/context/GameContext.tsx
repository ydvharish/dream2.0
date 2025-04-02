import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Question, Answer, TeamPair, RoundInfo, ExtraQuestion, GameResult, RoundQuestion, RoundQuestions } from '../types/game';
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from 'sonner';
import { playPopSound, playCelebrationSound } from '@/lib/sounds';
import { showConfetti } from '@/lib/confetti';

interface GameContextProps {
  teams: Team[];
  currentRound: number;
  rounds: RoundInfo[];
  selectedTeams: number[];
  currentPair: TeamPair | null;
  currentQuestion: Question | null;
  isQuestionMode: boolean;
  extraQuestions: ExtraQuestion[];
  standings: Team[];
  roundCompleted: boolean;
  currentQuestionNumber: number;
  totalQuestions: number;
  isGameFinished: boolean;
  showFinalResults: boolean;
  gameResult: GameResult | null;
  roundQuestions: RoundQuestions;
  isConfigureQuestionsMode: boolean;
  
  addTeam: () => void;
  removeTeam: (id: number) => void;
  updateTeamName: (id: number, name: string) => void;
  
  toggleTeamSelection: (teamId: number) => void;
  startQuestionPair: () => void;
  
  revealQuestion: () => void;
  hideQuestion: () => void;
  revealAnswer: (answerId: number) => void;
  hideAnswer: (answerId: number) => void;
  updateQuestion: (text: string) => void;
  updateAnswer: (answerId: number, text: string, points: number) => void;
  strikeQuestion: () => void;
  unstrikeQuestion: () => void;
  
  addPoints: (teamId: number, points: number) => void;
  incrementTeamAnswers: (teamId: number) => void;
  
  addExtraQuestion: () => void;
  updateExtraQuestion: (id: number, text: string) => void;
  updateExtraAnswer: (questionId: number, answerId: number, text: string, points: number) => void;
  assignExtraQuestionPoints: (teamId: number, points: number) => void;
  
  finishCurrentPair: () => void;
  changeRound: (roundNumber: number) => void;
  continueRound: () => void;
  startNextRound: () => void;
  nextQuestion: () => void;
  
  handleAnswerDrop: (answerId: number, targetTeamId: number) => void;
  
  enterConfigureQuestionsMode: () => void;
  exitConfigureQuestionsMode: () => void;
  updateRoundQuestion: (roundNumber: number, questionIndex: number, questionData: RoundQuestion) => void;
}

const defaultRounds: RoundInfo[] = [
  { number: 1, questionsPerPair: 1, description: "Round 1: Teams compete in pairs. Each pair will answer 1 question." },
  { number: 2, questionsPerPair: 2, description: "Round 2: Teams compete in pairs. Each pair will answer 2 questions." },
  { number: 3, questionsPerPair: 3, description: "Final round! Two teams compete for the championship with 3 questions." },
];

const questionTemplates = [
  "Name a reason why someone might cancel plans with a friend",
  "Name something people commonly forget to pack when going on vacation",
  "Name something that people are afraid of",
  "Name a place where people take selfies",
  "Name something people do to relax after a stressful day",
  "Name an item people commonly lose and have to replace",
  "Name a common excuse for being late to work",
  "Name something people do while waiting in line",
  "Name a popular holiday destination",
  "Name something that makes noise at night and keeps people awake",
  "Name something people collect as a hobby",
  "Name a reason someone might call in sick to work (when they're not actually sick)",
  "Name something people do to prepare for a job interview",
  "Name something parents tell their children not to do",
  "Name a common New Year's resolution"
];

const defaultAnswers = [
  { text: "Answer 1", points: 80 },
  { text: "Answer 2", points: 70 },
  { text: "Answer 3", points: 60 },
  { text: "Answer 4", points: 50 },
  { text: "Answer 5", points: 40 },
  { text: "Answer 6", points: 30 },
  { text: "Answer 7", points: 20 },
  { text: "Answer 8", points: 10 }
];

let usedQuestionIndices: { [key: string]: number[] } = {
  "1": [],
  "2": [],
  "3": []
};

const createDefaultQuestion = (id: number, pairId?: string, roundNumber?: number, questionNumber?: number): Question => {
  let questionIndex = Math.floor(Math.random() * questionTemplates.length);
  
  if (roundNumber) {
    const roundKey = roundNumber.toString();
    
    if (usedQuestionIndices[roundKey].length >= questionTemplates.length) {
      usedQuestionIndices[roundKey] = [];
    }
    
    while (usedQuestionIndices[roundKey].includes(questionIndex)) {
      questionIndex = Math.floor(Math.random() * questionTemplates.length);
    }
    
    usedQuestionIndices[roundKey].push(questionIndex);
  }
  
  return {
    id,
    text: questionTemplates[questionIndex],
    isRevealed: false,
    isStriked: false,
    answers: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      text: `Answer ${i + 1}`,
      points: 10 * (8 - i),
      isRevealed: false
    }))
  };
};

const createDefaultExtraQuestion = (id: number): ExtraQuestion => {
  return {
    id,
    text: `Extra Question ${id}`,
    isRevealed: false,
    answers: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      text: `Answer ${i + 1}`,
      points: 10 * (8 - i),
      isRevealed: false
    }))
  };
};

const createDefaultRoundQuestions = (): RoundQuestions => {
  const questions: RoundQuestions = {};
  
  questions[1] = Array.from({ length: 5 }, (_, i) => ({
    questionNumber: i + 1,
    text: questionTemplates[(i) % questionTemplates.length],
    answers: defaultAnswers.map((ans, j) => ({ 
      id: j + 1, 
      text: ans.text, 
      points: ans.points 
    }))
  }));
  
  questions[2] = Array.from({ length: 8 }, (_, i) => ({
    questionNumber: i + 1,
    text: questionTemplates[(i + 5) % questionTemplates.length],
    answers: defaultAnswers.map((ans, j) => ({ 
      id: j + 1, 
      text: ans.text, 
      points: ans.points 
    }))
  }));
  
  questions[3] = Array.from({ length: 3 }, (_, i) => ({
    questionNumber: i + 1,
    text: questionTemplates[(i + 10) % questionTemplates.length],
    answers: defaultAnswers.map((ans, j) => ({ 
      id: j + 1, 
      text: `Answer ${j + 1}`, 
      points: 10 * (8 - j) 
    }))
  }));
  
  return questions;
};

const usedPairQuestions: { [key: string]: number[] } = {};

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds] = useState<RoundInfo[]>(defaultRounds);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [currentPair, setCurrentPair] = useState<TeamPair | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [extraQuestions, setExtraQuestions] = useState<ExtraQuestion[]>([createDefaultExtraQuestion(1)]);
  const [standings, setStandings] = useState<Team[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [roundQuestions, setRoundQuestions] = useState<RoundQuestions>(createDefaultRoundQuestions());
  const [isConfigureQuestionsMode, setIsConfigureQuestionsMode] = useState(false);
  const [usedQuestionsInRound, setUsedQuestionsInRound] = useState<{[round: number]: number[]}>({
    1: [], 2: [], 3: []
  });
  const { toast } = useToast();

  useEffect(() => {
    if (teams.length === 0) {
      const initialTeams: Team[] = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Team ${i + 1}`,
        score: 0,
        answers: 0,
        hasPlayed: false,
        roundScores: {1: 0, 2: 0, 3: 0}
      }));
      setTeams(initialTeams);
      setStandings(initialTeams);
    }
  }, [teams.length]);

  useEffect(() => {
    if (isGameFinished) {
      const roundThreeSorted = [...teams]
        .filter(team => !team.isEliminated)
        .sort((a, b) => (b.roundScores?.[3] || 0) - (a.roundScores?.[3] || 0));
      
      setStandings(roundThreeSorted);
      
      if (roundThreeSorted.length >= 2) {
        const champion = roundThreeSorted[0];
        const runnerUp = roundThreeSorted[1];
        
        const championRound3Score = champion.roundScores?.[3] || 0;
        const runnerUpRound3Score = runnerUp.roundScores?.[3] || 0;
        
        setGameResult({
          champion,
          runnerUp,
          finalRoundScore: `${championRound3Score} - ${runnerUpRound3Score}`
        });
      }
    } 
    else {
      const sortedTeams = [...teams].sort((a, b) => {
        const aRoundScore = a.roundScores?.[currentRound] || 0;
        const bRoundScore = b.roundScores?.[currentRound] || 0;
        return bRoundScore - aRoundScore;
      });
      setStandings(sortedTeams);
    }
  }, [teams, isGameFinished, currentRound]);
  
  useEffect(() => {
    if (currentRound && rounds) {
      const roundInfo = rounds.find(r => r.number === currentRound);
      if (roundInfo) {
        setTotalQuestions(roundInfo.questionsPerPair);
      }
    }
  }, [currentRound, rounds]);

  const enterConfigureQuestionsMode = () => {
    setIsConfigureQuestionsMode(true);
  };

  const exitConfigureQuestionsMode = () => {
    setIsConfigureQuestionsMode(false);
  };

  const updateRoundQuestion = (roundNumber: number, questionIndex: number, questionData: RoundQuestion) => {
    setRoundQuestions(prev => {
      const updatedRoundQuestions = { ...prev };
      if (!updatedRoundQuestions[roundNumber]) {
        updatedRoundQuestions[roundNumber] = [];
      }
      
      while (updatedRoundQuestions[roundNumber].length <= questionIndex) {
        updatedRoundQuestions[roundNumber].push({
          questionNumber: updatedRoundQuestions[roundNumber].length + 1,
          text: "",
          answers: defaultAnswers.map((ans, j) => ({ id: j + 1, text: ans.text, points: ans.points }))
        });
      }
      
      updatedRoundQuestions[roundNumber][questionIndex] = questionData;
      return updatedRoundQuestions;
    });
  };

  const addTeam = () => {
    if (teams.length >= 15) {
      toast({
        title: "Maximum teams reached",
        description: "You can have a maximum of 15 teams",
        variant: "destructive"
      });
      return;
    }
    const newId = teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1;
    const newTeam = { 
      id: newId, 
      name: `Team ${newId}`, 
      score: 0, 
      answers: 0, 
      hasPlayed: false,
      roundScores: {1: 0, 2: 0, 3: 0}
    };
    setTeams([...teams, newTeam]);
  };

  const removeTeam = (id: number) => {
    if (teams.length <= 8) {
      toast({
        title: "Minimum teams required",
        description: "You need at least 8 teams",
        variant: "destructive"
      });
      return;
    }
    setTeams(teams.filter(team => team.id !== id));
  };

  const updateTeamName = (id: number, name: string) => {
    setTeams(teams.map(team => 
      team.id === id ? { ...team, name } : team
    ));
  };

  const toggleTeamSelection = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (team?.hasPlayed) {
      sonnerToast.error("This team has already played in this round");
      return;
    }

    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else {
      if (selectedTeams.length < 2) {
        setSelectedTeams([...selectedTeams, teamId]);
      } else {
        setSelectedTeams([selectedTeams[1], teamId]);
      }
    }
  };

  const getUnusedQuestionIndex = (pairId: string, round: number, questionNumber: number): number => {
    const pairQuestionKey = `${pairId}-${round}-${questionNumber}`;
    const availableQuestions = roundQuestions[round] || [];
    
    if (availableQuestions.length === 0) {
      return Math.floor(Math.random() * questionTemplates.length);
    }
    
    const usedIndices = usedQuestionsInRound[round] || [];
    
    if (usedIndices.length >= availableQuestions.length) {
      if (availableQuestions.length === 1) {
        return 0;
      }
      let index = Math.floor(Math.random() * availableQuestions.length);
      const lastUsed = usedIndices[usedIndices.length - 1];
      if (index === lastUsed && availableQuestions.length > 1) {
        index = (index + 1) % availableQuestions.length;
      }
      
      setUsedQuestionsInRound(prev => {
        const updated = {...prev};
        updated[round] = [index];
        return updated;
      });
      
      return index;
    }
    
    let availableIndices = Array.from(
      { length: availableQuestions.length }, 
      (_, i) => i
    ).filter(i => !usedIndices.includes(i));
    
    if (availableIndices.length === 0) {
      let randomIndex = Math.floor(Math.random() * availableQuestions.length);
      setUsedQuestionsInRound(prev => {
        const updated = {...prev};
        updated[round] = [...(prev[round] || []), randomIndex];
        return updated;
      });
      return randomIndex;
    }
    
    const chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedQuestionsInRound(prev => {
      const updated = {...prev};
      updated[round] = [...(prev[round] || []), chosenIndex];
      return updated;
    });
    
    return chosenIndex;
  };

  const startQuestionPair = () => {
    if (selectedTeams.length !== 2) {
      toast({
        title: "Select two teams",
        description: "You need to select exactly two teams to start",
        variant: "destructive"
      });
      return;
    }

    const team1 = teams.find(t => t.id === selectedTeams[0]);
    const team2 = teams.find(t => t.id === selectedTeams[1]);

    if (team1 && team2) {
      const pairId = `pair-${team1.id}-${team2.id}`;
      
      setCurrentPair({ 
        team1: {...team1, score: 0},
        team2: {...team2, score: 0},
        pairId
      });
      
      const questionIndex = getUnusedQuestionIndex(pairId, currentRound, 1);
      
      if (roundQuestions[currentRound] && roundQuestions[currentRound].length > questionIndex) {
        const predefinedQuestion = roundQuestions[currentRound][questionIndex];
        setCurrentQuestion({
          id: 1,
          text: predefinedQuestion.text,
          isRevealed: false,
          isStriked: false,
          answers: predefinedQuestion.answers.map(a => ({
            id: a.id,
            text: a.text,
            points: a.points,
            isRevealed: false
          }))
        });
      } else {
        setCurrentQuestion(createDefaultQuestion(1, pairId, currentRound, 1));
      }
      
      setIsQuestionMode(true);
      setCurrentQuestionNumber(1);
      
      setTeams(teams.map(team => 
        team.id === team1.id || team.id === team2.id 
          ? { ...team, hasPlayed: true } 
          : team
      ));
    }
  };

  const nextQuestion = () => {
    const nextNum = currentQuestionNumber + 1;
    
    if (nextNum <= totalQuestions && currentPair) {
      setCurrentQuestionNumber(nextNum);
      
      const questionIndex = getUnusedQuestionIndex(
        currentPair.pairId || '',
        currentRound,
        nextNum
      );
      
      if (roundQuestions[currentRound] && roundQuestions[currentRound].length > questionIndex) {
        const predefinedQuestion = roundQuestions[currentRound][questionIndex];
        setCurrentQuestion({
          id: nextNum,
          text: predefinedQuestion.text,
          isRevealed: false,
          isStriked: false,
          answers: predefinedQuestion.answers.map(a => ({
            id: a.id,
            text: a.text,
            points: a.points,
            isRevealed: false
          }))
        });
      } else {
        setCurrentQuestion(createDefaultQuestion(nextNum, currentPair.pairId, currentRound, nextNum));
      }
    } else {
      finishCurrentPair();
    }
  };

  const revealQuestion = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, isRevealed: true, isHidden: false });
      playPopSound();
    }
  };

  const hideQuestion = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, isHidden: true });
    }
  };

  const strikeQuestion = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, isStriked: true });
    }
  };

  const unstrikeQuestion = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, isStriked: false });
    }
  };

  const revealAnswer = (answerId: number) => {
    if (currentQuestion) {
      playPopSound();
      setCurrentQuestion({
        ...currentQuestion,
        answers: currentQuestion.answers.map(answer => 
          answer.id === answerId ? { ...answer, isRevealed: true, isHidden: false } : answer
        )
      });
      
      setTimeout(() => {
        showConfetti(Math.random() * 0.5 + 0.25, Math.random() * 0.3 + 0.3);
      }, 300);
    }
  };

  const hideAnswer = (answerId: number) => {
    if (currentQuestion) {
      setCurrentQuestion({
        ...currentQuestion,
        answers: currentQuestion.answers.map(answer => 
          answer.id === answerId ? { ...answer, isHidden: true } : answer
        )
      });
    }
  };

  const updateQuestion = (text: string) => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, text });
    }
  };

  const updateAnswer = (answerId: number, text: string, points: number) => {
    if (currentQuestion) {
      setCurrentQuestion({
        ...currentQuestion,
        answers: currentQuestion.answers.map(answer => 
          answer.id === answerId ? { ...answer, text, points } : answer
        )
      });
    }
  };

  const addPoints = (teamId: number, points: number) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        const updatedRoundScores = {...(team.roundScores || {1: 0, 2: 0, 3: 0})};
        updatedRoundScores[currentRound] = (updatedRoundScores[currentRound] || 0) + points;
        
        return { 
          ...team, 
          score: team.score + points,
          roundScores: updatedRoundScores
        };
      }
      return team;
    }));
    
    if (currentPair) {
      if (teamId === currentPair.team1.id) {
        setCurrentPair({
          ...currentPair,
          team1: {
            ...currentPair.team1,
            score: currentPair.team1.score + points
          }
        });
      } else if (teamId === currentPair.team2.id) {
        setCurrentPair({
          ...currentPair,
          team2: {
            ...currentPair.team2,
            score: currentPair.team2.score + points
          }
        });
      }
    }
    
    if (points > 0) {
      playCelebrationSound();
      showConfetti(Math.random() * 0.5 + 0.25, Math.random() * 0.3 + 0.3);
    }
  };

  const incrementTeamAnswers = (teamId: number) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, answers: team.answers + 1 } : team
    ));
  };

  const addExtraQuestion = () => {
    const newId = extraQuestions.length > 0 
      ? Math.max(...extraQuestions.map(q => q.id)) + 1 
      : 1;
    
    setExtraQuestions([...extraQuestions, createDefaultExtraQuestion(newId)]);
  };

  const updateExtraQuestion = (id: number, text: string) => {
    setExtraQuestions(extraQuestions.map(question => 
      question.id === id ? { ...question, text } : question
    ));
  };

  const updateExtraAnswer = (questionId: number, answerId: number, text: string, points: number) => {
    setExtraQuestions(extraQuestions.map(question => 
      question.id === questionId 
        ? {
            ...question,
            answers: question.answers.map(answer =>
              answer.id === answerId ? { ...answer, text, points } : answer
            )
          } 
        : question
    ));
  };
  
  const assignExtraQuestionPoints = (teamId: number, points: number) => {
    addPoints(teamId, points);
    sonnerToast.success(`${points} points added to Team ${teamId} from extra question`);
  };

  const finishCurrentPair = () => {
    if (currentPair) {
      const team1 = teams.find(t => t.id === currentPair.team1.id);
      const team2 = teams.find(t => t.id === currentPair.team2.id);
      
      if (team1 && team2) {
        setTeams(teams.map(team => {
          if (team.id === team1.id) {
            return team;
          }
          if (team.id === team2.id) {
            return team;
          }
          return team;
        }));
      }
    }

    setCurrentPair(null);
    setCurrentQuestion(null);
    setIsQuestionMode(false);
    setSelectedTeams([]);
    setCurrentQuestionNumber(1);
    
    setRoundCompleted(true);
    
    const teamsInRound = teams.filter(team => !team.isEliminated);
    const allTeamsPlayedInRound = teamsInRound.every(team => team.hasPlayed);
    
    if (currentRound === 3 && allTeamsPlayedInRound) {
      setIsGameFinished(true);
      setShowFinalResults(true);
    }
  };

  const changeRound = (roundNumber: number) => {
    if (roundNumber >= 1 && roundNumber <= rounds.length) {
      setCurrentRound(roundNumber);
      setCurrentPair(null);
      setCurrentQuestion(null);
      setIsQuestionMode(false);
      setRoundCompleted(false);
      setSelectedTeams([]);
      setCurrentQuestionNumber(1);
      setIsGameFinished(false);
      setShowFinalResults(false);
      
      setUsedQuestionsInRound(prev => {
        const updated = {...prev};
        updated[roundNumber] = [];
        return updated;
      });
      
      setTeams(teams.map(team => ({ ...team, hasPlayed: false })));
    }
  };

  const continueRound = () => {
    setRoundCompleted(false);
    setSelectedTeams([]);
  };

  const startNextRound = () => {
    const sortedTeams = [...teams].sort((a, b) => {
      const aRoundScore = a.roundScores?.[currentRound] || 0;
      const bRoundScore = b.roundScores?.[currentRound] || 0;
      return bRoundScore - aRoundScore;
    });
    
    let advancingTeams: number[];
    
    if (currentRound === 1) {
      advancingTeams = sortedTeams.slice(0, 4).map(team => team.id);
    } else if (currentRound === 2) {
      advancingTeams = sortedTeams.slice(0, 2).map(team => team.id);
    } else {
      advancingTeams = [];
    }
    
    setTeams(teams.map(team => {
      const isAdvancing = advancingTeams.includes(team.id);
      return {
        ...team,
        isEliminated: !isAdvancing,
        hasPlayed: false,
        roundScores: {
          ...(team.roundScores || {1: 0, 2: 0, 3: 0}),
          [currentRound + 1]: 0
        }
      };
    }));
    
    setUsedQuestionsInRound(prev => {
      const updated = {...prev};
      updated[currentRound + 1] = [];
      return updated;
    });
    
    setCurrentRound(currentRound + 1);
    setRoundCompleted(false);
    setSelectedTeams([]);
    setCurrentQuestionNumber(1);
    
    if (currentRound === 3) {
      setIsGameFinished(true);
      setShowFinalResults(true);
    }
  };

  const handleAnswerDrop = (answerId: number, targetTeamId: number) => {
    if (currentQuestion && currentPair) {
      const answer = currentQuestion.answers.find(a => a.id === answerId);
      
      if (answer && answer.isRevealed && !answer.isHidden) {
        addPoints(targetTeamId, answer.points);
        incrementTeamAnswers(targetTeamId);
        
        hideAnswer(answerId);
        
        sonnerToast.success(`${answer.points} points added to Team ${targetTeamId}`);
        playCelebrationSound();
      }
    }
  };

  return (
    <GameContext.Provider value={{
      teams,
      currentRound,
      rounds,
      selectedTeams,
      currentPair,
      currentQuestion,
      isQuestionMode,
      extraQuestions,
      standings,
      roundCompleted,
      currentQuestionNumber,
      totalQuestions,
      isGameFinished,
      showFinalResults,
      gameResult,
      roundQuestions,
      isConfigureQuestionsMode,
      addTeam,
      removeTeam,
      updateTeamName,
      toggleTeamSelection,
      startQuestionPair,
      revealQuestion,
      hideQuestion,
      strikeQuestion,
      unstrikeQuestion,
      revealAnswer,
      hideAnswer,
      updateQuestion,
      updateAnswer,
      addPoints,
      incrementTeamAnswers,
      addExtraQuestion,
      updateExtraQuestion,
      updateExtraAnswer,
      assignExtraQuestionPoints,
      finishCurrentPair,
      changeRound,
      continueRound,
      startNextRound,
      nextQuestion,
      handleAnswerDrop,
      enterConfigureQuestionsMode,
      exitConfigureQuestionsMode,
      updateRoundQuestion
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
