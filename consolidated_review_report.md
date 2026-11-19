# Consolidated Review Report — `docs/designs/equilibrium.md`

* **Target Document:** `docs/designs/equilibrium.md` (FeatureRange: `1..312`, DetailedRange: `313..460`)
* **Date:** 2026-11-19
* **Stages Executed:** Stage 5 (`egm-zoom-out`), Stage 6 (`egm-comprehension`), Stage 7 (`egm-design`, `egm-structural`, `egm-style`), Stage 8 (Intermediate Zoom Out), Stage 9 (`egm-implementation-readiness`, `egm-codebase-details`, `egm-style`)

---

## Executive Summary

La struttura generale del documento e le scelte macro-architetturali (app client-only senza backend, Capacitor + Vite/React/TS, Modalità TV via mirroring di sistema, PDF locale e audio MP3 offline) reggono la verifica. Tuttavia, i revisori hanno individuato **5 🔴 Blocker** tecnici/architetturali che causerebbero fallimenti immediati in build CI, su Android 12–15 o nell'implementazione, più **10 🟡 Major** e **6 🟢 Nit** da risolvere prima di iniziare a scrivere codice.

---

## 🔴 Blocker (Da risolvere obbligatoriamente prima dell'implementazione)

### B1. Contraddizione sull'offline Web (manca Service Worker)
* **Righe**: `27`, `50–52`, `80–125`, `231–232`, `262`
* **Problema**: `Goals`, `CUJ 1` e `Non-Functional Requirements` (riga 262) richiedono funzionamento senza rete dopo il caricamento iniziale anche sulla Web App, ma il `Technical Plan` non include alcun Service Worker e carica MP4, MP3 e PDF on-demand (lazy).
* **Azione consigliata**: Ridimensionare esplicitamente `Goals`/`CUJ 1`/`NFR` chiarendo che l'offline totale (modalità aereo) è garantito dall'APK Android, mentre la Web App richiede rete per i media caricati on-demand (evitando la complessità di un Service Worker con `RangeRequestsPlugin` per iOS Safari). In alternativa, aggiungere esplicitamente `vite-plugin-pwa` (solo target Web) con supporto `206 Partial Content`.

### B2. Incompatibilità Java 17 vs Capacitor 7+, `versionCode` fisso e `android/gradlew` da Windows
* **Righe**: `250–258`, `319`, `416–426`
* **Problema**:
  1. `package.json` non fissa la major version di Capacitor: installando Capacitor 7+ (AGP 8.7+), il build richiede **Java 21**, mentre `build-android-apk.yml` imposta **Java 17** (fallimento garantito in CI).
  2. `versionCode` non viene incrementato tra release (es. da `GITHUB_RUN_NUMBER`), impedendo aggiornamenti in-place dell'APK e causando la perdita di `@capacitor/preferences` (storico sessioni).
  3. Generando `android/` su Windows, `android/gradlew` perde spesso il bit eseguibile su Linux (`Permission denied` in CI) e mancano i permessi `GITHUB_TOKEN` (`pages: write`, `id-token: write`, `contents: write`) e la guardia `signingConfigs.release` in `build.gradle`.
* **Azione consigliata**: Fissare Capacitor v7 + **Java 21** (o Capacitor v6 + Java 17), dichiarare `android/` versionata in Git, parametrizzare `versionCode` da `GITHUB_RUN_NUMBER`, aggiungere `chmod +x android/gradlew` e i permessi `GITHUB_TOKEN` nei workflow.

### B3. Dipendenze e file mancanti per build TypeScript, entrypoint React e ESLint v9
* **Righe**: `319`, `323`, `337–339`, `384–386`, `425`, `446`
* **Problema**:
  1. Manca `src/main.tsx` nei Target Files.
  2. `package.json` omette `@types/react` e `@types/react-dom` (`npx tsc --noEmit` fallisce).
  3. `package.json` elenca solo `eslint` senza `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks` e manca `eslint.config.js` (`npm run lint` fallisce con ESLint v9).
* **Azione consigliata**: Aggiungere `src/main.tsx`, `eslint.config.js`, `src/vite-env.d.ts` e le dipendenze dev mancanti in `package.json`.

