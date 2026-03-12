"use client";

import { useState } from "react";

interface Screen08Props {
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
}

export default function Screen08LeadForm({ onSubmit }: Screen08Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Digite seu nome";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Digite um e-mail válido";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10)
      newErrors.phone = "Digite um telefone válido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-gradient-from via-bg-gradient-via to-bg-gradient-to flex items-center justify-center px-4">
      <div className="max-w-lg w-full animate-slide-up">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-10 border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Suas respostas foram salvas!
            </h2>
            <p className="text-white/70">
              Para ver seu resultado personalizado, preencha seus dados abaixo:
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">
                Seu nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Silva"
                className={`w-full bg-white/10 border-2 ${
                  errors.name ? "border-error" : "border-white/20"
                } rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors`}
              />
              {errors.name && (
                <p className="text-error text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">
                Seu melhor e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: maria@email.com"
                className={`w-full bg-white/10 border-2 ${
                  errors.email ? "border-error" : "border-white/20"
                } rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors`}
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-1.5">
                WhatsApp
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className={`w-full bg-white/10 border-2 ${
                  errors.phone ? "border-error" : "border-white/20"
                } rounded-xl px-4 py-3.5 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors`}
              />
              {errors.phone && (
                <p className="text-error text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-white text-primary font-bold text-lg py-4 px-8 rounded-2xl hover:bg-white/90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
            >
              Ver Meu Resultado
            </button>

            <p className="text-white/40 text-xs text-center mt-3">
              🔒 Seus dados estão seguros e não serão compartilhados.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
