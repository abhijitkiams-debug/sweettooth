# ZeroSpike

An automated **low-GI food curation engine**, **programmatic SEO/GEO directory**, and
**affiliate monetization platform**. ZeroSpike scores packaged foods for blood-sugar
safety against their _real ingredient labels_ — monk fruit and stevia in, maltitol out —
and surfaces CGM-verified proof.

Built with **Next.js 14 (App Router)**, **TypeScript (strict)**, **Tailwind CSS**,
**Prisma + PostgreSQL**, **Framer Motion**, and a **multi-LLM curation backend**.

## Runs out of the box (no DB or API key required)

The app is designed to render fully with zero external services:

- **No `DATABASE_URL`?** The data layer (`src/lib/db/repository.ts`) transparently serves
  the bundled seed catalogue (`src/data/seed-products.ts`). Set `DATABASE_URL` +
  run the Prisma steps below to switch to a real database — no code changes.
- **No LLM key?** The curation engine falls back to a deterministic, offline rule-based
  scorer (`src/lib/engine/scoring-rules.ts`) that implements the PRD scoring tables exactly.

```bash
npm install
cp .env.example .env      # optional — the app runs without editing it
npm run dev               # http://localhost:3000
```

## Using a real PostgreSQL database

```bash
# 1. Set DATABASE_URL in .env
npm run prisma:generate
npm run prisma:push       # create tables from prisma/schema.prisma
npm run seed              # upsert the seed catalogue
npm run dev
```

## Multi-LLM curation backend

The ingredient evaluator talks only to the `LLMProvider` interface, so the model/provider
is chosen at runtime from env — adding a provider is one file in `src/lib/llm/`.

| Env var | Purpose |
| --- | --- |
| `LLM_PROVIDER` | `anthropic` \| `openai` \| `none` |
| `LLM_MODEL` | e.g. `claude-sonnet-5`, `claude-opus-5`, `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | provider credentials |
| `OPENAI_BASE_URL` | optional — point the OpenAI-compatible provider at another gateway |

When a provider is configured, the evaluator asks it for a structured judgement and then
**reconciles** it against the deterministic rules — a hard-fail ingredient (maltitol, HFCS,
dextrose, maltodextrin, …) always forces `DISQUALIFIED`/0, so a hallucinated score can never
pass an unsafe product.

Try it:

```bash
curl -X POST localhost:3000/api/evaluate \
  -H 'content-type: application/json' \
  -d '{"rawIngredients":"Almond flour, monk fruit, erythritol, psyllium husk"}'
```

## Architecture

```
prisma/schema.prisma          Product · AffiliateLink · HarvestedReview · YouTubeEmbed · SeoMetadata
src/data/                     seed catalogue + programmatic-SEO taxonomy (cravings / sweet-types)
src/lib/engine/               scoring-rules · evaluator · linkBuilder · seo (JSON-LD/GEO)
src/lib/llm/                  multi-provider LLM abstraction (anthropic · openai · none)
src/lib/db/                   prisma singleton + repository (DB → seed fallback)
src/lib/utils/                outboundRedirect (clipboard + popup fallback) · format
src/app/                      landing · products · product/[slug] · low-gi/[craving] ·
                              diabetic-friendly/[sweet-type] · methodology · api/{outbound,evaluate}
src/components/               ZeroSpikeScoreCard · GlucoseSpikeVisualizer · GeoClaimBlock ·
                              ProductCard/Grid · AffiliateBuyBox · TransferBridgeModal · reviews · video
```

## Curation scoring (PRD §3)

```
ZeroSpike Score = 100 − Glycemic Penalty − Additive Penalty
```

- **Disqualified (0):** maltitol, isomalt, HFCS, dextrose, maltodextrin, tapioca syrup.
- **Caution (40–79):** sorbitol, xylitol, sucralose, refined wheat-flour (maida).
- **Certified Safe (80–100):** monk fruit, stevia (Reb-M/Reb-A), allulose, erythritol on
  approved bases (almond/coconut flour, psyllium, flaxseed meal, resistant starch type 4).

Full rules are shown on the `/methodology` page.

## SEO / GEO

Every product and directory page emits `schema.org/Product`, `FAQPage`, and `BreadcrumbList`
JSON-LD, leads with a machine-readable **GEO answer block** (built to be quoted verbatim by AI
Overviews), and is registered in `sitemap.xml`. Product and directory routes use ISR
(`revalidate = 3600`).

## Affiliate flow (PRD §4–5)

`buildAffiliateRoute()` injects the right tracking param per tier
(`?tag=` Amazon, `?affid=` Flipkart, `?ref=` GoAffPro, coupon-copy for D2C). Buy clicks open
the **Transfer Bridge modal** (auto-copies coupon, shows a zero-spike safety checklist, native
`<a>` fail-safe) and route through `/api/outbound`, which logs a click metric before a 302.

## Scripts

| Script | |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js dev / prod build / serve |
| `npm run typecheck` / `lint` | TypeScript + ESLint |
| `npm run prisma:generate` / `prisma:push` / `seed` | database setup |
