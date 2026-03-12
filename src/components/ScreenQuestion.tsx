"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/lib/quiz-data";
import ProgressBar from "./ProgressBar";

interface ScreenQuestionProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (optionId: string, points: number) => void;
  onBack?: () => void;
}

export default function ScreenQuestion({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onBack,
}: ScreenQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (optionId: string, points: number) => {
    if (isAnimating) return;
    setSelected(optionId);
    setIsAnimating(true);
    setTimeout(() => {
      onAnswer(optionId, points);
      setSelected(null);
      setIsAnimating(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-gradient-from via-bg-gradient-via to-bg-gradient-to flex flex-col px-4 py-8">
      <div className="max-w-lg w-full mx-auto flex-1 flex flex-col">
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="text-white/70 hover:text-white mb-4 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          )}
          <ProgressBar current={questionIndex + 1} total={totalQuestions} />
        </div>

        <div className="flex-1 flex flex-col justify-center animate-slide-in-right">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
              {question.question}
            </h2>
            {question.subtitle && (
              <p className="text-white/60 text-base">{question.subtitle}</p>
            )}
          </div>

          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id, option.points)}
                disabled={isAnimating}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  selected === option.id
                    ? "bg-white border-white text-primary scale-[1.02]"
                    : "bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl ${
                    selected === option.id ? "bg-primary/10" : "bg-white/10"
                  }`}
                >
                  {option.icon}
                </div>
                <span className="font-semibold text-lg">{option.text}</span>
                {selected === option.id && (
                  <svg
                    className="ml-auto shrink-0 text-primary"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
