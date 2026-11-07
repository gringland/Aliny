"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Estrategia,
  PacoteConteudo,
  Pauta,
  PerfilMarca,
  Reaproveitamento,
} from "@/lib/maquina/schemas";

type Aba = "marca" | "estrategia" | "producao" | "calendario" | "reaproveitar";

const PERFIL_VAZIO: PerfilMarca = {
  nome: "",
  nicho: "",
  publico: "",
  oferta: "",
  tom: "",
  diferencial: "",
  plataformas: ["Instagram"],
  postsPorSemana: 5,
  referencias: "",
};

const PLATAFORMAS = ["Instagram", "TikTok", "YouTube Shorts", "LinkedIn", "X/Twitter"];
const STORAGE_KEY = "maquina-conteudo-v1";

const COR_FUNIL: Record<Pauta["funil"], string> = {
  topo: "bg-sky-100 text-sky-700",
  meio: "bg-amber-100 text-amber-700",
  fundo: "bg-emerald-100 text-emerald-700",
};

interface Estado {
  perfil: PerfilMarca;
  estrategia: Estrategia | null;
  pacotes: Record<string, PacoteConteudo>;
  reaproveitamento: Reaproveitamento | null;
}

async function chamar<T>(payload: unknown): Promise<T> {
  const res = await fetch("/api/maquina", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro ?? "Falha na geração.");
  return data as T;
}

function copiar(texto: string) {
  navigator.clipboard?.writeText(texto).catch(() => {});
}

function baixar(nome: string, conteudo: string, tipo: string) {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

/** Distribui as pautas a partir de amanhã, em dias espaçados conforme a frequência semanal. */
function montarCalendario(pautas: Pauta[], porSemana: number) {
  const dias = Math.max(1, Math.min(7, porSemana));
  const offsets = Array.from({ length: dias }, (_, i) => Math.floor((i * 7) / dias));
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  inicio.setDate(inicio.getDate() + 1);
  return pautas.map((pauta, i) => {
    const semana = Math.floor(i / dias);
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + semana * 7 + offsets[i % dias]);
    return { data: d, pauta };
  });
}

