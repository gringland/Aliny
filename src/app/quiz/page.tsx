"use client";

import { useState, useCallback } from "react";
import { quizQuestions, getResult } from "@/lib/quiz-data";
import Screen01Welcome from "@/components/Screen01Welcome";
import Screen02Intro from "@/components/Screen02Intro";
import ScreenQuestion from "@/components/ScreenQuestion";
import Screen08LeadForm from "@/components/Screen08LeadForm";
import Screen09Loading from "@/components/Screen09Loading";
import Screen10Result from "@/components/Screen10Result";
import Screen11ThankYou from "@/components/Screen11ThankYou";

type Screen =
  | "welcome"
  | "intro"
  | "question"
  | "lead-form"
  | "loading"
  | "result"
  | "thank-you";

interface LeadData {
  name: string;
  email: string;
  phone: string;
}

export default function QuizPage() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { optionId: string; points: number }>>({});
  const [leadData, setLeadData] = useState<LeadData | null>(null);

  const totalScore = Object.values(answers).reduce((sum, a) => sum + a.points, 0);
  const maxPossibleScore = quizQuestions.length * 4;
  const result = getResult(totalScore);

  const handleAnswer = (optionId: string, points: number) => {
    const questionId = quizQuestions[currentQuestion].id;
    setAnswers((prev) => ({ ...prev, [questionId]: { optionId, points } }));

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setScreen("lead-form");
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      setScreen("intro");
    }
  };

  const handleLeadSubmit = (data: LeadData) => {
    setLeadData(data);
    setScreen("loading");
  };

  const handleLoadingComplete = useCallback(() => {
    setScreen("result");
  }, []);

  const handleRestart = () => {
    setScreen("welcome");
    setCurrentQuestion(0);
    setAnswers({});
    setLeadData(null);
  };

  switch (screen) {
    case "welcome":
      return <Screen01Welcome onStart={() => setScreen("intro")} />;
    case "intro":
      return (
        <Screen02Intro onContinue={() => setScreen("question")} />
      );
    case "question":
      return (
        <ScreenQuestion
          key={currentQuestion}
          question={quizQuestions[currentQuestion]}
          questionIndex={currentQuestion}
          totalQuestions={quizQuestions.length}
          onAnswer={handleAnswer}
          onBack={handleBack}
        />
      );
    case "lead-form":
      return <Screen08LeadForm onSubmit={handleLeadSubmit} />;
    case "loading":
      return <Screen09Loading onComplete={handleLoadingComplete} />;
    case "result":
      return (
        <Screen10Result
          result={result}
          score={totalScore}
          totalPossible={maxPossibleScore}
          onCTA={() => setScreen("thank-you")}
        />
      );
    case "thank-you":
      return (
        <Screen11ThankYou
          userName={leadData?.name.split(" ")[0] ?? ""}
          onRestart={handleRestart}
        />
      );
  }
}
