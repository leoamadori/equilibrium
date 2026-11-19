# Equilibrium — Web App e APK Android Offline per l'Equilibrio

* **Author:** Leo
* **Status:** Draft
* **Date:** 2026-11-19

--------------------------------------------------------------------------------

## Overview

Equilibrium è un'applicazione client-only, distribuita come Web App statica (ospitabile su GitHub Pages ed eseguibile in locale su PC, iPhone e Android) e come APK Android offline per uso personale e familiare. Trasforma la guida statica `guida_equilibrio_corpo_libero.pdf` (6 esercizi a corpo libero per l'equilibrio, circuito da 15–20 minuti, 3–5 volte a settimana) e i relativi contenuti visivi (`immagini/` e animazioni convertite da `gif/` in MP4) in uno strumento operativo che permette sia di studiare il documento sia di eseguire una sessione guidata con voce, timer, proiezione su TV via mirroring, storico locale e promemoria settimanali su Android.

## The Problem

Allenarsi seguendo un PDF statico di 21 pagine su smartphone o PC crea attriti concreti durante l'esecuzione pratica:

1. **Difficoltà di lettura durante gli esercizi**: scorrere manualmente un documento multipagina mentre si è in piedi su una gamba o distanti dallo schermo interrompe l'allenamento e rende poco leggibili istruzioni e immagini.
2. **Assenza di guida vocale e temporale**: gli esercizi combinano tenute isometriche a tempo (20–30 secondi), recuperi (30–60 secondi) e ripetizioni controllate; senza una voce guida e timer integrati l'utente deve alternare il PDF a un'app timer esterna e guardare continuamente lo schermo.
3. **Proiezione scomoda su TV**: mostrare un PDF verticale su uno schermo televisivo 16:9 lascia bande nere laterali e testo troppo piccolo da 2–3 metri di distanza.
4. **Mancanza di tracciamento e costanza**: il PDF consiglia 3–5 sessioni a settimana ma non offre alcun modo per registrare le sessioni svolte, la loro durata o ricevere un promemoria nei giorni pianificati.

La soluzione proposta unifica la guida originale, le schede interattive, la sessione vocale assistita, la vista orizzontale ad alto contrasto per TV, le statistiche locali e i promemoria nativi Android in una singola applicazione offline priva di server o account.

## Goals

* **Accesso immediato a doppio percorso**: all'avvio l'utente sceglie in un tocco se consultare la guida o iniziare una sessione di allenamento, con accesso diretto anche a statistiche e impostazioni/promemoria.
* **Consultazione completa del materiale**: rendere disponibili sia le 6 schede interattive (testi, dosaggi, passi, muscoli coinvolti, errori comuni, livelli Facile/Avanzato, immagini statiche e animazioni MP4 attivabili) sia il PDF originale `guida_equilibrio_corpo_libero.pdf` leggibile offline su PC, iPhone e Android.
* **Sessione guidata adattabile al ritmo dell'utente**: riprodurre una voce italiana naturale preregistrata (configurabile in Completa, Sintetica o Spenta), avanzare manualmente tra gli esercizi via tap/scroll/tastiera, offrire timer rapidi preimpostati per tenute e recuperi e tracciare la durata complessiva della sessione con un cronometro.
* **Leggibilità su TV tramite mirroring**: fornire una Modalità TV 16:9 ad alto contrasto con schermo sempre attivo (Wake Lock) fruibile da 2–3 metri via mirroring di sistema (Smart View, AirPlay, HDMI).
* **Tracciamento locale affidabile**: registrare in locale sul dispositivo data, durata e numero di esercizi svolti per sessione rispetto all'obiettivo di 3–5 sessioni settimanali, includendo esportazione e importazione manuale di backup JSON per prevenire perdite su iOS Safari.
* **Promemoria settimanali offline su Android**: consentire all'utente di configurare uno o più promemoria ricorrenti (giorni della settimana e ora) tramite notifiche locali native sull'APK Android.
* **Singola base di codice senza backend**: produrre Web App statica (GitHub Pages + esecuzione locale) e APK Android offline (peso target 12–18 MB) dallo stesso progetto senza server, login o costi ricorrenti.

## Non-Goals

* **Google Cast SDK / Custom Receiver Chromecast**: escluso per vincolo offline, costi/registrazione console e complessità di sincronizzazione stato tra telefono e TV.
* **Backend, account utente e sincronizzazione cloud**: le statistiche restano confinate al singolo dispositivo (con trasferimento opzionale solo tramite file JSON esportato manualmente).
* **Notifiche push programmate su Web App**: i promemoria ricorrenti nativi operano solo sull'APK Android.
* **Pubblicazione su Google Play Store o Apple App Store**: l'APK è destinato esclusivamente a installazione diretta (sideloading) per uso personale e familiare.
* **Analisi posturale tramite fotocamera o avanzamento automatico forzato**: l'app non usa computer vision e non impone il passaggio automatico da un esercizio al successivo senza conferma dell'utente.

## Open Questions

* **Mappatura delle 6 GIF originali**: prima della conversione in MP4 va verificato visivamente quale file `gif/Gemini_Generated_Gif_*.gif` corrisponde a ciascuno degli esercizi `01`–`06`.

## Critical User Journeys (CUJs)

### CUJ 1: Consultazione della Guida (Schede Interattive e PDF Originale)

* **Given**: L'utente apre l'app (Web App su PC/iPhone/Android o APK Android offline) e si trova nella schermata iniziale.
* **When**: Seleziona "Leggi la Guida", sfoglia le 6 schede interattive, apre una scheda per vedere l'animazione MP4 e i livelli Facile/Avanzato, e poi passa alla vista "PDF Originale" per consultare il documento completo.
* **Then**: Le anteprime caricano solo immagini JPG leggere, l'animazione MP4 si riproduce solo nella scheda aperta, e il PDF di 21 pagine si apre interamente offline con controlli di pagina e zoom funzionanti anche su iOS Safari e Android WebView.