### B4. Incompatibilità `pdfjs-dist` v4+ (Top-Level Await) con target `ES2020` e worker locale
* **Righe**: `323`, `327`, `396`, `444`
* **Problema**: `pdfjs-dist` v4+ usa *Top-Level Await*, che rompe `vite build` con target `ES2020`. Inoltre manca la specifica dell'import `?url` del worker (`pdfjs-dist/build/pdf.worker.min.mjs?url`), `src/vite-env.d.ts`, il tetto massimo DPR/canvas per iOS Safari (limite 16,7M px) e `renderTask.cancel()` al cambio pagina rapido.
* **Azione consigliata**: Impostare `build.target: 'es2022'` (e `optimizeDeps.esbuildOptions.target: 'es2022'`), specificare il pattern `?url` + `vite-env.d.ts`, imporre un cap su `outputScale` e cancellare i render pendenti in `PdfViewer.tsx`.

### B5. Specifiche `LocalNotifications` Android incomplete (ID `int32`, canale Android 8+, `smallIcon`, `allowWhileIdle`)
* **Righe**: `178`, `210`, `257`, `265`, `329–331`, `370`, `416–420`, `456`
* **Problema**:
  1. `allowWhileIdle: true` richiede `SCHEDULE_EXACT_ALARM` (assente nel manifest e negato di default su Android 14+, rischio `SecurityException`).
  2. La formula `reminder.id * 10 + dayIndex` va in overflow `int32` se `reminder.id` usa un timestamp, e non definisce `dayIndex` né la cancellazione degli ID orfani.
  3. Il canale notifica Android 8+ non si crea da `capacitor.config.ts` ma a runtime con `LocalNotifications.createChannel()`, e `smallIcon` custom richiede la risorsa drawable in `android/app/src/main/res/drawable/`.
* **Azione consigliata**: Rimuovere `allowWhileIdle: true` (coerente con la tolleranza a Doze Mode a riga 265), usare ID sequenziali piccoli (o semplificare a un singolo programma settimanale con 7 ID fissi `1..7`), chiamare `createChannel()` + `getPending()`/`cancel()` in `remindersAdapter`, ed elencare la risorsa drawable o usare l'icona di default.

### B6. Mappatura GIF non risolta e naming incoerente dei media
* **Righe**: `44`, `153–154`, `345–347`, `353–355`, `363`
* **Problema**: I 6 file `gif/Gemini_Generated_Gif_*.gif` non sono ancora mappati agli esercizi `01`–`06`, bloccando l'esecuzione deterministica di `convert_gifs.py`. Inoltre la riga 355 indica `01..06.jpg`/`.mp4` mentre le righe 153–154 e 347 usano nomi estesi (`01_stazione_monopodalica.mp4`).
* **Azione consigliata**: Eseguire la mappatura visiva delle 6 GIF e riportare nel documento la tabella completa `id -> GIF sorgente -> JPG sorgente -> nome file target` uniforme.

---

## 🟡 Major (Decisioni aperte, rischi di runtime e coerenza)

### M1. Quirk iOS Safari su Audio, `AudioContext` (tasto Mute fisico / `interrupted`) e Swipe
* **Righe**: `215`, `220`, `224`, `382`, `401`
* **Problema**: Su iPhone con interruttore fisico silenzioso attivo, `<audio>` (voce) si sente ma `AudioContext` (beep timer) è silenziato da iOS; inoltre `AudioContext` passa in stato `interrupted` dopo telefonate/background e richiede `resume()` su gesto utente; lo swipe touch può perdere la user activation per `audio.play()`. Inoltre la pausa della voce su `visibilitychange` (riga 224) è omessa nel Detailed Plan (riga 382/401).
* **Azione consigliata**: Aggiungere feedback visivo evidente a fine timer (flash/animazione), gestire `audioCtx.resume()` su gesto utente, `.catch()` su `NotAllowedError` e chiamata esplicita `audioCoach.pause()` su `visibilitychange` in `SessionPage.tsx`.

