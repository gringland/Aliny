"use client";

interface Screen11Props {
  userName: string;
  onRestart: () => void;
}

export default function Screen11ThankYou({ userName, onRestart }: Screen11Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-gradient-from via-bg-gradient-via to-bg-gradient-to flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center animate-scale-in">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🎊</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
            Obrigado, {userName}!
          </h2>
          <p className="text-lg text-white/70 leading-relaxed max-w-md mx-auto">
            Suas recomendações personalizadas foram enviadas para o seu e-mail.
            Fique de olho na sua caixa de entrada!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/20 mb-8">
          <h3 className="text-white font-bold text-lg mb-4">
            Próximos passos:
          </h3>
          <div className="space-y-4 text-left">
            {[
              {
                icon: "📧",
                title: "Confira seu e-mail",
                desc: "Enviamos um relatório completo com suas recomendações.",
              },
              {
                icon: "📱",
                title: "Salve nosso contato",
                desc: "Vamos enviar dicas exclusivas pelo WhatsApp.",
              },
              {
                icon: "🗓️",
                title: "Agende uma conversa",
                desc: "Fale com um especialista para acelerar seus resultados.",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">{item.title}</h4>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <a
            href="https://wa.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-success text-white font-bold text-lg py-4 px-8 rounded-2xl hover:bg-success/90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
          >
            💬 Falar no WhatsApp
          </a>

          <button
            onClick={onRestart}
            className="w-full text-white/60 hover:text-white font-medium py-3 transition-colors"
          >
            Refazer o quiz
          </button>
        </div>
      </div>
    </div>
  );
}