### CUJ 2: Esecuzione di una Sessione Guidata con Voce e Timer

* **Given**: L'utente avvia una nuova sessione dalla schermata iniziale con audio impostato su "Sintetica" (o "Completa") e visualizza il breve promemoria iniziale di sicurezza (appoggio vicino).
* **When**: Inizia il primo esercizio (Stazione Monopodalica), ascolta la spiegazione vocale, avvia il timer preimpostato di tenuta (es. 25s) e il recupero (30s), poi tocca "Avanti" (o scorre / preme `Freccia Destra`) fino al termine del circuito o interrompe anticipatamente con "Termina sessione".
* **Then**: La voce parte senza blocchi autoplay su iOS/Android, i timer emettono un segnale acustico a fine intervallo senza interrompere il player, il cronometro registra il tempo effettivo (con possibilità di pausa) e al termine la sessione viene salvata nello storico locale con data, durata ed esercizi completati (es. `6/6` o `3/6`).

### CUJ 3: Proiezione su TV via Mirroring

* **Given**: L'utente ha attivato il mirroring dello schermo verso la TV (Smart View, AirPlay o cavo HDMI) e si trova nella schermata di sessione guidata.
* **When**: Attiva la "Modalità TV".
* **Then**: L'interfaccia passa a un layout orizzontale 16:9 ad alto contrasto a due colonne (animazione MP4 a sinistra; titolo, timer gigante e punti sintetici a destra), lo schermo resta acceso tramite Wake Lock e i comandi principali restano azionabili con pulsanti grandi o da tastiera/telecomando Bluetooth.

### CUJ 4: Consultazione Statistiche e Backup su Web

* **Given**: L'utente ha completato almeno una sessione e accede alla sezione "Statistiche".
* **When**: Visualizza l'andamento settimanale rispetto all'obiettivo di 3–5 sessioni e, su browser (in particolare iPhone Safari), esporta un backup JSON dalle Impostazioni.
* **Then**: La dashboard mostra sessioni settimanali, totale minuti e lista cronologica; il file JSON esportato può essere reimportato successivamente per ripristinare integralmente lo storico.

### CUJ 5: Configurazione Promemoria Settimanali su APK Android

* **Given**: L'utente usa l'APK Android offline e apre la sezione "Promemoria".
* **When**: Attiva un promemoria per lunedì, mercoledì e venerdì alle 18:30 e concede il permesso `POST_NOTIFICATIONS` richiesto al momento.
* **Then**: Le notifiche locali settimanali vengono pianificate sul dispositivo offline, persistono anche dopo il riavvio del telefono e rimandano all'apertura dell'app al tocco; sulla Web App la sezione promemoria nativi non è attiva e mostra al suo posto una nota informativa chiara.

## Technical Plan (Architecture)

### 1. Architettura Generale (Single Codebase Client-Only)

L'applicazione è costruita come **Single-Page Application (SPA) statica** con **Vite + React + TypeScript**, senza backend. Lo stesso output statico (`dist/`) alimenta due target di distribuzione:

1. **Web App statica**: distribuita su **GitHub Pages** tramite GitHub Actions ed eseguibile in locale su PC tramite server statico (`npm run preview` / `npx serve dist`), accessibile su PC, iPhone e Android.
2. **APK Android offline**: impacchettato tramite **Capacitor** (`@capacitor/android`) includendo `dist/` e tutti gli asset (PDF, JPG, MP4, MP3) dentro il pacchetto. La compilazione e firma dell'APK avvengono esclusivamente tramite **GitHub Actions** su runner Ubuntu.

```text
                       +-----------------------------------+
                       |  Asset Sorgenti & Pipeline Build  |
                       |  - guida_equilibrio_corpo_libero  |
                       |  - immagini/*.jpg                 |
                       |  - scripts/convert_gifs.py (MP4)  |
                       |  - scripts/generate_audio.py(MP3) |
                       +-----------------+-----------------+
                                         |
                                         v
+---------------------------------------------------------------------------------+
|                      Frontend SPA (Vite + React + TypeScript)                   |
|                                                                                 |
|  [Home]  [Guida: Schede + PDF.js]  [Sessione + Modalita TV]  [Stats]  [Config]  |
|                                                                                 |
|  +-----------------------+  +------------------------+  +--------------------+  |
|  |   Audio & Timer Core  |  |    PDF.js Renderer     |  |  Platform Adapter  |  |
|  | - Single <audio> tag  |  | - <canvas> locale      |  | - Storage          |  |
|  | - Web Audio API beep  |  | - Worker nel bundle    |  | - Wake Lock        |  |
|  | - Session stopwatch   |  |                        |  | - Notifications    |  |
|  +-----------------------+  +------------------------+  +----+----------+----+  |
+--------------------------------------------------------------|----------+-------+
                                                               |          |
                   +-------------------------------------------+          +----------------------------------+
                   | Web (Capacitor.isNativePlatform() == false)          | APK Android (Capacitor Native)   |
                   v                                                      v                                  |
    +------------------------------+                       +---------------------------------------+
    | - localStorage + Export JSON |                       | - @capacitor/preferences (persistente)|
    | - Web Wake Lock API          |                       | - @capacitor-community/keep-awake     |
    | - Promemoria: nota Web-only  |                       | - @capacitor/local-notifications      |
    | - Deploy: GitHub Pages       |                       | - Build & Firma: GitHub Actions APK   |
    +------------------------------+                       +---------------------------------------+
```