### M2. Semantica ambigua della sessione (`completedExercises`, `intro.mp3`/`outro.mp3`, tasto Indietro Android, checkpoint)
* **Righe**: `56–58`, `172–174`, `213–224`, `243`, `351`, `401`
* **Problema**:
  * Non è definito come calcolare `completedExercises` (indice massimo raggiunto vs esercizi distinti vs indice corrente) né il caso `0` (chiusura immediata).
  * `intro.mp3` e `outro.mp3` sono generati da `generate_audio.py` ma non hanno trigger né regole per modalità `full`/`short`/`off` in `SessionPage.tsx`.
  * Manca `@capacitor/app` (`backButton` listener) su Android per evitare la chiusura accidentale della sessione con il gesto Indietro, e manca un checkpoint `activeSessionDraft` contro il kill della WebView in background.
* **Azione consigliata**: Definire la macchina a stati della sessione (`intro -> exercise[0..5] -> summary`), decidere se rimuovere `intro.mp3`/`outro.mp3` (YAGNI), definire il calcolo esatto di `completedExercises` + soglia minima salvataggio, e aggiungere `@capacitor/app` per intercettare `backButton`.

### M3. Orientamento orizzontale Modalità TV citato ma non implementato
* **Righe**: `227`, `319`, `365–370`, `402`
* **Problema**: La riga 227 afferma che l'APK "può forzare/suggerire l'orientamento orizzontale", ma non è previsto alcun plugin (`@capacitor/screen-orientation`) né metodo in `Platform Adapter` o `TvModeView.tsx`.
* **Azione consigliata**: O aggiungere `@capacitor/screen-orientation` al piano, oppure rimuovere il riferimento al blocco orientamento affidandosi alla rotazione di sistema del telefono.

### M4. Regole statistiche non definite e modulo puro mancante (`src/utils/stats.ts`)
* **Righe**: `30`, `66–70`, `404–406`, `434`
* **Problema**: Mancano le definizioni di "settimana corrente" (ISO Lun–Dom locale vs rolling 7 giorni), inclusione delle sessioni parziali (`completed: false`) nel target `3–5`, e definizione/necessità di `streak settimanale` (introdotto solo nel Detailed Plan). Manca inoltre `src/utils/stats.ts` nei Target Files pur essendo testato da `statsCalculation.test.ts`.
* **Azione consigliata**: Rimuovere `streak settimanale` (YAGNI) oppure definirne la formula esatta, fissare settimana ISO Lun–Dom locale, chiarire il conteggio delle sessioni parziali e aggiungere `src/utils/stats.ts` ai Target Files.

### M5. Semantica Import JSON e compatibilità Export JSON in Android WebView
* **Righe**: `204–205`, `368`, `410`
* **Problema**: Non è chiarito se `Importa JSON` sovrascrive o fonde `PersistedState` (né se risincronizza i promemoria su APK). Inoltre `<a download>` per `Esporta JSON` spesso fallisce silenziosamente dentro Android Capacitor WebView, e manca gestione errori `QuotaExceededError`/Safari Private Mode su `localStorage`.
* **Azione consigliata**: Definire sostituzione completa + risincronizzazione promemoria su APK, avvolgere `localStorage` in `try/catch`, e chiarire che l'export JSON tramite `<a download>` è per Web (oppure aggiungere `@capacitor/share` + `@capacitor/filesystem` per APK).

### M6. Semplificazioni YAGNI emerse da Zoom Out (valutazione proprietario)
* **Righe**: `27–31`, `177–184`, `216–219`, `232`, `341–355`
* **Problema**:
  1. **Multi-promemoria CRUD vs singolo programma settimanale**: un solo promemoria settimanale (toggle + giorni + orario, 7 ID fissi) semplifica drasticamente UI, stato e notifiche Android.
  2. **14 tracce audio vs 6 tracce**: `intro.mp3`/`outro.mp3` e la doppia scrittura `full`/`short` raddoppiano il lavoro redazionale; confermare se mantenere entrambe le lunghezze (richiesta esplicita utente) ma eliminare `intro.mp3`/`outro.mp3`.
  3. **Duplicazione binari in Git**: evitare di mantenere sia i sorgenti in root/`immagini/` sia copie in `public/media/` (spostare direttamente i sorgenti in `public/media/`).
