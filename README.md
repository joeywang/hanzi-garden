# 汉字小园 · Hanzi Garden

48 simplified characters in 8 early-primary themes, recorded pronunciation, words, stroke-order animation, guided writing, listening/word games and browser-local progress. Dark mode adapts the strokes, outlines and pen without replacing the writing pad.

Live site: https://hanzi.reallyenglish.cn

## Appearance and privacy

Light, dark and system themes are supported, with a preference remembered per app/browser. A same-origin bootstrap applies the theme before the main application bundle loads. Dark surfaces use a soft palette, not blanket colour inversion. No accounts, tracking, camera or microphone; learning progress stays in the browser.

## Run

Requires Node.js 22 and npm; optional asset/offline scripts use Python 3.

```sh
npm ci
npm run dev
```

Vite listens on loopback. `npm run build` creates static output in `dist/`; `npm run preview` serves that build locally. Deploy `dist/` at a domain root over HTTPS; preserve correct JavaScript/CSS/MP3/JSON MIME types and return 404 for missing assets.

## Verify

```sh
npm test
npm run build
npx playwright install chromium
npx playwright test
TEST_COLOR_SCHEME=dark npx playwright test
```

Playwright automatically starts an isolated local preview server. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to use an existing Chromium executable instead. CI runs unit tests, production builds and browser tests in light and dark modes. CI does not deploy the website.

## Learning assets

Recordings are unmodified syllables by Chen Wang, from `hugolpz/audio-cmn`. Source manifests in `public/` include commit-pinned original URLs, attribution, byte counts and SHA-256 hashes. Original attribution is preserved in `public/credits/`. Asset-fetch scripts under `scripts/` download the originals from upstream.

## Interest-led activities for roughly ages 8–10

The original beginner curriculum remains available. New activities add two word/sentence games (12 word clues and 8 four-part sentence puzzles) and a reading library of eight original short texts in three difficulty bands. Each article has three text-grounded comprehension checks, switchable full-article ruby pinyin and glossary pinyin, word explanations, larger text, evidence hints and an open-ended discussion prompt.

Reading difficulty is not an official school grade or assessment. Article completion means completing that article's practice questions, including assisted retries; it does not certify reading mastery. No full-article audio is supplied or claimed. Sentence puzzles explicitly practise one prompted word order, not every possible grammatical formulation.

Reading and challenge records use separate versioned local-storage keys without rewriting existing beginner progress. Wrong answers can be retried; hints and rereading have no penalty. There are no timers, rankings or recorded discussion answers. The parent reset clears the new records as well. Browser tests read and complete all eight articles, every word/sentence puzzle and the new mobile/dark flows.

## Regenerate reading annotations

Run `npm run generate:reading-pinyin` after editing article titles or body text, then review contextual pronunciations and run the tests. The pinned generator is a development-only dependency; it produces static `src/reading-pinyin.json`. Tests reject stale annotations and verify contextual readings such as 还书、系好、长高、安静地、只画下. The article pinyin switch shows/hides actual ruby annotations in the title/body as well as the glossary, without changing answers or progress. No dictionary or external pinyin service is loaded at runtime.

## Learning limitations

This is introductory learning material, not a complete official Mandarin/primary-school curriculum or an official textbook mapping. Adult guidance is recommended. Isolated-character citation pronunciations do not teach all contextual neutral tones or tone-sandhi rules; screen tracing does not replace pencil-and-paper practice.

## Licensing

No project-wide open-source license has yet been selected for the original application code. Third-party assets/dependencies retain their own licenses; public visibility does not relicense them. See [THIRD_PARTY.md](THIRD_PARTY.md), especially the upstream audio license-version caveat, before reuse or redistribution.

## Repository scope

Contains application source, tests and attributed learning assets. Excludes production infrastructure configuration, credentials, local operational records, backups and device-local progress.