### 2. Routing, Base Path e Compatibilità Locale/GitHub Pages

* **Configurazione Vite**: `base: './'` in `vite.config.ts` in modo che tutti i riferimenti a script, fogli di stile, immagini, MP4, MP3 e PDF funzionino sia sotto sotto-percorso GitHub Pages (`https://<utente>.github.io/<repo>/`), sia in locale (`http://localhost:4173/`), sia nel protocollo interno di Capacitor (`https://localhost/`).
* **Routing**: **Hash Routing** (`#/`, `#/guida`, `#/sessione`, `#/statistiche`, `#/impostazioni`) gestito senza dipendenze pesanti (o con stato + `window.location.hash`). Evita errori HTTP 404 al ricaricamento su GitHub Pages.
* **Vincolo avvio locale**: l'app non si avvia con doppio clic via `file://` (bloccato dal CORS sui moduli ES), ma tramite `npm run preview` o un server HTTP statico locale.

### 3. Modello Dati e Persistenza

#### 3.1 Catalogo Esercizi (`src/data/exercises.ts`)
Contenuto statico tipizzato estratto da `guida_equilibrio_corpo_libero.pdf`:

```ts
export interface ExerciseTimerPreset {
  id: string;
  label: string;          // es. "Tenuta 25s", "Recupero 45s"
  durationSec: number;
  kind: 'work' | 'rest';
}

export interface Exercise {
  id: string;             // "01" .. "06"
  number: number;         // 1 .. 6
  title: string;
  subtitle: string;       // nome inglese dal PDF
  objective: string;
  loadParams: Array<{ label: string; value: string }>;
  steps: string[];
  targetMuscles: string;
  commonErrors: string[];
  easyLevel: string;
  advancedLevel: string;
  pdfPage: number;        // pagina di inizio nel PDF originale
  imagePath: string;      // ./media/images/01_stazione_monopodalica.jpg
  videoPath: string;      // ./media/videos/01_stazione_monopodalica.mp4
  audioFullPath: string;  // ./media/audio/01_full.mp3
  audioShortPath: string; // ./media/audio/01_short.mp3
  timerPresets: ExerciseTimerPreset[];
}
```

#### 3.2 Storico Sessioni, Preferenze e Promemoria (`src/types/storage.ts`)
Schema persistito con campo `schemaVersion` per gestire eventuali evoluzioni future:

```ts
export type AudioMode = 'full' | 'short' | 'off';

export interface SessionRecord {
  id: string;                 // UUID o timestamp ISO
  startedAt: string;          // ISO 8601
  endedAt: string;            // ISO 8601
  durationSec: number;        // tempo attivo cronometro (escluse pause)
  completedExercises: number; // 1..6
  totalExercises: number;     // 6
  completed: boolean;         // true se 6/6, false se terminata prima
}

export interface WeeklyReminder {
  id: number;                 // intero positivo richiesto da Capacitor LocalNotifications
  enabled: boolean;
  daysOfWeek: number[];       // 1=Lunedì .. 7=Domenica (mappato a formato Capacitor 1=Dom..7=Sab)
  hour: number;               // 0..23
  minute: number;             // 0..59
  label: string;
}

export interface AppSettings {
  audioMode: AudioMode;
  tvModeDefault: boolean;
}

export interface PersistedState {
  schemaVersion: 1;
  settings: AppSettings;
  sessions: SessionRecord[];
  reminders: WeeklyReminder[];
}
```

#### 3.3 Platform Adapter (`src/platform/adapter.ts`)
Isola le differenze tra Web e Capacitor Android dietro tre interfacce:

* **Storage**:
  * Su APK (`Capacitor.isNativePlatform() === true`): legge/scrive JSON serializzato su `@capacitor/preferences` (`SharedPreferences` Android native, persistenti tra aggiornamenti firmati con la stessa keystore).
  * Su Web: legge/scrive su `window.localStorage` sotto chiave `equilibrium_state_v1`.
  * **Backup manuale**: esportazione di `PersistedState` in file `.json` scaricabile e importazione con validazione dello schema (protezione contro la cancellazione dopo 7 giorni di inattività su iOS Safari ITP).
* **Wake Lock**:
  * Su APK: chiama `KeepAwake.keepAwake()` / `KeepAwake.allowSleep()` di `@capacitor-community/keep-awake`.
  * Su Web: usa `navigator.wakeLock.request('screen')` con riacquisizione automatica sull'evento `visibilitychange`.
* **Notifiche Locali (solo APK)**:
  * Su APK: usa `@capacitor/local-notifications`. Alla prima attivazione di un promemoria richiede `requestPermissions()` (`POST_NOTIFICATIONS` su Android 13+). Per ogni giorno della settimana selezionato pianifica una notifica ricorrente con ID deterministico (`reminder.id * 10 + dayIndex`) e `schedule: { on: { weekday, hour, minute }, allowWhileIdle: true }`.
  * Su Web: espone `isSupported = false`; la UI nasconde i controlli di pianificazione e mostra una nota chiara indicando che i promemoria automatici sono disponibili nell'APK Android.

### 4. Motore Audio, Timer e Sessione Guidata

* **Sblocco autoplay su iOS Safari e Android WebView**: un singolo elemento `<audio>` gestito da un controller dedicato (`src/services/audioCoach.ts`) viene sbloccato nel gestore sincrono del click su "Inizia Sessione". Al passaggio all'esercizio successivo (click su "Avanti" / "Indietro" o gesto swipe), il cambio `src` e la chiamata `audio.play()` avvengono direttamente dentro l'handler dell'evento utente senza ritardi asincroni.
* **Modalità audio**:
  * `full`: carica `audioFullPath` (spiegazione completa passo-passo + richiamo errori principali).
  * `short`: carica `audioShortPath` (voce naturale ma breve: nome esercizio, obiettivo in una frase, dosaggio e promemoria chiave).
  * `off`: nessuna riproduzione automatica; l'utente può comunque premere "Riascolta" manualmente se vuole.
