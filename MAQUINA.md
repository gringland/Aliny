# Máquina de Conteúdo IA

Rota: `/maquina` · API: `POST /api/maquina`

## Como rodar

```bash
cp .env.example .env.local   # coloque sua ANTHROPIC_API_KEY
npm install
npm run dev                  # abra http://localhost:3000/maquina
```

## Fluxo

1. **Marca**: nicho, público, oferta, tom, diferencial, plataformas e frequência.
2. **Estratégia**: posicionamento, avatar (dores, desejos e objeções), pilares com % do mix e N pautas
   distribuídas no funil (cerca de 50% topo, 30% meio e 20% fundo), cada uma com gancho e ângulo.
3. **Produção** (uma pauta ou todas em lote): 5 ganchos para teste A/B, roteiro de reels cena a cena
   (fala, texto na tela e visual), carrossel, legenda, hashtags, sequência de stories, prompts de
   imagem, autochecklist de qualidade e nota de viralidade.
4. **Calendário**: distribui as pautas nos próximos dias e exporta em CSV (Sheets/Notion) ou JSON.
5. **Reaproveitar**: cola uma transcrição de vídeo, live ou podcast e recebe de 6 a 10 peças,
   cada uma ligada ao trecho original.

O progresso fica salvo no navegador (localStorage).

## Arquivos

- `src/lib/maquina/schemas.ts`: esquemas Zod (saída estruturada e validada)
- `src/lib/maquina/prompts.ts`: o "cérebro": princípios de copy e prompts de cada etapa
- `src/app/api/maquina/route.ts`: chamada à API do Claude (saída estruturada, cache de prompt, fallback)
- `src/app/maquina/page.tsx`: interface

## Próximos passos sugeridos

- Gerar a voz (TTS) e o avatar a partir do roteiro, e as imagens a partir dos `promptsImagem`
- Agendar a publicação (Meta Graph API / TikTok) a partir do calendário
- Salvar marcas e pautas em banco (Supabase) para uso multiusuário
- Ciclo de aprendizado: importar métricas dos posts e retroalimentar a geração de pautas
