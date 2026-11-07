import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import {
  EstrategiaSchema,
  PacoteConteudoSchema,
  ReaproveitamentoSchema,
  RequisicaoSchema,
} from "@/lib/maquina/schemas";
import {
  SYSTEM_PROMPT,
  promptEstrategia,
  promptProducao,
  promptReaproveitar,
} from "@/lib/maquina/prompts";

export const runtime = "nodejs";
export const maxDuration = 300;

const MODEL = process.env.MAQUINA_MODEL ?? "claude-opus-5-5";

const client = new Anthropic();

async function gerar<T extends z.ZodType>(
  schema: T,
  userPrompt: string,
  effort: "low" | "medium" | "high",
): Promise<z.infer<T>> {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    // Se o modelo principal recusar, a API tenta automaticamente um modelo alternativo.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userPrompt }],
    output_config: { effort, format: betaZodOutputFormat(schema) },
  });

  if (response.stop_reason === "refusal") {
    throw new ErroMaquina(422, "O modelo recusou este pedido. Ajuste o tema e tente de novo.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new ErroMaquina(502, "A resposta ficou longa demais. Peça menos itens.");
  }
  if (!response.parsed_output) {
    throw new ErroMaquina(502, "Não foi possível interpretar a resposta do modelo.");
  }
  return response.parsed_output as z.infer<T>;
}

class ErroMaquina extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ erro: "JSON inválido." }, { status: 400 });
  }

  const parsed = RequisicaoSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { erro: "Dados inválidos.", detalhes: parsed.error.issues },
      { status: 400 },
    );
  }
  const r = parsed.data;

  try {
    switch (r.acao) {
      case "estrategia":
        return Response.json(
          await gerar(EstrategiaSchema, promptEstrategia(r.perfil, r.quantidade), "high"),
        );
      case "produzir":
        return Response.json(
          await gerar(PacoteConteudoSchema, promptProducao(r.perfil, r.pauta), "medium"),
        );
      case "reaproveitar":
        return Response.json(
          await gerar(
            ReaproveitamentoSchema,
            promptReaproveitar(r.perfil, r.textoLongo),
            "medium",
          ),
        );
    }
  } catch (error) {
    if (error instanceof ErroMaquina) {
      return Response.json({ erro: error.message }, { status: error.status });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { erro: "ANTHROPIC_API_KEY ausente ou inválida no servidor." },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json(
        { erro: "Limite de uso atingido. Aguarde um pouco e tente de novo." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { erro: `Erro da API (${error.status}): ${error.message}` },
        { status: 502 },
      );
    }
    console.error(error);
    return Response.json(
      {
        erro: "Erro inesperado. Confira se ANTHROPIC_API_KEY está configurada no .env.local e veja o log do servidor.",
      },
      { status: 500 },
    );
  }
}