* **Segnali acustici del timer (`src/services/beepEngine.ts`)**: generati tramite `AudioContext` (Web Audio API, brevi toni a 880 Hz per gli ultimi 3 secondi e tono finale a 1320 Hz). Non usa file audio extra e non ruba lo slot `<audio>` della voce su iOS.
* **Timer esercizio e Cronometro sessione**:
  * Calcolo basato su delta di `Date.now()` / `performance.now()` (non semplice decremento `setInterval(-1)`) per evitare derive temporali se il browser rallenta in background.
  * Il cronometro globale si avvia all'inizio della sessione, supporta Pausa/Riprendi e salva automaticamente lo stato parziale in caso di chiusura anticipata ("Termina sessione").
  * Su `document.visibilitychange` (`hidden`), voce e timer attivo vanno in pausa per gestire telefonate o cambio app.
* **Navigazione e Modalità TV**:
  * Navigazione manuale tramite pulsanti grandi (`Precedente`, `Successivo`, `Termina`), swipe orizzontale touch e scorciatoie da tastiera (`ArrowRight`, `ArrowLeft`, `Space` per avvio/pausa timer, `KeyR` per riascolto audio, `KeyT` per Modalità TV).
  * **Modalità TV**: classe CSS/layout dedicato 16:9 a due colonne ad alto contrasto (sfondo scuro `#0B1320`, testo chiaro ad alta leggibilità, timer gigante). A sinistra il video MP4 in loop, a destra titolo, timer e 3 punti sintetici. Su APK Android può forzare/suggerire l'orientamento orizzontale durante la Modalità TV.

### 5. Lettore Guida (Schede Interattive + PDF Originale)

* **Schede Interattive**: lista dei 6 esercizi che mostra inizialmente solo titolo, dosaggio sintetico e miniatura JPG statica (`loading="lazy"`). Solo quando l'utente apre una scheda viene montato il tag `<video src="..." muted loop playsinline controls>` dell'MP4 corrispondente, mantenendo un solo video attivo in memoria.
* **PDF Originale (`pdfjs-dist`)**: componente dedicato (`src/components/PdfViewer.tsx`) che carica `./media/guida_equilibrio_corpo_libero.pdf` e disegna una pagina alla volta su `<canvas>` usando il worker locale (`pdfjs-dist/build/pdf.worker.min.mjs`) impacchettato da Vite. Include navigazione pagina precedente/successiva, selettore rapido per esercizio (`pdfPage`) e controlli di zoom (`-`, `+`, adatta a schermo).

### 6. Pipeline Asset Offline (MP4 e MP3)

Due script Python riproducibili nel repository (eseguiti offline in sviluppo/build prima del commit o in fase di preparazione asset):

1. **Conversione GIF -> MP4 (`scripts/convert_gifs.py`)**:
   * Legge una tabella di mappatura esplicita (`01`..`06` -> file `gif/Gemini_Generated_Gif_*.gif`).
   * Invoca `ffmpeg` con profilo compatibile con iOS Safari e Android WebView (`-movflags +faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -crf 24 -an`).
   * Scrive i 6 MP4 in `public/media/videos/`.
2. **Generazione Audio Italiano (`scripts/generate_audio.py`)**:
   * Legge `content/audio_scripts.json` (contenente i testi `full` e `short` per i 6 esercizi + breve intro di sicurezza e chiusura).
   * Genera le tracce tramite servizio TTS neurale gratuito (`edge-tts`, voce italiana naturale es. `it-IT-ElsaNeural` o `it-IT-DiegoNeural`).
   * Normalizza ogni file con `ffmpeg` (`loudnorm=I=-16:TP=-1.5:LRA=11`, MP3 mono 64 kbps) e salva in `public/media/audio/`.

### 7. CI/CD su GitHub Actions (GitHub Pages + APK Android Firmato)

* **Workflow Web (`.github/workflows/deploy-pages.yml`)**: su push su `main`, esegue `npm ci`, `npm run build` e pubblica `dist/` su GitHub Pages tramite `actions/deploy-pages`.
* **Workflow APK Android (`.github/workflows/build-android-apk.yml`)**: attivabile manualmente (`workflow_dispatch`) o su tag `v*.*.*`:
  1. Configura Node.js 20 e Java 17 (Temurin) su `ubuntu-latest`.
  2. Esegue `npm ci && npm run build && npx cap sync android`.
  3. Decodifica la keystore Android salvata nel GitHub Secret `ANDROID_KEYSTORE_BASE64` in un file temporaneo e passa password/alias tramite variabili d'ambiente a Gradle (`./gradlew assembleRelease`).
  4. Carica `app-release.apk` come Artifact del workflow (e lo allega alla GitHub Release se avviato da tag).
* **Configurazione Android (`android/app/build.gradle` e `AndroidManifest.xml`)**:
  * `applicationId`: `it.equilibrium.app` (fisso per garantire aggiornamenti in-place).
  * Permessi espliciti: `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`.
  * Blocco `signingConfigs.release` che legge le credenziali dalle variabili d'ambiente CI.

## Non-Functional Requirements

