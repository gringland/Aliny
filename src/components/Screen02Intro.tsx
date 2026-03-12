"use client";

interface Screen02Props {
  onContinue: () => void;
}

export default function Screen02Intro({ onContinue }: Screen02Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-gradient-from via-bg-gradient-via to-bg-gradient-to flex items-center justify-center px-4">
      <div className="max-w-lg w-full animate-slide-up">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-white/20">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
            Como funciona?
          </h2>

          <div className="space-y-5">
            {[
              {
                step: "01",
                title: "Responda as perguntas",
                desc: "São apenas 5 perguntas rápidas sobre seu negócio.",
                icon: "📝",
              },
              {
                step: "02",
                title: "Descubra seu perfil",
                desc: "Analisaremos suas respostas para identificar seu momento.",
                icon: "🔍",
              },
              {
                step: "03",
                title: "Receba dicas exclusivas",
                desc: "Enviaremos recomendações personalizadas para você.",
                icon: "🎁",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-4 bg-white/5 rounded-2xl p-4"
              >
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-primary-light uppercase tracking-wider mb-1">
                    Passo {item.step}
                  </p>
                  <h3 className="text-white font-semibold text-lg">
                    {item.title}
                  </h3>
                  <p className="text-white/60 text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onContinue}
            className="w-full mt-8 bg-white text-primary font-bold text-lg py-4 px-8 rounded-2xl hover:bg-white/90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
          >
            Vamos lá!
          </button>
        </div>
      </div>
    </div>
  );
}