* **Azione consigliata**: Applicare le semplificazioni approvate dal proprietario (in particolare: singolo programma settimanale + eliminazione duplicati binari e `intro`/`outro`).

### M7. Pipeline asset offline e prerequisiti locali non esplicitati
* **Righe**: `236–254`, `335`, `345–355`, `438`
* **Problema**: I workflow CI non installano Python/`ffmpeg`/`edge-tts`, implicando che gli MP4/MP3 generati vadano committati in `public/media/`, ma il testo a riga 236 è ambiguo. Manca `scripts/requirements.txt` (`edge-tts`) e una tabella peso stimato basata sui file reali (~5,8 MB attuali).
* **Azione consigliata**: Dichiarare esplicitamente che gli script girano in locale in sviluppo e che gli asset generati in `public/media/` sono committati nel repo; aggiungere `scripts/requirements.txt`.

### M8. Calo di altitudine nel `FeatureRange` (duplicazione col Detailed Plan)
* **Righe**: `129–197`, `204`, `210`, `220`, `226–227`, `240`, `245`
* **Problema**: Il `Technical Plan` include interfacce TypeScript campo-per-campo, chiavi letterali, frequenze audio, codici tasto e flag CLI `ffmpeg` che appartengono al `Detailed Implementation Plan`.
* **Azione consigliata**: Mantenere i contratti/flag nel Detailed Plan o sintetizzare il Technical Plan sui confini di componente.

### M9. Incoerenza rotta `"Promemoria"` e etichette UI
* **Righe**: `26`, `28`, `57`, `74`, `100`, `124`, `215`, `226`, `390`, `401`, `410`, `450`
* **Problema**: `CUJ 5` apre la sezione `"Promemoria"`, ma `§2 Routing` prevede solo `#/impostazioni`. Le etichette dei pulsanti variano tra `"Avanti"`/`"Successivo"`, `"Indietro"`/`"Precedente"`, `"Termina"`/`"Termina sessione"`, `"Spenta"`/`"Spento"`/`"Muto"`, `"Avvia Sessione Guidata"`/`"Inizia Sessione"`.
* **Azione consigliata**: Chiarire che Promemoria è una sezione di `#/impostazioni` e fissare un glossario unico delle etichette UI.

### M10. Timer in background (`visibilitychange` vs delta `Date.now()`) e cleanup Wake Lock
* **Righe**: `206–208`, `222–224`
* **Problema**: La riga 222 giustifica `Date.now()`/`performance.now()` per evitare derive in background mentre la riga 224 mette in pausa su `visibilitychange`. `performance.now()` può fermarsi in deep sleep su mobile.
* **Azione consigliata**: Usare solo `Date.now()` con clamp su delta negativi, chiarire che su `hidden` vanno in pausa cronometro, timer e voce e restano in pausa al rientro fino a conferma utente, e garantire `KeepAwake.allowSleep()` nel cleanup unmount.

---

## 🟢 Nit (Pulizia strutturale, tipizzazione e stile)

* **N1**: Importare `defineConfig` da `vitest/config` in `vite.config.ts` (o separare `vitest.config.ts`) per evitare errori TS in modalità `strict` (righe 321, 327).
* **N2**: Esplicitare la formula `(day % 7) + 1` per la conversione `daysOfWeek` (ISO 1–7 -> Capacitor 1=Dom..7=Sab), le chiavi esatte di `content/audio_scripts.json`, il fallback `#/` in `router.ts`, l'elenco raggruppato dei 4 GitHub Secrets e che il tab `Base` mostra `steps` (righe 180, 253, 343, 386, 401, 419, 438).
* **N3**: Filtrare `event.target` (`INPUT`/`TEXTAREA`/`SELECT`) nel listener globale di `Space` per evitare conflitti con pulsanti/campi testo (riga 226) e uniformare notazione `KeyR`/`KeyT` vs `R`/`T` (righe 401, 451).
* **N4**: Rimuovere `tvModeDefault` (YAGNI, righe 188, 410) e `@testing-library/react` se tutti i test sono unit test puri (riga 319).
* **N5**: Sistemare il bordo destro del diagramma ASCII (righe 110–112) e aggiungere riga vuota dopo gli H4 (righe 129, 161, 199).
* **N6**: Espandere l'acronimo `ITP` (*Intelligent Tracking Prevention*, riga 205) e sostituire espressioni soggettive/colloquiali (*"senza dipendenze pesanti"*, *"voce naturale di buona qualità"*, *"timer gigante"*, *"graziosamente"*, *"mobile-friendly"*, *"ad alta densità DPR"*, *"sotto sotto-percorso"*).