* **Offline-First e Zero Dipendenze Esterne a Runtime**: nessun font Google esterno, nessun worker CDN, nessuna chiamata API di rete. L'app deve funzionare in modalità aereo sull'APK Android e senza rete dopo il caricamento iniziale sul Web.
* **Budget Peso e Memoria**: peso totale APK target 12–18 MB; massimo 1 elemento `<video>` MP4 e 1 `<canvas>` PDF montati contemporaneamente nel DOM per mantenere fluido lo scorrimento su telefoni Android di fascia bassa.
* **Privacy e Sicurezza**: tutti i dati di allenamento restano sul dispositivo; nessuna telemetria o analytics di terze parti. La keystore di firma Android non viene mai committata nel repository ma conservata esclusivamente nei GitHub Secrets (e in copia di sicurezza privata del proprietario).
* **Affidabilità Notifiche Android**: l'app deve gestire graziosamente il rifiuto del permesso `POST_NOTIFICATIONS` senza crash e informare l'utente che il risparmio energetico aggressivo del dispositivo (Doze Mode) può introdurre lievi ritardi.

## Alternatives Considered

### Alternative A: Google Cast SDK (Chromecast nativo) per la proiezione su TV

* **Pros**: Pulsante Cast integrato dentro l'app con invio diretto dei contenuti al Chromecast senza occupare lo schermo del telefono durante l'allenamento.
* **Cons**: Richiede la registrazione sulla Google Cast Developer Console (5 dollari una tantum), un Custom Receiver ospitato su URL HTTPS pubblico che il Chromecast scarica da internet (incompatibile con l'uso offline dell'APK) e la gestione della sincronizzazione di stato tra sender e receiver.
* **Reason for Rejection**: Complessità architetturale e dipendenza dalla rete sproporzionate rispetto a un'app offline personale/familiare; la Modalità TV 16:9 ad alto contrasto via mirroring di sistema (Smart View, AirPlay, HDMI) copre lo scenario d'uso senza SDK dedicati.

### Alternative B: Trusted Web Activity (TWA) o App Android Nativa Separata (Kotlin/Compose)

* **Pros**: TWA produce un guscio leggero sopra Chrome; un'app nativa Kotlin offre controllo diretto sulle API Android senza WebView.
* **Cons**: TWA dipende da un sito HTTPS pubblico e da Chrome, non garantisce funzionamento 100% offline all'installazione e non offre accesso diretto alle notifiche locali ricorrenti Android. Un'app nativa separata raddoppia interamente codice, UI e manutenzione rispetto alla Web App.
* **Reason for Rejection**: Capacitor consente una singola codebase TypeScript/React sia per GitHub Pages sia per l'APK Android offline, con accesso nativo a notifiche locali, `SharedPreferences` e `KeepAwake`.

### Alternative C: Sintesi Vocale di Sistema a Runtime (Web Speech API / Android TTS)

* **Pros**: Peso nullo nell'APK (0 MB di file audio) e nessuna pipeline di generazione tracce.
* **Cons**: Qualità vocale spesso robotica e comportamento inconsistente tra iOS Safari, Chrome desktop e Android WebView (voci italiane mancanti o scaricate solo online).
* **Reason for Rejection**: Il requisito richiede una narrazione naturale di buona qualità funzionante offline; generare 12–14 tracce MP3 una tantum tramite script `edge-tts` gratuito e normalizzarle con `ffmpeg` garantisce qualità uniforme su tutte le piattaforme con un peso contenuto.

### Alternative D: Mantenere le 6 GIF Animate Originali senza Conversione in MP4

* **Pros**: Nessuno step di conversione `ffmpeg` in fase di preparazione asset.
* **Cons**: Le 6 GIF occupano 3,6 MB su disco, consumano decine di MB di RAM decodificata su dispositivi Android economici e non supportano pausa né riavvio controllato.
* **Reason for Rejection**: La conversione una tantum in MP4 H.264 (`yuv420p`, muto, loop) riduce peso e consumo memoria di 5–10 volte e migliora fluidità e controllo della riproduzione.

### Alternative E: Visualizzazione PDF tramite `<iframe>` o `<embed>` Nativo del Browser

* **Pros**: Nessuna dipendenza JavaScript aggiuntiva (`pdfjs-dist`).
* **Cons**: Fallisce in Android WebView (schermata bianca o tentativo di download) e su iOS Safari mostra frequentemente solo la prima pagina senza scorrimento affidabile.
* **Reason for Rejection**: `pdfjs-dist` con worker locale garantisce rendering uniforme su `<canvas>` su PC, iPhone e APK Android offline.

### Alternative F: Backend con Web Push per Promemoria Web e Sincronizzazione Statistiche

* **Pros**: Permetterebbe notifiche programmate anche su browser chiuso e sincronizzazione automatica dello storico tra PC, iPhone e Android.
* **Cons**: Richiede server/database, autenticazione utente, chiavi VAPID, gestione errori di rete e manutenzione continuativa.
* **Reason for Rejection**: Sovradimensionato per uso personale/familiare; lo storico locale con esportazione/importazione JSON e i promemoria nativi sul solo APK eliminano completamente i costi e la complessità di un backend.

### Alternative G: Compilazione APK Android in Locale sul PC (o Ibrida)

* **Pros**: La keystore resta solo sul PC locale e permette test immediati via USB (`adb`).
* **Cons**: Richiede installazione e manutenzione locale di JDK 17 e Android SDK/Gradle (~2–4 GB) su Windows, o la gestione sincronizzata di due configurazioni di firma nell'approccio ibrido.
* **Reason for Rejection**: La compilazione automatica su GitHub Actions elimina il setup locale di Android Studio/SDK sul PC e produce APK firmati ripetibili direttamente scaricabili dal repository.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

### Target Files to Create/Modify

