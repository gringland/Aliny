"use client";

import { useEffect, useState } from "react";

interface Screen09Props {
  onComplete: () => void;
}

const steps = [
  { text: "Analisando suas respostas...", icon: "🔍" },
  { text: "Identificando seu perfil...", icon: "📊" },
  { text: "Gerando recomendações...", icon: "✨" },
  { text: "Preparando seu resultado...", icon: "🎯" },
];

export default function Screen09Loading({ onComplete }: Screen09Props) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-gradient-from via-bg-gradient-via to-bg-gradient-to flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="mb-10">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
            <svg
              className="animate-spin text-white"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Calculando resultado...
          </h2>
          <p className="text-white/60">Aguarde um momento</p>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-500 ${
                index <= currentStep
                  ? "bg-white/15 text-white"
                  : "bg-white/5 text-white/30"
              }`}
            >
              <span className="text-xl">{step.icon}</span>
              <span className="text-sm font-medium">{step.text}</span>
              {index < currentStep && (
                <svg
                  className="ml-auto text-success shrink-0"
                  width="18"
                  height="18"
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
              {index === currentStep && (
                <div className="ml-auto w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
