
import { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Save, Star, X, Eye, EyeOff, Ban, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { showConfetti } from '@/lib/confetti';
import { playPopSound, playCelebrationSound } from '@/lib/sounds';

const QuestionPane = () => {
  const {
    currentQuestion,
    currentPair,
    currentQuestionNumber,
    totalQuestions,
    revealQuestion,
    hideQuestion,
    revealAnswer,
    hideAnswer,
    updateQuestion,
    updateAnswer,
    addPoints,
    finishCurrentPair,
    handleAnswerDrop,
    incrementTeamAnswers,
    strikeQuestion,
    unstrikeQuestion,
    nextQuestion
  } = useGame();

  const [editingQuestion, setEditingQuestion] = useState(false);
  const [questionText, setQuestionText] = useState(currentQuestion?.text || '');
  const [editingAnswer, setEditingAnswer] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerPoints, setAnswerPoints] = useState(0);
  const [customPointsTeam1, setCustomPointsTeam1] = useState('');
  const [customPointsTeam2, setCustomPointsTeam2] = useState('');
  const [draggedAnswerId, setDraggedAnswerId] = useState<number | null>(null);

  // Use refs to track team answer containers for drag and drop
  const team1ContainerRef = useRef<HTMLDivElement>(null);
  const team2ContainerRef = useRef<HTMLDivElement>(null);

  if (!currentQuestion || !currentPair) return null;

  const handleSaveQuestion = () => {
    updateQuestion(questionText);
    setEditingQuestion(false);
  };

  const startEditingAnswer = (answerId: number, text: string, points: number) => {
    setEditingAnswer(answerId);
    setAnswerText(text);
    setAnswerPoints(points);
  };

  const handleSaveAnswer = () => {
    if (editingAnswer !== null) {
      updateAnswer(editingAnswer, answerText, answerPoints);
      setEditingAnswer(null);
    }
  };

  const toggleAnswer = (answerId: number) => {
    const answer = currentQuestion.answers.find(a => a.id === answerId);
    if (answer) {
      if (answer.isRevealed && !answer.isHidden) {
        hideAnswer(answerId);
      } else if (answer.isRevealed) {
        revealAnswer(answerId);
      } else {
        revealAnswer(answerId);
        playPopSound();
        
        // Show celebration animation when revealing answer
        setTimeout(() => {
          showConfetti(Math.random() * 0.5 + 0.25, 0.4);
        }, 200);
      }
    }
  };

  const toggleQuestion = () => {
    if (!currentQuestion.isRevealed) {
      revealQuestion();
    } else if (!currentQuestion.isHidden) {
      hideQuestion();
    } else {
      revealQuestion();
    }
  };

  const handleDragStart = (answerId: number) => {
    setDraggedAnswerId(answerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetTeamId: number) => {
    if (draggedAnswerId !== null) {
      handleAnswerDrop(draggedAnswerId, targetTeamId);
      setDraggedAnswerId(null);
      
      // Show celebration animation when dropping answer
      showConfetti(targetTeamId === currentPair.team1.id ? 0.2 : 0.8, 0.3);
      playCelebrationSound();
    }
  };

  const handleCustomPointsSubmit = (teamId: number) => {
    const pointsInput = teamId === currentPair.team1.id ? customPointsTeam1 : customPointsTeam2;
    const points = parseInt(pointsInput);
    
    if (!isNaN(points)) {
      addPoints(teamId, points);
      toast.success(`${points} points added to Team ${teamId}`);
      teamId === currentPair.team1.id ? setCustomPointsTeam1('') : setCustomPointsTeam2('');
      
      if (points > 0) {
        // Show celebration animation when adding points
        showConfetti(teamId === currentPair.team1.id ? 0.2 : 0.8, 0.3);
        playCelebrationSound();
      }
    } else {
      toast.error("Please enter a valid number");
    }
  };

  const handleStrikeQuestion = () => {
    if (currentQuestion.isStriked) {
      unstrikeQuestion();
      toast.info("Strike removed");
    } else {
      strikeQuestion();
      toast.info("Question striked!");
    }
  };
  
  const handleNextQuestion = () => {
    nextQuestion();
  };

  // Count revealed answers for each team
  const team1Answers = currentPair.team1.answers || 0;
  const team2Answers = currentPair.team2.answers || 0;

  return (
    <div className="w-full max-w-4xl mx-auto bg-blue-900 p-6 rounded-lg shadow-lg animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-quiz-yellow text-xl font-bold mb-2">
          Question {currentQuestionNumber} of {totalQuestions}
        </h2>
      </div>

      <div className="mb-8 flex justify-between">
        <div 
          ref={team1ContainerRef}
          className="bg-blue-800 p-4 rounded w-40 text-center relative hover-glow"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(currentPair.team1.id)}
        >
          <div className="text-xl font-bold text-quiz-yellow">
            {currentPair.team1.id}
          </div>
          <div className="text-lg text-white mb-2 truncate">
            {currentPair.team1.name}
          </div>
          <div className="flex justify-center items-center text-xl">
            <Star className="text-quiz-yellow mr-1" size={18} />
            <span className="font-bold text-white">{currentPair.team1.score} pts</span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-300">Answers: {team1Answers}</div>
          </div>
          <div className="mt-2 flex">
            <Input 
              type="text" 
              className="w-full text-sm p-1 h-8" 
              placeholder="Points"
              value={customPointsTeam1}
              onChange={(e) => setCustomPointsTeam1(e.target.value)}
            />
            <Button 
              size="sm" 
              className="ml-1 h-8 p-1" 
              onClick={() => handleCustomPointsSubmit(currentPair.team1.id)}
            >
              +
            </Button>
          </div>
          {draggedAnswerId !== null && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-dashed border-blue-400 rounded pointer-events-none"></div>
          )}
        </div>

        <div 
          ref={team2ContainerRef}
          className="bg-blue-800 p-4 rounded w-40 text-center relative hover-glow"
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(currentPair.team2.id)}
        >
          <div className="text-xl font-bold text-quiz-yellow">
            {currentPair.team2.id}
          </div>
          <div className="text-lg text-white mb-2 truncate">
            {currentPair.team2.name}
          </div>
          <div className="flex justify-center items-center text-xl">
            <Star className="text-quiz-yellow mr-1" size={18} />
            <span className="font-bold text-white">{currentPair.team2.score} pts</span>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-300">Answers: {team2Answers}</div>
          </div>
          <div className="mt-2 flex">
            <Input 
              type="text" 
              className="w-full text-sm p-1 h-8" 
              placeholder="Points"
              value={customPointsTeam2}
              onChange={(e) => setCustomPointsTeam2(e.target.value)}
            />
            <Button 
              size="sm" 
              className="ml-1 h-8 p-1" 
              onClick={() => handleCustomPointsSubmit(currentPair.team2.id)}
            >
              +
            </Button>
          </div>
          {draggedAnswerId !== null && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-dashed border-blue-400 rounded pointer-events-none"></div>
          )}
        </div>
      </div>

      <div className="mb-8 relative">
        {!currentQuestion.isRevealed ? (
          <Button
            onClick={toggleQuestion}
            className="w-full bg-quiz-yellow hover:bg-amber-400 text-quiz-blue font-bold py-6 text-xl hover-scale"
          >
            Reveal Question
          </Button>
        ) : currentQuestion.isHidden ? (
          <Button
            onClick={toggleQuestion}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 text-xl hover-scale"
          >
            <Eye className="mr-2" /> Show Question
          </Button>
        ) : (
          <div className="question-box flex justify-between items-center p-4 bg-blue-800 rounded-md">
            {editingQuestion ? (
              <div className="flex w-full">
                <Textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="flex-1 mr-2 bg-blue-700 text-white border-none"
                />
                <Button onClick={handleSaveQuestion} className="bg-green-600 hover:bg-green-700">
                  <Save size={18} />
                </Button>
              </div>
            ) : (
              <>
                <div className="text-white text-lg">{currentQuestion.text}</div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setEditingQuestion(true)}
                    variant="ghost"
                    className="text-white hover:text-quiz-yellow"
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    onClick={toggleQuestion}
                    variant="ghost"
                    className="text-white hover:text-quiz-yellow"
                  >
                    <EyeOff size={18} />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        
        {currentQuestion.isRevealed && !currentQuestion.isHidden && currentQuestion.isStriked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full absolute bg-blue-900 bg-opacity-50 backdrop-blur-sm"></div>
            <Ban className="text-red-600 w-48 h-48 opacity-80 z-10" strokeWidth={4} />
          </div>
        )}
      </div>

      {currentQuestion.isRevealed && !currentQuestion.isHidden && (
        <div className="mb-8 grid grid-cols-2 gap-3">
          {currentQuestion.answers.map((answer) => (
            <div 
              key={answer.id} 
              draggable={answer.isRevealed && !answer.isHidden}
              onDragStart={() => handleDragStart(answer.id)}
              className={answer.isRevealed && !answer.isHidden ? "cursor-grab hover-scale" : ""}
            >
              {!answer.isRevealed ? (
                <Button
                  onClick={() => toggleAnswer(answer.id)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12"
                >
                  Answer {answer.id}
                </Button>
              ) : answer.isHidden ? (
                <Button
                  onClick={() => toggleAnswer(answer.id)}
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white h-12 flex justify-between items-center"
                >
                  <Eye size={16} />
                  <span>Reveal Answer {answer.id}</span>
                  <span className="bg-gray-500 px-2 py-1 rounded text-sm">{answer.points} pts</span>
                </Button>
              ) : (
                <div className={`answer-button flex justify-between items-center bg-blue-600 p-3 rounded-md answer-revealed ${draggedAnswerId === answer.id ? 'opacity-50' : ''}`}>
                  {editingAnswer === answer.id ? (
                    <div className="flex w-full items-center">
                      <Input
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        className="flex-1 mr-2 bg-blue-700 text-white border-none"
                      />
                      <Input
                        type="number"
                        value={answerPoints}
                        onChange={(e) => setAnswerPoints(parseInt(e.target.value) || 0)}
                        className="w-16 mr-2 bg-blue-700 text-white border-none"
                      />
                      <Button onClick={handleSaveAnswer} className="bg-green-600 hover:bg-green-700">
                        <Save size={16} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-white">{answer.text}</span>
                      <div className="flex items-center">
                        <span className="bg-quiz-yellow text-quiz-blue px-2 py-1 rounded font-bold text-sm mr-2">
                          {answer.points} pts
                        </span>
                        <Button
                          onClick={() => startEditingAnswer(answer.id, answer.text, answer.points)}
                          variant="ghost"
                          className="text-white hover:text-quiz-yellow p-1 h-auto"
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          onClick={() => toggleAnswer(answer.id)}
                          variant="ghost"
                          className="text-white hover:text-quiz-yellow p-1 h-auto"
                        >
                          <EyeOff size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-700 hover:bg-blue-600 font-medium hover-scale">
              Add/Remove Points
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Manage Team Points</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2">{currentPair.team1.name}</h3>
                <div className="flex space-x-2 mb-2">
                  <Button onClick={() => addPoints(currentPair.team1.id, 10)} className="bg-green-600">+10</Button>
                  <Button onClick={() => addPoints(currentPair.team1.id, 50)} className="bg-green-600">+50</Button>
                  <Button onClick={() => addPoints(currentPair.team1.id, 100)} className="bg-green-600">+100</Button>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => addPoints(currentPair.team1.id, -10)} className="bg-red-600">-10</Button>
                  <Button onClick={() => addPoints(currentPair.team1.id, -50)} className="bg-red-600">-50</Button>
                  <Button onClick={() => addPoints(currentPair.team1.id, -100)} className="bg-red-600">-100</Button>
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Custom points"
                      className="w-full"
                      value={customPointsTeam1}
                      onChange={(e) => setCustomPointsTeam1(e.target.value)}
                    />
                    <Button onClick={() => handleCustomPointsSubmit(currentPair.team1.id)} className="whitespace-nowrap">
                      Add Points
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-2">{currentPair.team2.name}</h3>
                <div className="flex space-x-2 mb-2">
                  <Button onClick={() => addPoints(currentPair.team2.id, 10)} className="bg-green-600">+10</Button>
                  <Button onClick={() => addPoints(currentPair.team2.id, 50)} className="bg-green-600">+50</Button>
                  <Button onClick={() => addPoints(currentPair.team2.id, 100)} className="bg-green-600">+100</Button>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => addPoints(currentPair.team2.id, -10)} className="bg-red-600">-10</Button>
                  <Button onClick={() => addPoints(currentPair.team2.id, -50)} className="bg-red-600">-50</Button>
                  <Button onClick={() => addPoints(currentPair.team2.id, -100)} className="bg-red-600">-100</Button>
                </div>
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Custom points"
                      className="w-full"
                      value={customPointsTeam2}
                      onChange={(e) => setCustomPointsTeam2(e.target.value)}
                    />
                    <Button onClick={() => handleCustomPointsSubmit(currentPair.team2.id)} className="whitespace-nowrap">
                      Add Points
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={handleStrikeQuestion}
          className={`${currentQuestion.isStriked ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} hover-scale`}
        >
          <Ban className="mr-1" size={16} /> {currentQuestion.isStriked ? 'Remove Strike' : 'Strike'}
        </Button>

        {currentQuestionNumber < totalQuestions ? (
          <Button 
            onClick={handleNextQuestion} 
            className="bg-quiz-purple hover:bg-purple-700 hover-scale flex items-center"
          >
            Next Question
            <ArrowRight size={16} className="ml-1" />
          </Button>
        ) : (
          <Button 
            onClick={finishCurrentPair} 
            className="bg-quiz-purple hover:bg-purple-700 hover-scale"
          >
            Finish Round
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuestionPane;