#### 1. `package.json` (Create)
* **Type / Scope**: Manifest Node.js, dipendenze e script di build/test.
* **Proposed Changes**: Definire le dipendenze runtime (`react`, `react-dom`, `pdfjs-dist`, `@capacitor/core`, `@capacitor/local-notifications`, `@capacitor/preferences`, `@capacitor-community/keep-awake`) e di sviluppo (`vite`, `@vitejs/plugin-react`, `typescript`, `@capacitor/cli`, `@capacitor/android`, `vitest`, `@testing-library/react`, `jsdom`, `eslint`). Aggiungere script `dev`, `build`, `preview`, `test`, `lint` e `cap:sync`.

#### 2. `tsconfig.json` & `tsconfig.node.json` (Create)
* **Type / Scope**: Configurazione TypeScript.
* **Proposed Changes**: Abilitare `strict: true`, target `ES2020`, `jsx: "react-jsx"`, risoluzione moduli `bundler` e tipizzazione dei moduli di test Vitest.

#### 3. `vite.config.ts` (Create)
* **Type / Scope**: Configurazione bundler Vite.
* **Proposed Changes**: Impostare `base: './'` per compatibilità con GitHub Pages, server locale e Capacitor; configurare il plugin React e la gestione del worker locale di `pdfjs-dist` senza riferimenti esterni; configurare ambiente `jsdom` per Vitest.

#### 4. `capacitor.config.ts` (Create)
* **Type / Scope**: Configurazione Capacitor Android.
* **Proposed Changes**: Impostare `appId: 'it.equilibrium.app'`, `appName: 'Equilibrium'`, `webDir: 'dist'` e configurazione del plugin `LocalNotifications` (icona piccola e canale notifica).

#### 5. `.gitignore` (Create)
* **Type / Scope**: Esclusioni Git.
* **Proposed Changes**: Escludere `node_modules/`, `dist/`, file keystore locali (`*.jks`, `*.keystore`, `keystore.properties`), output temporanei di build Android (`android/app/build/`, `android/.gradle/`) e cache Python (`__pycache__/`).

#### 6. `index.html` (Create)
* **Type / Scope**: Entrypoint HTML dell'applicazione.
* **Proposed Changes**: Configurare meta viewport mobile-friendly (`viewport-fit=cover`), titolo "Equilibrium", lingua `it`, icona locale e root `<div id="root">` senza font o script esterni.

#### 7. `content/audio_scripts.json` (Create)
* **Type / Scope**: Sorgente dati testuali per la narrazione vocale.
* **Proposed Changes**: Definire un JSON strutturato contenente la voce configurata (es. `it-IT-ElsaNeural`), il breve messaggio introduttivo di sicurezza, il messaggio di chiusura sessione e, per ciascuno dei 6 esercizi (`01`..`06`), i due testi parlati in italiano: `full` (spiegazione passo-passo + richiamo errori comuni) e `short` (nome, obiettivo sintetico, dosaggio e 1 indicazione chiave).

