import { useState, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Save, FileJson } from 'lucide-react';
import { toast } from 'sonner';
import { Question } from '@/types/game';

interface QuestionSetupProps {
  onNext: () => void;
}

interface RoundQuestions {
  round1: Question[];
  round2: Question[];
  round3: Question[];
}

const REQUIRED_QUESTIONS = {
  round1: 10, // 10 questions for round 1 (2 per team pair)
  round2: 4,  // 4 questions for round 2 (2 per team pair)
  round3: 3   // 3 questions for round 3 (3 questions for final)
};

const QuestionSetup = ({ onNext }: QuestionSetupProps) => {
  const { updateCustomQuestions } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonContent, setJsonContent] = useState<string>('');
  const [roundQuestions, setRoundQuestions] = useState<RoundQuestions>({
    round1: [],
    round2: [],
    round3: []
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setJsonContent(content);
        const parsed = JSON.parse(content) as RoundQuestions;
        validateAndSetQuestions(parsed);
      } catch (error) {
        toast.error('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

  const validateAndSetQuestions = (questions: RoundQuestions) => {
    // Validate structure
    const rounds = ['round1', 'round2', 'round3'] as const;
    for (const round of rounds) {
      if (!Array.isArray(questions[round])) {
        toast.error(`Invalid format: ${round} should be an array of questions`);
        return;
      }

      // Check question count
      if (questions[round].length !== REQUIRED_QUESTIONS[round]) {
        toast.error(`${round} requires exactly ${REQUIRED_QUESTIONS[round]} questions`);
        return;
      }

      // Validate each question
      for (const question of questions[round]) {
        if (!question.text || !Array.isArray(question.answers) || question.answers.length !== 8) {
          toast.error(`Each question must have text and exactly 8 answers`);
          return;
        }

        for (const answer of question.answers) {
          if (!answer.text || typeof answer.points !== 'number') {
            toast.error(`Each answer must have text and points`);
            return;
          }
        }
      }
    }

    setRoundQuestions(questions);
    toast.success('Questions loaded successfully!');
  };

  const handleNext = () => {
    if (!roundQuestions.round1.length || !roundQuestions.round2.length || !roundQuestions.round3.length) {
      toast.error('Please upload questions for all rounds');
      return;
    }

    updateCustomQuestions(roundQuestions);
    onNext();
  };

  const downloadTemplate = () => {
    const template: RoundQuestions = {
      round1: Array(REQUIRED_QUESTIONS.round1).fill(null).map((_, i) => ({
        id: i + 1,
        text: "Question text here",
        isRevealed: false,
        isStriked: false,
        answers: Array(8).fill(null).map((_, j) => ({
          id: j + 1,
          text: `Answer ${j + 1}`,
          points: 10 * (8 - j),
          isRevealed: false
        }))
      })),
      round2: Array(REQUIRED_QUESTIONS.round2).fill(null).map((_, i) => ({
        id: i + 1,
        text: "Question text here",
        isRevealed: false,
        isStriked: false,
        answers: Array(8).fill(null).map((_, j) => ({
          id: j + 1,
          text: `Answer ${j + 1}`,
          points: 10 * (8 - j),
          isRevealed: false
        }))
      })),
      round3: Array(REQUIRED_QUESTIONS.round3).fill(null).map((_, i) => ({
        id: i + 1,
        text: "Question text here",
        isRevealed: false,
        isStriked: false,
        answers: Array(8).fill(null).map((_, j) => ({
          id: j + 1,
          text: `Answer ${j + 1}`,
          points: 10 * (8 - j),
          isRevealed: false
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-blue-800 rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-quiz-yellow mb-6">
        Upload Questions
      </h2>

      <div className="space-y-6">
        <div className="text-white text-center">
          <p className="mb-4">Upload a JSON file containing questions for all rounds:</p>
          <ul className="text-sm mb-6">
            <li>Round 1: {REQUIRED_QUESTIONS.round1} questions (2 per team pair)</li>
            <li>Round 2: {REQUIRED_QUESTIONS.round2} questions (2 per team pair)</li>
            <li>Round 3: {REQUIRED_QUESTIONS.round3} questions (3 for final)</li>
          </ul>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full max-w-md border-dashed border-2 border-blue-400 text-blue-200 hover:bg-blue-700 hover:text-white"
          >
            <FileJson className="mr-2" size={18} />
            Download Template
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-md border-dashed border-2 border-blue-400 text-blue-200 hover:bg-blue-700 hover:text-white"
          >
            <Upload className="mr-2" size={18} />
            Upload Questions File
          </Button>
        </div>

        {jsonContent && (
          <div className="mt-4">
            <div className="bg-blue-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Questions Status:</h3>
              <div className="space-y-2 text-sm text-white">
                <div className="flex justify-between">
                  <span>Round 1:</span>
                  <span>{roundQuestions.round1.length}/{REQUIRED_QUESTIONS.round1} questions</span>
                </div>
                <div className="flex justify-between">
                  <span>Round 2:</span>
                  <span>{roundQuestions.round2.length}/{REQUIRED_QUESTIONS.round2} questions</span>
                </div>
                <div className="flex justify-between">
                  <span>Round 3:</span>
                  <span>{roundQuestions.round3.length}/{REQUIRED_QUESTIONS.round3} questions</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <Button
            onClick={handleNext}
            className="bg-quiz-yellow hover:bg-amber-400 text-quiz-blue font-bold text-lg py-2 px-12 rounded-full"
            disabled={!roundQuestions.round1.length || !roundQuestions.round2.length || !roundQuestions.round3.length}
          >
            <Save className="mr-2" size={18} />
            Save and Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionSetup; 