export default function MaquinaPage() {
  const [aba, setAba] = useState<Aba>("marca");
  const [estado, setEstado] = useState<Estado>({
    perfil: PERFIL_VAZIO,
    estrategia: null,
    pacotes: {},
    reaproveitamento: null,
  });
  const [carregado, setCarregado] = useState(false);
  const [quantidade, setQuantidade] = useState(12);
  const [textoLongo, setTextoLongo] = useState("");
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pautaAberta, setPautaAberta] = useState<string | null>(null);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      if (salvo) setEstado(JSON.parse(salvo));
    } catch {}
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
    } catch {}
  }, [estado, carregado]);

  const { perfil, estrategia, pacotes, reaproveitamento } = estado;
  const perfilOk = perfil.nome && perfil.nicho && perfil.publico && perfil.oferta;

  const setPerfil = (p: Partial<PerfilMarca>) =>
    setEstado((s) => ({ ...s, perfil: { ...s.perfil, ...p } }));

  async function executar(chave: string, fn: () => Promise<void>) {
    setErro(null);
    setCarregando(chave);
    try {
      await fn();
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setCarregando(null);
    }
  }

  const gerarEstrategia = () =>
    executar("estrategia", async () => {
      const r = await chamar<Estrategia>({ acao: "estrategia", perfil, quantidade });
      setEstado((s) => ({ ...s, estrategia: r, pacotes: {} }));
      setAba("estrategia");
    });

  const produzir = (pauta: Pauta) =>
    executar(pauta.id, async () => {
      const r = await chamar<PacoteConteudo>({ acao: "produzir", perfil, pauta });
      setEstado((s) => ({ ...s, pacotes: { ...s.pacotes, [pauta.id]: r } }));
      setPautaAberta(pauta.id);
      setAba("producao");
    });

  const produzirTodas = () =>
    executar("lote", async () => {
      const pendentes = (estrategia?.pautas ?? []).filter((p) => !pacotes[p.id]);
      // Três por vez, para não estourar o limite de requisições.
      for (let i = 0; i < pendentes.length; i += 3) {
        const lote = pendentes.slice(i, i + 3);
        const resultados = await Promise.allSettled(
          lote.map((pauta) => chamar<PacoteConteudo>({ acao: "produzir", perfil, pauta })),
        );
        setEstado((s) => {
          const novos = { ...s.pacotes };
          resultados.forEach((res, j) => {
            if (res.status === "fulfilled") novos[lote[j].id] = res.value;
          });
          return { ...s, pacotes: novos };
        });
      }
      setAba("producao");
    });

  const reaproveitar = () =>
    executar("reaproveitar", async () => {
      const r = await chamar<Reaproveitamento>({ acao: "reaproveitar", perfil, textoLongo });
      setEstado((s) => ({ ...s, reaproveitamento: r }));
    });

  const calendario = useMemo(
    () => montarCalendario(estrategia?.pautas ?? [], perfil.postsPorSemana),
    [estrategia, perfil.postsPorSemana],
  );

  function exportarCSV() {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const linhas = [
      ["data", "formato", "funil", "pilar", "titulo", "gancho", "legenda", "hashtags"].join(","),
      ...calendario.map(({ data, pauta }) => {
        const pk = pacotes[pauta.id];
        return [
          data.toISOString().slice(0, 10),
          pauta.formato,
          pauta.funil,
          pauta.pilar,
          pauta.titulo,
          pk?.ganchos[0] ?? pauta.gancho,
          pk?.legenda ?? "",
          pk?.hashtags.join(" ") ?? "",
        ]
          .map((v) => esc(String(v)))
          .join(",");
      }),
    ];
    baixar("calendario-conteudo.csv", "﻿" + linhas.join("\n"), "text/csv;charset=utf-8");
  }

  const abas: { id: Aba; label: string; desabilitada?: boolean }[] = [
    { id: "marca", label: "1. Marca" },
    { id: "estrategia", label: "2. Estratégia", desabilitada: !estrategia },
    { id: "producao", label: "3. Produção", desabilitada: !Object.keys(pacotes).length },
    { id: "calendario", label: "4. Calendário", desabilitada: !estrategia },
    { id: "reaproveitar", label: "♻️ Reaproveitar" },
  ];

  const produzidas = Object.keys(pacotes).length;
  const total = estrategia?.pautas.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-gradient-to-br from-bg-gradient-from via-bg-gradient-via to-bg-gradient-to text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <p className="text-amber-300 font-semibold text-xs uppercase tracking-widest mb-2">
            Máquina de Conteúdo IA
          </p>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            Da estratégia ao post pronto, num fluxo só
          </h1>
          <p className="text-white/80 mt-2 max-w-2xl">
            Descreva a marca, gere pilares e pautas, produza roteiros, carrosséis e legendas, e
            exporte o calendário. Também transforma um vídeo longo em vários posts.
          </p>
          {estrategia && (
            <p className="mt-4 text-sm text-white/90">
              {produzidas}/{total} pautas produzidas
            </p>
          )}
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {abas.map((a) => (
            <button
              key={a.id}
              disabled={a.desabilitada}
              onClick={() => setAba(a.id)}
              className={`px-4 py-3 text-sm font-semibold rounded-t-xl whitespace-nowrap transition ${
                aba === a.id
                  ? "bg-slate-50 text-primary"
                  : "text-white/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {a.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {erro && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {erro}
          </div>
        )}

        {aba === "marca" && (
          <section className="grid md:grid-cols-2 gap-5 animate-fade-in">
            <Campo label="Nome da marca / perfil *" valor={perfil.nome} onChange={(v) => setPerfil({ nome: v })} placeholder="Ex.: Aliny Nutri" />
            <Campo label="Nicho *" valor={perfil.nicho} onChange={(v) => setPerfil({ nicho: v })} placeholder="Ex.: emagrecimento feminino sem dieta restritiva" />
            <Campo label="Público-alvo *" valor={perfil.publico} onChange={(v) => setPerfil({ publico: v })} placeholder="Ex.: mulheres de 30 a 45 anos, mães, rotina corrida" area />
            <Campo label="Oferta principal *" valor={perfil.oferta} onChange={(v) => setPerfil({ oferta: v })} placeholder="Ex.: consultoria online de 3 meses, R$ 497" area />
            <Campo label="Tom de voz" valor={perfil.tom} onChange={(v) => setPerfil({ tom: v })} placeholder="Ex.: próximo, direto, bem-humorado, sem terrorismo nutricional" />
            <Campo label="Diferencial" valor={perfil.diferencial} onChange={(v) => setPerfil({ diferencial: v })} placeholder="Ex.: método de 3 pilares com cardápio flexível" />
            <Campo label="Referências / perfis que admira" valor={perfil.referencias} onChange={(v) => setPerfil({ referencias: v })} placeholder="Ex.: @perfil1, @perfil2, estilo de vídeo falando para a câmera" area />
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2">Plataformas</p>
                <div className="flex flex-wrap gap-2">
                  {PLATAFORMAS.map((pl) => {
                    const ativo = perfil.plataformas.includes(pl);
                    return (
                      <button
                        key={pl}
                        onClick={() =>
                          setPerfil({
                            plataformas: ativo
                              ? perfil.plataformas.filter((x) => x !== pl)
                              : [...perfil.plataformas, pl],
                          })
                        }
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          ativo ? "bg-primary text-white border-primary" : "bg-white border-slate-300"
                        }`}
                      >
                        {pl}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-4">
                <label className="text-sm font-semibold flex-1">
                  Posts por semana
                  <input type="number" min={1} max={14} value={perfil.postsPorSemana} onChange={(e) => setPerfil({ postsPorSemana: Number(e.target.value) || 1 })} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
                </label>
                <label className="text-sm font-semibold flex-1">
                  Pautas a gerar
                  <input type="number" min={3} max={30} value={quantidade} onChange={(e) => setQuantidade(Math.min(30, Math.max(3, Number(e.target.value) || 3)))} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal" />
                </label>
              </div>
            </div>
            <div className="md:col-span-2">
              <BotaoPrincipal onClick={gerarEstrategia} disabled={!perfilOk || !!carregando} carregando={carregando === "estrategia"}>
                Gerar estratégia e pautas →
              </BotaoPrincipal>
            </div>
          </section>
        )}

        {aba === "estrategia" && estrategia && (
          <section className="space-y-8 animate-fade-in">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase text-primary mb-1">Posicionamento</p>
              <p className="text-lg font-bold">{estrategia.posicionamento}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {(["dores", "desejos", "objecoes"] as const).map((k) => (
                <div key={k} className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-bold mb-2 capitalize">{k === "objecoes" ? "Objeções" : k}</p>
                  <ul className="text-sm space-y-1 list-disc pl-4 text-slate-600">
                    {estrategia.avatar[k].map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {estrategia.pilares.map((p) => (
                <div key={p.nome} className="rounded-2xl bg-white px-4 py-3 shadow-sm flex-1 min-w-[200px]">
                  <p className="font-bold">{p.nome} <span className="text-primary">{p.percentual}%</span></p>
                  <p className="text-xs text-slate-500">{p.objetivo}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-extrabold">Pautas ({estrategia.pautas.length})</h2>
              <BotaoPrincipal onClick={produzirTodas} disabled={!!carregando || produzidas === total} carregando={carregando === "lote"}>
                ⚡ Produzir todas ({total - produzidas} pendentes)
              </BotaoPrincipal>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {estrategia.pautas.map((p) => (
                <article key={p.id} className="rounded-2xl bg-white p-5 shadow-sm flex flex-col">
                  <div className="flex gap-2 mb-2 text-xs font-semibold">
                    <span className={`px-2 py-0.5 rounded-full ${COR_FUNIL[p.funil]}`}>{p.funil}</span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{p.formato}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{p.pilar}</span>
                  </div>
                  <h3 className="font-bold">{p.titulo}</h3>
                  <p className="text-sm mt-1">🎣 <em>{p.gancho}</em></p>
                  <p className="text-xs text-slate-500 mt-2 flex-1">{p.porqueFunciona}</p>
                  <button
                    onClick={() => (pacotes[p.id] ? (setPautaAberta(p.id), setAba("producao")) : produzir(p))}
                    disabled={!!carregando && !pacotes[p.id]}
                    className="mt-4 self-start text-sm font-semibold text-primary hover:underline disabled:opacity-40"
                  >
                    {carregando === p.id ? "Produzindo…" : pacotes[p.id] ? "✅ Ver pacote" : "Produzir conteúdo →"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {aba === "producao" && estrategia && (
          <section className="grid md:grid-cols-[260px_1fr] gap-6 animate-fade-in">
            <aside className="space-y-1">
              {estrategia.pautas.filter((p) => pacotes[p.id]).map((p) => (
                <button key={p.id} onClick={() => setPautaAberta(p.id)} className={`w-full text-left text-sm px-3 py-2 rounded-xl ${pautaAberta === p.id ? "bg-primary text-white" : "hover:bg-white"}`}>
                  {p.titulo}
                </button>
              ))}
            </aside>
            {pautaAberta && pacotes[pautaAberta] ? (
              <PacoteView pacote={pacotes[pautaAberta]} pauta={estrategia.pautas.find((p) => p.id === pautaAberta)!} />
            ) : (
              <p className="text-slate-500">Selecione uma pauta produzida.</p>
            )}
          </section>
        )}

        {aba === "calendario" && estrategia && (
          <section className="animate-fade-in">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h2 className="text-xl font-extrabold">Calendário editorial</h2>
              <div className="flex gap-2">
                <button onClick={exportarCSV} className="px-4 py-2 rounded-xl bg-white border text-sm font-semibold">⬇ CSV (Sheets/Notion)</button>
                <button onClick={() => baixar("maquina-conteudo.json", JSON.stringify(estado, null, 2), "application/json")} className="px-4 py-2 rounded-xl bg-white border text-sm font-semibold">⬇ JSON completo</button>
              </div>
            </div>
            <div className="rounded-2xl bg-white shadow-sm divide-y">
              {calendario.map(({ data, pauta }) => (
                <div key={pauta.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                  <span className="w-28 font-semibold capitalize">
                    {data.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${COR_FUNIL[pauta.funil]}`}>{pauta.funil}</span>
                  <span className="w-20 text-violet-700">{pauta.formato}</span>
                  <span className="flex-1">{pauta.titulo}</span>
                  <span>{pacotes[pauta.id] ? "✅" : "⏳"}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {aba === "reaproveitar" && (
          <section className="space-y-5 animate-fade-in">
            <p className="text-slate-600">
              Cole a transcrição de um vídeo, live, podcast ou artigo. A máquina corta em várias
              peças prontas, cada uma presa a um trecho do original. Preencha a aba Marca antes.
            </p>
            <textarea value={textoLongo} onChange={(e) => setTextoLongo(e.target.value)} rows={10} placeholder="Cole aqui o texto ou a transcrição…" className="w-full rounded-2xl border border-slate-300 p-4 text-sm" />
            <BotaoPrincipal onClick={reaproveitar} disabled={!perfilOk || textoLongo.length < 50 || !!carregando} carregando={carregando === "reaproveitar"}>
              ♻️ Transformar em posts
            </BotaoPrincipal>
            {reaproveitamento && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-primary">Ideia central</p>
                  <p className="font-bold">{reaproveitamento.ideiaCentral}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {reaproveitamento.pecas.map((p, i) => (
                    <article key={i} className="rounded-2xl bg-white p-5 shadow-sm">
                      <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">{p.formato}</span>
                      <h3 className="font-bold mt-2">{p.titulo}</h3>
                      <p className="text-sm mt-1">🎣 <em>{p.gancho}</em></p>
                      <p className="text-sm whitespace-pre-wrap mt-3 text-slate-700">{p.conteudo}</p>
                      <blockquote className="mt-3 border-l-4 border-primary-light pl-3 text-xs text-slate-500">“{p.trechoOriginal}”</blockquote>
                      <BotaoCopiar texto={`${p.gancho}\n\n${p.conteudo}`} />
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function PacoteView({ pacote, pauta }: { pacote: PacoteConteudo; pauta: Pauta }) {
  const roteiroTexto = pacote.roteiroReels.cenas
    .map((c) => `[${c.tempo}] ${c.fala}\nTEXTO NA TELA: ${c.textoNaTela}\nVISUAL: ${c.visual}`)
    .join("\n\n") + `\n\nCTA: ${pacote.roteiroReels.cta}`;
  const carrosselTexto = pacote.carrossel.map((s, i) => `Slide ${i + 1}: ${s.titulo}\n${s.texto}`).join("\n\n");
  const legendaTexto = `${pacote.legenda}\n\n${pacote.hashtags.join(" ")}`;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-extrabold">{pauta.titulo}</h2>
        <div className="text-center shrink-0">
          <p className="text-3xl font-extrabold text-primary">{pacote.notaViralidade}</p>
          <p className="text-[10px] uppercase text-slate-500">nota viral</p>
        </div>
      </div>

      <Bloco titulo="🎣 Ganchos (teste A/B)" copiarTexto={pacote.ganchos.join("\n")}>
        <ol className="list-decimal pl-5 text-sm space-y-1">{pacote.ganchos.map((g) => <li key={g}>{g}</li>)}</ol>
      </Bloco>

      <Bloco titulo={`🎬 Roteiro de reels (${pacote.roteiroReels.duracaoSegundos}s)`} copiarTexto={roteiroTexto}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500">
              <tr><th className="py-1 pr-3">Tempo</th><th className="pr-3">Fala</th><th className="pr-3">Texto na tela</th><th>Visual</th></tr>
            </thead>
            <tbody className="align-top">
              {pacote.roteiroReels.cenas.map((c, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 pr-3 font-mono text-xs">{c.tempo}</td>
                  <td className="pr-3">{c.fala}</td>
                  <td className="pr-3 font-semibold">{c.textoNaTela}</td>
                  <td className="text-slate-500">{c.visual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm mt-3"><strong>CTA:</strong> {pacote.roteiroReels.cta}</p>
      </Bloco>

      <Bloco titulo="🖼️ Carrossel" copiarTexto={carrosselTexto}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {pacote.carrossel.map((s, i) => (
            <div key={i} className="shrink-0 w-48 h-48 rounded-xl bg-gradient-to-br from-primary to-secondary text-white p-4 flex flex-col">
              <span className="text-[10px] opacity-70">{i + 1}/{pacote.carrossel.length}</span>
              <p className="font-bold text-sm">{s.titulo}</p>
              <p className="text-xs mt-2 opacity-90 overflow-hidden">{s.texto}</p>
            </div>
          ))}
        </div>
      </Bloco>

      <Bloco titulo="✍️ Legenda + hashtags" copiarTexto={legendaTexto}>
        <p className="text-sm whitespace-pre-wrap">{pacote.legenda}</p>
        <p className="text-sm text-primary mt-3">{pacote.hashtags.join(" ")}</p>
      </Bloco>

      <div className="grid md:grid-cols-2 gap-5">
        <Bloco titulo="📱 Sequência de stories" copiarTexto={pacote.stories.join("\n")}>
          <ol className="list-decimal pl-5 text-sm space-y-1">{pacote.stories.map((s) => <li key={s}>{s}</li>)}</ol>
        </Bloco>
        <Bloco titulo="🎨 Prompts de imagem" copiarTexto={pacote.promptsImagem.join("\n\n")}>
          <ul className="text-xs space-y-2 font-mono text-slate-600">{pacote.promptsImagem.map((p) => <li key={p}>{p}</li>)}</ul>
        </Bloco>
      </div>

      <Bloco titulo="🔍 Checklist de qualidade">
        <ul className="text-sm space-y-1">
          {pacote.checklistQualidade.map((c) => (
            <li key={c.criterio}>
              {c.ok ? "✅" : "⚠️"} <strong>{c.criterio}</strong>
              {!c.ok && c.ajuste && <span className="text-slate-500"> | {c.ajuste}</span>}
            </li>
          ))}
        </ul>
      </Bloco>
    </div>
  );
}

function Bloco({ titulo, copiarTexto, children }: { titulo: string; copiarTexto?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold">{titulo}</h3>
        {copiarTexto && <BotaoCopiar texto={copiarTexto} />}
      </div>
      {children}
    </div>
  );
}

function BotaoCopiar({ texto }: { texto: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => {
        copiar(texto);
        setOk(true);
        setTimeout(() => setOk(false), 1500);
      }}
      className="text-xs font-semibold text-primary hover:underline mt-2"
    >
      {ok ? "Copiado!" : "Copiar"}
    </button>
  );
}

function Campo({ label, valor, onChange, placeholder, area }: { label: string; valor: string; onChange: (v: string) => void; placeholder?: string; area?: boolean }) {
  const cls = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal text-sm";
  return (
    <label className="text-sm font-semibold block">
      {label}
      {area ? (
        <textarea value={valor} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
      ) : (
        <input value={valor} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </label>
  );
}

function BotaoPrincipal({ onClick, disabled, carregando, children }: { onClick: () => void; disabled?: boolean; carregando?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {carregando ? "Gerando… (pode levar até 1 min)" : children}
    </button>
  );
}