#### 8. `scripts/convert_gifs.py` (Create)
* **Type / Scope**: Script Python offline per preparazione video.
* **Proposed Changes**: Contenere la mappa esplicita tra ciascun file `gif/Gemini_Generated_Gif_*.gif` (da confermare con ispezione visiva prima dell'esecuzione) e il nome target `01_stazione_monopodalica.mp4` .. `06_camminata_laterale_abduzioni.mp4`. Invocare `ffmpeg` con parametri compatibili iOS/Android (`libx264`, `yuv420p`, dimensioni pari, `-movflags +faststart`, `-an`) e salvare i file in `public/media/videos/`, copiando anche le 6 immagini da `immagini/` in `public/media/images/` e `guida_equilibrio_corpo_libero.pdf` in `public/media/guida_equilibrio_corpo_libero.pdf`.

#### 9. `scripts/generate_audio.py` (Create)
* **Type / Scope**: Script Python offline per generazione tracce audio.
* **Proposed Changes**: Leggere `content/audio_scripts.json`, generare i file grezzi tramite `edge-tts` (servizio gratuito con voci neurali italiane), normalizzare il volume con `ffmpeg` (`loudnorm=I=-16:TP=-1.5:LRA=11`, MP3 mono 64 kbps) e scrivere le tracce finali in `public/media/audio/` (`intro.mp3`, `outro.mp3`, `01_full.mp3`, `01_short.mp3`, ..., `06_short.mp3`).

#### 10. `public/media/` (Create — asset statici generati/copiati)
* **Type / Scope**: Asset inclusi sia su GitHub Pages sia nell'APK offline.
* **Proposed Changes**: Popolare `public/media/guida_equilibrio_corpo_libero.pdf`, `public/media/images/01..06.jpg`, `public/media/videos/01..06.mp4` e `public/media/audio/*.mp3` eseguendo i due script precedenti.

#### 11. `src/types/exercise.ts` & `src/types/storage.ts` (Create)
* **Type / Scope**: Contratti dati TypeScript.
* **Proposed Changes**: Definire le interfacce `Exercise`, `ExerciseTimerPreset`, `AudioMode`, `SessionRecord`, `WeeklyReminder`, `AppSettings` e `PersistedState` (`schemaVersion: 1`) descritte nel Technical Plan.

#### 12. `src/data/exercises.ts` (Create)
* **Type / Scope**: Catalogo strutturato dei 6 esercizi.
* **Proposed Changes**: Trascrivere integralmente i contenuti di `guida_equilibrio_corpo_libero.pdf` (obiettivi, parametri di carico, esecuzione passo-passo, target muscolare/articolare, errori comuni, livello Facile e Avanzato, numero pagina PDF, percorsi relativi `./media/...` e preset timer specifici per esercizio, es. `25s` tenuta e `30s`/`45s`/`60s` recupero).

#### 13. `src/platform/adapter.ts` (Create)
* **Type / Scope**: Layer di astrazione Web vs Capacitor Android.
* **Proposed Changes**: Implementare tre moduli unificati:
  * `storageAdapter`: `loadState()`, `saveState(state)`, `exportStateJson(state)`, `parseAndValidateImport(rawJson)` usando `@capacitor/preferences` su nativo e `localStorage` su Web.
  * `wakeLockAdapter`: `enable()`, `disable()` usando `@capacitor-community/keep-awake` su nativo e `navigator.wakeLock` + listener `visibilitychange` su Web.
  * `remindersAdapter`: `isSupported()`, `requestPermission()`, `syncWeeklyReminders(reminders)` usando `@capacitor/local-notifications` su nativo (con mappatura giorni 1=Lun..7=Dom -> 1=Dom..7=Sab di Capacitor, ID deterministici e cancellazione precedente prima della ripianificazione) e no-op informativo su Web.

#### 14. `src/services/audioCoach.ts` & `src/services/beepEngine.ts` (Create)
* **Type / Scope**: Motore riproduzione vocale e segnali acustici timer.
* **Proposed Changes**:
  * `audioCoach.ts`: singleton che gestisce un singolo `HTMLAudioElement`, espone `unlock()`, `playTrack(src)`, `stop()`, `pause()`, `resume()`, `isPlaying()` e gestione errori autoplay senza eccezioni non catturate.
  * `beepEngine.ts`: generatore di toni brevi via `AudioContext` (`playTick()`, `playComplete()`) con sblocco su gesto utente.

#### 15. `src/hooks/useAppState.ts` & `src/hooks/useTimers.ts` (Create)
* **Type / Scope**: Gestione stato persistito e logica temporale.
* **Proposed Changes**:
  * `useAppState.ts`: carica/salva `PersistedState` tramite `storageAdapter`, espone azioni per aggiornare `settings`, aggiungere/cancellare `SessionRecord`, importare/esportare JSON e salvare/sincronizzare `WeeklyReminder`.
  * `useTimers.ts`: implementa sia il cronometro di sessione (delta `Date.now()`, pausa/riprendi) sia il countdown esercizio/recupero (avvio da preset, pausa, reset, trigger beep negli ultimi 3 secondi e a zero, pausa automatica su `visibilitychange`).

#### 16. `src/router.ts` & `src/App.tsx` (Create)
* **Type / Scope**: Navigazione Hash e shell applicativa.
* **Proposed Changes**: Implementare Hash Routing (`#/`, `#/guida`, `#/sessione`, `#/statistiche`, `#/impostazioni`) e montare la schermata attiva dentro il layout comune, assicurando che la barra di navigazione si nasconda automaticamente in Modalità TV.

#### 17. `src/pages/HomePage.tsx` (Create)
* **Type / Scope**: Schermata di avvio.
* **Proposed Changes**: Presentare le due azioni primarie ad alta visibilità (*Avvia Sessione Guidata* e *Leggi la Guida*), un riepilogo sintetico della settimana corrente (es. `2 / 3–5 sessioni questa settimana`) e gli accessi rapidi a *Statistiche* e *Impostazioni / Promemoria*.

#### 18. `src/pages/GuidePage.tsx` & `src/components/PdfViewer.tsx` (Create)
* **Type / Scope**: Lettore documento a doppia vista.
* **Proposed Changes**:
  * `GuidePage.tsx`: selettore in alto tra `Schede Interattive` e `PDF Originale`. Nella vista schede mostra la lista dei 6 esercizi con anteprima JPG statica; espandendo una scheda monta il singolo `<video>` MP4 in loop, i passi numerati, errori comuni, target muscolare, livelli Facile/Avanzato e il pulsante "Apri nel PDF a pagina X".
  * `PdfViewer.tsx`: integra `pdfjs-dist` con worker locale, renderizza una pagina per volta su `<canvas>` ad alta densità DPR, offre controlli pagina `Precedente`/`Successiva`, salto rapido per esercizio e zoom.

#### 19. `src/pages/SessionPage.tsx` & `src/components/TvModeView.tsx` (Create)
* **Type / Scope**: Sessione di allenamento guidata e vista TV.
* **Proposed Changes**:
  * `SessionPage.tsx`: mostra il promemoria iniziale di sicurezza al primo step, cronometro globale con pausa, progresso `Esercizio X di 6`, video MP4 dell'esercizio corrente, controlli audio rapidi (`Riascolta`, switch rapido `Completa`/`Sintetica`/`Muto`), preset timer rapidi per tenuta/recupero, tab `Base`/`Facile`/`Avanzato`, pulsanti grandi `Precedente`/`Successivo`/`Termina sessione`, gestione swipe touch e scorciatoie tastiera (`ArrowLeft`, `ArrowRight`, `Space`, `KeyR`, `KeyT`). Alla chiusura salva il `SessionRecord` e mostra un breve riepilogo finale.
  * `TvModeView.tsx`: vista 16:9 ad alto contrasto a due colonne (sinistra MP4 a tutta altezza, destra titolo, timer gigante, 3 punti chiave sintetici e controlli essenziali) con attivazione Wake Lock tramite `wakeLockAdapter`.

#### 20. `src/pages/StatsPage.tsx` (Create)
* **Type / Scope**: Dashboard statistiche locali.
* **Proposed Changes**: Calcolare e visualizzare sessioni svolte nella settimana corrente rispetto al target 3–5/settimana, minuti totali complessivi e settimanali, streak settimanale ed elenco cronologico delle sessioni salvate (data, durata formattata, esercizi completati `X/6`).

#### 21. `src/pages/SettingsPage.tsx` (Create)
* **Type / Scope**: Impostazioni audio, promemoria e backup dati.
* **Proposed Changes**: Selettore modalità audio predefinita (`Completa`, `Sintetica`, `Spento`), toggle Modalità TV predefinita, sezione Promemoria Settimanali (su APK: aggiunta/modifica/eliminazione di promemoria con selezione multipla giorni + ora, richiesta permesso notifiche e nota sul risparmio energetico; su Web: messaggio informativo che i promemoria automatici sono disponibili sull'APK Android), e sezione Backup Dati (`Esporta JSON`, `Importa JSON`, `Azzera storico` con conferma).

#### 22. `src/styles/theme.css` & `src/styles/layout.css` (Create)
* **Type / Scope**: Stili CSS responsivi e tema ad alto contrasto.
* **Proposed Changes**: Definire variabili CSS (palette coerente con il blu/ottanio della guida originale, tema scuro ad alto contrasto per Modalità TV), layout responsive mobile-first/desktop e aree touch minime ≥ 48px per i controlli di sessione.

#### 23. `android/` (Create — progetto Capacitor Android)
* **Type / Scope**: Progetto nativo Android generato da `npx cap add android` e personalizzato.
* **Proposed Changes**:
  * `android/app/build.gradle`: impostare `applicationId "it.equilibrium.app"`, configurare `signingConfigs.release` leggendo `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` da variabili d'ambiente CI.
  * `android/app/src/main/AndroidManifest.xml`: aggiungere permessi `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, `WAKE_LOCK`.

#### 24. `.github/workflows/deploy-pages.yml` & `.github/workflows/build-android-apk.yml` (Create)
* **Type / Scope**: Pipeline CI/CD GitHub Actions.
* **Proposed Changes**:
  * `deploy-pages.yml`: su push su `main`, installa dipendenze, esegue test/lint/build e pubblica `dist/` su GitHub Pages.
  * `build-android-apk.yml`: su `workflow_dispatch` o tag `v*.*.*`, configura Node 20 e Java 17, compila `dist/`, sincronizza Capacitor (`npx cap sync android`), decodifica `ANDROID_KEYSTORE_BASE64`, compila `./gradlew assembleRelease` e carica l'APK firmato come Artifact (e Release su tag).

#### 25. `src/__tests__/` (Create — Unit & Component Tests)
* **Type / Scope**: Suite di test automatici Vitest.
* **Proposed Changes**:
  * `storageAdapter.test.ts`: validazione salvataggio, esportazione/importazione JSON e gestione JSON malformati o `schemaVersion` non valida.
  * `useTimers.test.ts`: verifica assenza di deriva su cronometro/countdown, pausa/riprendi e trigger fine timer.
  * `remindersMapping.test.ts`: verifica conversione giorni settimana (Lun=1..Dom=7 -> formato Capacitor) e generazione ID deterministici.
  * `statsCalculation.test.ts`: verifica conteggio sessioni settimanali, minuti totali e gestione sessioni parziali (`3/6`).

#### 26. `README.md` (Create)
* **Type / Scope**: Documentazione operativa del progetto.
* **Proposed Changes**: Documentare comandi locali (`npm run dev`, `npm run preview`, script Python di generazione MP4/MP3), guida passo-passo per generare una keystore Android con `keytool` e configurare i 4 GitHub Secrets per il build automatico dell'APK.

---

### Verification Plan

* **Compilation/Build**: `npm run build` deve completarsi senza errori TypeScript né avvisi bloccanti Vite; il bundle `dist/` deve contenere tutti gli asset locali (`./media/*` e worker PDF.js) e nessun riferimento HTTP/HTTPS esterno.
* **Unit Tests**: `npm test` (Vitest) deve superare il 100% dei test su storage/backup JSON, timer/cronometro, mappatura giorni promemoria e calcolo statistiche settimanali.
* **Static Analysis & Linting**: `npm run lint` e `npx tsc --noEmit` devono uscire con codice `0`.
* **Verifica Web Locale e GitHub Pages**:
  * Aprire l'app da `npm run preview` su PC desktop e da GitHub Pages su iPhone Safari e Android Chrome.
  * Verificare CUJ 1 (apertura schede, riproduzione MP4 singolo, rendering offline di tutte le 21 pagine del PDF via `pdfjs-dist`).
  * Verificare CUJ 2 (sblocco audio su iOS Safari al tap di avvio sessione, cambio modalità Completa/Sintetica/Spento, beep timer senza bloccare la voce, salvataggio sessione parziale e completa).
  * Verificare CUJ 3 (Modalità TV 16:9 e scorciatoie tastiera `ArrowRight`/`ArrowLeft`/`Space`/`R`/`T`).
  * Verificare CUJ 4 (Esporta JSON -> Azzera storico -> Importa JSON con ripristino integrale).
* **Verifica APK Android Offline (CI + Dispositivo Reale)**:
  * Avviare `build-android-apk.yml` su GitHub Actions e verificare la generazione dell'APK firmato (peso atteso 12–18 MB).
  * Installare l'APK su telefono Android reale, attivare **Modalità Aereo** e verificare funzionamento completo (schede, MP4, PDF 21 pagine, audio voce, timer, Wake Lock in Modalità TV, salvataggio statistiche).
  * Verificare CUJ 5: impostare un promemoria a +2 minuti, verificare richiesta permesso `POST_NOTIFICATIONS`, ricezione notifica a schermo spento e persistenza dopo riavvio del dispositivo.

--------------------------------------------------------------------------------

*Drafted with EGM*
