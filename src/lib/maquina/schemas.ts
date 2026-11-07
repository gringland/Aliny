import { z } from "zod";

/* ---------- Entrada: perfil da marca ---------- */

export const PerfilMarcaSchema = z.object({
  nome: z.string(),
  nicho: z.string(),
  publico: z.string(),
  oferta: z.string(),
  tom: z.string(),
  diferencial: z.string(),
  plataformas: z.array(z.string()),
  postsPorSemana: z.number(),
  referencias: z.string(),
});
export type PerfilMarca = z.infer<typeof PerfilMarcaSchema>;

/* ---------- Etapa 1: estratégia (pilares + pautas) ---------- */

export const EtapaFunil = z.enum(["topo", "meio", "fundo"]);
export const Formato = z.enum(["reels", "carrossel", "post", "stories", "thread"]);

export const PautaSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  pilar: z.string(),
  funil: EtapaFunil,
  formato: Formato,
  gancho: z.string(),
  angulo: z.string(),
  porqueFunciona: z.string(),
});
export type Pauta = z.infer<typeof PautaSchema>;

export const EstrategiaSchema = z.object({
  posicionamento: z.string(),
  avatar: z.object({
    dores: z.array(z.string()),
    desejos: z.array(z.string()),
    objecoes: z.array(z.string()),
  }),
  pilares: z.array(
    z.object({
      nome: z.string(),
      objetivo: z.string(),
      percentual: z.number(),
    }),
  ),
  pautas: z.array(PautaSchema),
});
export type Estrategia = z.infer<typeof EstrategiaSchema>;

/* ---------- Etapa 2: produção (pacote completo por pauta) ---------- */

export const PacoteConteudoSchema = z.object({
  pautaId: z.string(),
  ganchos: z.array(z.string()),
  roteiroReels: z.object({
    duracaoSegundos: z.number(),
    cenas: z.array(
      z.object({
        tempo: z.string(),
        fala: z.string(),
        textoNaTela: z.string(),
        visual: z.string(),
      }),
    ),
    cta: z.string(),
  }),
  carrossel: z.array(
    z.object({
      titulo: z.string(),
      texto: z.string(),
    }),
  ),
  legenda: z.string(),
  hashtags: z.array(z.string()),
  stories: z.array(z.string()),
  promptsImagem: z.array(z.string()),
  checklistQualidade: z.array(
    z.object({
      criterio: z.string(),
      ok: z.boolean(),
      ajuste: z.string(),
    }),
  ),
  notaViralidade: z.number(),
});
export type PacoteConteudo = z.infer<typeof PacoteConteudoSchema>;

/* ---------- Etapa 3: reaproveitamento (1 conteúdo longo -> N peças) ---------- */

export const ReaproveitamentoSchema = z.object({
  ideiaCentral: z.string(),
  pecas: z.array(
    z.object({
      formato: Formato,
      titulo: z.string(),
      gancho: z.string(),
      conteudo: z.string(),
      trechoOriginal: z.string(),
    }),
  ),
});
export type Reaproveitamento = z.infer<typeof ReaproveitamentoSchema>;

/* ---------- Requisições da API ---------- */

export const RequisicaoSchema = z.discriminatedUnion("acao", [
  z.object({
    acao: z.literal("estrategia"),
    perfil: PerfilMarcaSchema,
    quantidade: z.number().int().min(3).max(30),
  }),
  z.object({
    acao: z.literal("produzir"),
    perfil: PerfilMarcaSchema,
    pauta: PautaSchema,
  }),
  z.object({
    acao: z.literal("reaproveitar"),
    perfil: PerfilMarcaSchema,
    textoLongo: z.string().min(50),
  }),
]);
export type Requisicao = z.infer<typeof RequisicaoSchema>;
