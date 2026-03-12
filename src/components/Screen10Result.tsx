"use client";

import type { QuizResult } from "@/lib/quiz-data";

interface Screen10Props {
  result: QuizResult;
  score: number;
  totalPossible: number;
  onCTA: () => void;
}

export default function Screen10Result({
  result,
  score,
  totalPossible,
  onCTA,
}: Screen10Props) {
  const percentage = Math.round((score / totalPossible) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-gradient-from via-bg-gradient-via to-bg-gradient-to flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
            <span className="text-5xl">{result.icon}</span>
          </div>
          <p className="text-amber-300 font-semibold text-sm uppercase tracking-wider mb-2">
            Seu resultado
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            {result.title}
          </h2>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/20 mb-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-white">{score}</p>
              <p className="text-white/50 text-xs">pontos</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-4xl font-extrabold text-amber-300">{percentage}%</p>
              <p className="text-white/50 text-xs">score</p>
            </div>
          </div>

          <p className="text-white/80 text-center leading-relaxed mb-6">
            {result.description}
          </p>

          <div className="space-y-3">
            <p className="text-white font-semibold text-sm uppercase tracking-wider">
              Dicas para você:
            </p>
            {result.tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white/5 rounded-xl p-3"
              >
                <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg
                    className="text-success"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <span className="text-white/80 text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onCTA}
          className="w-full bg-white text-primary font-bold text-lg py-4 px-8 rounded-2xl hover:bg-white/90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-black/20"
        >
          {result.ctaText}
        </button>
      </div>
    </div>
  );
}