---

## Traceability Matrix

| Consolidated ID | Priority | Source Stages & Reviewers | Affected Lines |
| :--- | :--- | :--- | :--- |
| **B1** | 🔴 Blocker | S5 (`egm-zoom-out` #5), S6 (`egm-comprehension` #1), S7 (`egm-design` #1, `egm-structural` #1), S8 | 27, 50–52, 80–125, 231–232, 262 |
| **B2** | 🔴 Blocker | S7 (`egm-design` #3), S9 (`egm-codebase-details` #1, #6; `egm-implementation-readiness` #7) | 250–258, 319, 416–426 |
| **B3** | 🔴 Blocker | S9 (`egm-codebase-details` #2; `egm-implementation-readiness` #3) | 319, 323, 337–339, 384–386, 425, 446 |
| **B4** | 🔴 Blocker | S7 (`egm-design` #5), S9 (`egm-codebase-details` #3; `egm-implementation-readiness` #8) | 123, 232, 263, 323, 327, 396, 444 |
| **B5** | 🔴 Blocker | S6 (`egm-comprehension` #2, #10), S7 (`egm-design` #2), S9 (`egm-implementation-readiness` #2; `egm-codebase-details` #4, #5) | 178, 210, 257, 265, 329–331, 370, 416–420, 456 |
| **B6** | 🔴 Blocker | S7 (`egm-design` #12), S9 (`egm-implementation-readiness` #1; `egm-codebase-details` #7) | 44, 153–154, 345–347, 353–355, 363 |
| **M1** | 🟡 Major | S7 (`egm-design` #4), S9 (`egm-codebase-details` #9) | 215, 220, 224, 382, 401 |
| **M2** | 🟡 Major | S6 (`egm-comprehension` #3, #4), S7 (`egm-design` #6, #7, #8; `egm-structural` #2), S9 (`egm-implementation-readiness` #4) | 56–58, 172–174, 213–224, 243, 351, 401 |
| **M3** | 🟡 Major | S6 (`egm-comprehension` #5), S7 (`egm-design` #6; `egm-structural` #6; `egm-style` #3), S9 (`egm-implementation-readiness` #4) | 227, 319, 365–370, 402 |
| **M4** | 🟡 Major | S5 (`egm-zoom-out` #6), S6 (`egm-comprehension` #7), S7 (`egm-design` #8), S9 (`egm-implementation-readiness` #5; `egm-style` #2) | 30, 66–70, 404–406, 434 |
| **M5** | 🟡 Major | S7 (`egm-design` #8), S9 (`egm-implementation-readiness` #6) | 204–205, 368, 410 |
| **M6** | 🟡 Major | S5 (`egm-zoom-out` #2, #3, #4, #7), S8 | 27–31, 177–184, 216–219, 232, 341–355 |
| **M7** | 🟡 Major | S6 (`egm-comprehension` #6), S7 (`egm-design` #9), S9 (`egm-codebase-details` #10) | 236–254, 335, 345–355, 438 |
| **M8** | 🟡 Major | S5 (`egm-zoom-out` #1) | 129–197, 204, 210, 220, 226–227, 240, 245 |
| **M9** | 🟡 Major | S6 (`egm-comprehension` #9), S7 (`egm-structural` #3, #7; `egm-style` #1), S9 (`egm-style` #1) | 26, 28, 57, 74, 100, 124, 215, 226, 390, 401, 410, 450 |
| **M10** | 🟡 Major | S7 (`egm-design` #7) | 206–208, 222–224 |
| **N1–N6** | 🟢 Nit | S5–S9 (`egm-codebase-details` #8, `egm-comprehension` #8, #11, #12, `egm-design` #10, #11, `egm-structural` #4, #5, #6, `egm-style`, `egm-implementation-readiness` #9) | Varie |
