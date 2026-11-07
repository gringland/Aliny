import type { Pauta, PerfilMarca } from "./schemas";

/**
 * O system prompt fica estável (sem datas ou IDs) para aproveitar o cache de prompt.
 * Os dados variáveis (perfil, pauta, texto) entram na mensagem do usuário.
 */
export const SYSTEM_PROMPT = `Você é o estrategista-chefe de uma "máquina de conteúdo": uma equipe de social media, copywriter e roteirista de vídeos curtos em uma só pessoa. Escreva sempre em português do Brasil.

Princípios que guiam todo o seu trabalho:
- Ganchos nos 2 primeiros segundos: curiosidade, contraste, número específico, quebra de crença ou dor nomeada. Nada de "Olá, pessoal" ou "Neste vídeo".
- Cada peça tem UMA ideia central e UM CTA. Clareza acima de criatividade.
- Funil: topo atrai (alcance, identificação), meio educa e gera confiança (prova, método), fundo converte (oferta, objeções, urgência legítima).
- Linguagem da audiência: use as palavras que o público usa para descrever as próprias dores, não jargão do nicho.
- Prova vence promessa: exemplos concretos, números, bastidores e antes/depois em vez de adjetivos.
- Retenção em vídeo: troque de cena ou de texto na tela a cada 2-4 segundos; crie loops abertos e feche-os.
- Carrossel: o slide 1 é o gancho, o último é o CTA, cada slide interno entrega valor sozinho.
- Nunca invente depoimentos, números de clientes ou resultados da marca. Quando faltar um dado real, deixe um marcador como [INSERIR RESULTADO REAL].
- Respeite o tom de voz da marca e a plataforma de destino.`;

function blocoPerfil(p: PerfilMarca): string {
  return `<perfil_da_marca>
Nome: ${p.nome}
Nicho: ${p.nicho}
Público-alvo: ${p.publico}
Oferta principal: ${p.oferta}
Tom de voz: ${p.tom}
Diferencial: ${p.diferencial}
Plataformas: ${p.plataformas.join(", ")}
Frequência: ${p.postsPorSemana} posts por semana
Referências/inspirações: ${p.referencias || "não informado"}
</perfil_da_marca>`;
}

export function promptEstrategia(p: PerfilMarca, quantidade: number): string {
  return `${blocoPerfil(p)}

Monte a estratégia de conteúdo desta marca:
1. "posicionamento": uma frase de posicionamento afiada.
2. "avatar": de 4 a 6 dores, desejos e objeções reais do público, escritos como o público falaria.
3. "pilares": de 3 a 5 pilares de conteúdo com objetivo e percentual do mix (a soma deve dar 100).
4. "pautas": exatamente ${quantidade} pautas distribuídas entre os pilares, com cerca de 50% topo, 30% meio e 20% fundo de funil, variando os formatos conforme as plataformas. Cada pauta precisa de um id curto (p1, p2...), um gancho pronto para usar, o ângulo único e uma justificativa curta de por que vai performar.`;
}

export function promptProducao(p: PerfilMarca, pauta: Pauta): string {
  return `${blocoPerfil(p)}

<pauta>
ID: ${pauta.id}
Título: ${pauta.titulo}
Pilar: ${pauta.pilar}
Funil: ${pauta.funil}
Formato principal: ${pauta.formato}
Gancho sugerido: ${pauta.gancho}
Ângulo: ${pauta.angulo}
</pauta>

Produza o pacote completo desta pauta, pronto para gravar e publicar:
- "pautaId": "${pauta.id}"
- "ganchos": 5 variações de gancho para teste A/B (escolha a mais forte como primeira).
- "roteiroReels": um roteiro de 30 a 60 segundos dividido em cenas com tempo, fala, texto na tela e o que aparece visualmente, mais o CTA final.
- "carrossel": de 6 a 10 slides (título curto e texto de cada um).
- "legenda": a legenda completa com gancho na primeira linha, quebras de linha e CTA.
- "hashtags": de 5 a 12 hashtags que misturem volumes alto, médio e de nicho.
- "stories": uma sequência de 3 a 5 stories que leve ao post e engaje (enquete, caixinha, link).
- "promptsImagem": de 2 a 4 prompts em inglês para gerar capa e b-roll em uma IA de imagem.
- "checklistQualidade": avalie o próprio material em critérios como gancho, ideia única, prova, CTA e tom, marcando ok ou não ok e dizendo o ajuste necessário.
- "notaViralidade": de 0 a 10, uma nota honesta do potencial de alcance.`;
}

export function promptReaproveitar(p: PerfilMarca, texto: string): string {
  return `${blocoPerfil(p)}

<conteudo_longo>
${texto}
</conteudo_longo>

Transforme o conteúdo longo acima (transcrição de vídeo, live, podcast, artigo ou aula) em várias peças independentes:
- "ideiaCentral": a tese principal em uma frase.
- "pecas": de 6 a 10 peças de formatos variados (reels, carrossel, post, stories, thread). Cada peça deve ter gancho próprio, conteúdo pronto para publicar (roteiro, slides ou texto) e o trecho do original que a sustenta (citação curta e literal).
Use apenas ideias presentes no conteúdo original; não acrescente fatos novos.`;
}
