"use client";

interface Screen01Props {
  onStart: () => void;
}

export default function Screen01Welcome({ onStart }: Screen01Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-gradient-from via-bg-gradient-via to-bg-gradient-to flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center animate-fade-in">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 animate-bounce-subtle">
            <span className="text-5xl">✨</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Descubra seu
            <br />
            <span className="text-amber-300">Perfil de Negócio</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed max-w-md mx-auto">
            Responda 5 perguntas rápidas e receba recomendações personalizadas
            para alavancar seus resultados.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onStart}
            className="w-full bg-white text-primary font-bold text-lg py-4 px-8 rounded-2xl hover:bg-white/90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-xl shadow-black/20"
          >
            Começar Quiz Grátis
          </button>
          <p className="text-white/60 text-sm">
            Leva menos de 2 minutos
          </p>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-white/60 text-sm">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>100% Gratuito</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚡</span>
            <span>Resultado Imediato</span>
          </div>
        </div>
      </div>
    </div>
  );
}
