# Equilibrium — Web App e APK Android Offline per l'Equilibrio

* **Author:** Leo
* **Date:** 2026-11-19

## Overview

Equilibrium è un'applicazione client-only composta da una Web App statica (ospitabile su GitHub Pages ed eseguibile in locale su PC, iPhone e Android) e da un APK Android offline per uso personale e familiare. L'app trasforma la guida illustrata `guida_equilibrio_corpo_libero.pdf` (6 esercizi a corpo libero, circuito da 15–20 minuti, 3–5 volte a settimana) e i relativi media (`immagini/` e `gif/`) in uno strumento a doppio uso: consultazione del documento e sessione di allenamento guidata.

All'avvio l'utente sceglie se leggere la guida (sia come schede interattive sia come PDF originale) oppure avviare una sessione guidata. La sessione riproduce una voce guida preregistrata in italiano (in versione completa, sintetica o spenta), avanza manualmente con tap/scroll/tastiera, offre timer rapidi per tenute/recuperi più un cronometro di sessione, e include una Modalità TV ad alta leggibilità per il mirroring di sistema. Lo storico delle sessioni resta in locale sul dispositivo; i promemoria settimanali ricorrenti operano tramite notifiche native sul solo APK Android.

## Analysis

### 1. Architettura e Distribuzione
* **Contenitore Android (Capacitor)**: permette di generare sia il sito statico (`dist/`) per GitHub Pages/locale sia l'APK Android offline dallo stesso codice sorgente. Un piccolo modulo di astrazione (`platformAdapter`) separa le chiamate native (notifiche locali, wake lock, salvataggio persistente) degradando in modo pulito sul Web.
* **Routing e avvio locale**: `BrowserRouter` genera errori 404 al ricaricamento su GitHub Pages e non funziona in locale. Serve Hash Routing (`#/guida`, `#/sessione`) o navigazione in memoria con `base: './'`. Inoltre aprire `index.html` direttamente via `file://` viene bloccato dal CORS dei browser per gli ES Module: in locale l'app va avviata tramite server statico locale (`npm run preview` / `npx serve dist`).
* **Dimensione del pacchetto**: gli asset attuali pesano ~5,8 MB (PDF 1,1 MB, 6 JPG 1,1 MB, 6 GIF 3,6 MB). Convertendo le 6 GIF in MP4 H.264 muti in loop (~0,5–0,8 MB totali) e aggiungendo 12–14 tracce audio MP3 mono a 64–96 kbps (6 esercizi × 2 lunghezze: Completa e Sintetica), il peso stimato dell'APK finale resta contenuto tra 12 e 18 MB. Evitare formato `.ogg`/Opus per incompatibilità storiche con iOS Safari; usare MP3 o M4A (AAC).

### 2. Rischi Tecnici e Limiti di Piattaforma
* **Visualizzazione del PDF originale su iOS e Android WebView**: usare `<iframe>` o `<embed>` fallisce in Android WebView (schermata bianca o download) e su iOS Safari mostra spesso solo la prima pagina. Serve integrare `pdfjs-dist` con rendering su `<canvas>` e worker locale incluso nel bundle (nessuna dipendenza da CDN).
* **Blocco Autoplay Audio su iOS Safari**: iOS blocca `audio.play()` se non viene eseguito direttamente dentro un gesto utente (`click`/`touchend`). È necessario riusare un singolo elemento `<audio>` sbloccato al tocco su "Inizia Sessione" e avviare le tracce successive direttamente nel gestore del pulsante "Avanti". I segnali acustici del timer vanno generati con Web Audio API (oscillatore sintetizzato, 0 KB) per non interferire con il player della voce. Audio e timer devono mettersi in pausa su `visibilitychange`.
* **Notifiche settimanali Android (Doze Mode, permessi, riavvio)**:
  * Android 13+ richiede il permesso runtime `POST_NOTIFICATIONS` (da chiedere solo quando l'utente attiva un promemoria, non al primo avvio).
  * Android 12+ limita gli allarmi esatti (`SCHEDULE_EXACT_ALARM`) e il risparmio energetico dei produttori (Samsung, Xiaomi, Huawei) può ritardare o sopprimere notifiche in standby profondo.
  * Al riavvio del telefono le notifiche possono andare perse se non è configurato correttamente `RECEIVE_BOOT_COMPLETED` nel plugin `@capacitor/local-notifications`.
* **Animazioni MP4 al posto delle GIF originali**:
  * Le 6 GIF in `gif/` hanno nomi generici (`Gemini_Generated_Gif_*.gif`) e vanno ispezionate e mappate agli esercizi `01`–`06`.
  * Le GIF verranno convertite una tantum in **MP4 (H.264, `muted loop playsinline`)** per ridurre peso e consumo RAM di 5–10 volte e abilitare pausa/riavvio pulito.
  * Nelle anteprime della guida vanno comunque mostrati i JPG statici; il video MP4 va montato solo dentro la scheda aperta o l'esercizio attivo.
* **Persistenza dello storico su iOS Safari**: su iPhone/iPad (uso via browser), Safari elimina `localStorage` e `IndexedDB` dopo 7 giorni di inattività sul sito (regola ITP). Sull'APK Android va usato `@capacitor/preferences` (SharedPreferences native persistenti); sul Web `localStorage` affiancato da funzioni di **Esporta / Importa backup JSON** nelle Impostazioni.
* **Schermo sempre acceso (Wake Lock)**: la Web Wake Lock API viene rilasciata quando l'app passa in background e va riacquisita su `visibilitychange`. Sull'APK va affiancato `@capacitor-community/keep-awake` (`FLAG_KEEP_SCREEN_ON`) perché alcune WebView Android ignorano l'API web.

### 3. Ergonomia, Modalità TV e Casi Limite
* **Proiezione TV via mirroring**: trasmettere un telefono tenuto in verticale su una TV 16:9 produce bande nere laterali e testo piccolo. La Modalità TV deve usare un layout orizzontale (16:9) a due colonne: animazione a sinistra, nome esercizio + timer grande + punti chiave sintetici a destra, con blocco opzionale in landscape su APK.
* **Uso a distanza**: pulsanti di sessione molto grandi (Avanti, Indietro, Avvia/Pausa Timer, Riascolta Audio) e scorciatoie da tastiera (`Freccia Destra`/`Sinistra`, `Spazio`, `R`) per uso su PC/HDMI o con telecomandi Bluetooth.
* **Esercizi bilaterali e gestione timer**: 4 esercizi su 6 lavorano un lato alla volta. Invece di forzare una macchina a stati rigida serie-per-serie, la schermata espone i parametri di carico e pulsanti timer rapidi preimpostati per quell'esercizio (es. `25s tenuta`, `45s recupero`, `Reset`).
* **Flessibilità e sicurezza**: in sessione servono un controllo rapido per riascoltare/mutare l'audio, i tab rapidi Base / Facile / Avanzato e un promemoria iniziale di sicurezza (avere una sedia o parete vicina come appoggio).
* **Sessioni interrotte**: consentire "Termina sessione" in qualunque momento salvando il numero di esercizi svolti (es. `3/6`) e prevedere il pulsante Pausa sul cronometro globale.

### 4. Prontezza Implementativa
* **Pipeline audio ripetibile**: salvare i testi parlati (versione Completa e Sintetica) in un file sorgente (`content/audio_scripts.json`), generare gli MP3 con script ripetibile e normalizzare il volume con `ffmpeg` (`-16 LUFS`).
* **Dati esercizi strutturati**: trascrivere fedelmente le 6 schede del PDF in un file tipizzato (`src/data/exercises.ts`) collegando pagina PDF, immagini, animazioni, tracce audio e preset timer.
* **Firma APK Android**: creare una keystore dedicata (esclusa da Git) e fissare subito `applicationId` (es. `it.equilibrium.app`), così gli aggiornamenti futuri dell'APK si installano sopra la versione precedente senza perdere lo storico.

## Goals vs. Non-Goals

* **In-Scope Goals:**
  * Codebase unica client-only che produce sia Web App statica (GitHub Pages + locale su PC/iPhone/Android) sia APK Android offline.
  * Schermata iniziale con scelta diretta tra consultazione documento e avvio sessione guidata.
  * Lettore guida con doppia vista: schede interattive (con JPG, animazioni, passi, errori comuni, regressioni/progressioni) e PDF originale offline (via PDF.js).
  * Sessione guidata con avanzamento manuale (tap/scroll/tastiera), voce guida preregistrata di qualità (Completa / Sintetica / Spenta), timer rapidi per esercizi a tempo/recuperi e cronometro di sessione.
  * Modalità TV orizzontale ad alto contrasto con Wake Lock pensata per il mirroring di sistema.
  * Statistiche locali sul singolo dispositivo (storico sessioni, durata, esercizi completati, obiettivo settimanale 3–5 sessioni) con esportazione/importazione backup JSON.
  * Promemoria settimanali personalizzabili (giorno della settimana e ora) tramite notifiche locali native sul solo APK Android.

* **Out-of-Scope Non-Goals:**
  * Integrazione Google Cast SDK / Custom Receiver Chromecast (scartata per vincolo offline, costi console e complessità di sincronizzazione).
  * Backend server, account utente, autenticazione e sincronizzazione cloud delle statistiche tra dispositivi.
  * Notifiche push programmate da browser sulla Web App.
  * Pubblicazione su Google Play Store o Apple App Store (distribuzione APK solo personale/familiare via sideloading).
  * Riconoscimento automatico dei movimenti via fotocamera o avanzamento automatico forzato senza controllo utente.

## Alternatives Weighed

* **Google Cast SDK (Chromecast nativo)**: scartato perché richiede un Custom Receiver ospitato su HTTPS pubblico, registrazione a pagamento su Google Cast Developer Console, connessione internet attiva sul Chromecast e sincronizzazione stato tra telefono e TV. Sostituito da una Modalità TV 16:9 ad alto contrasto usata tramite mirroring nativo del dispositivo.
* **Trusted Web Activity (TWA) per Android**: scartata perché dipende da hosting HTTPS pubblico e da Chrome, non garantisce funzionamento 100% offline all'installazione e non offre accesso diretto alle API native Android per notifiche locali ricorrenti.
* **App Android nativa separata (Kotlin/Compose) + Web App separata**: scartata perché raddoppia codice, test e manutenzione per un'app personale a contenuto statico.
* **Sintesi vocale di sistema (Web Speech API / Android TTS) a runtime**: scartata come voce principale perché produce voci robotiche e comportamenti incoerenti tra browser, iOS e WebView Android. Sostituita da file MP3 preregistrati offline (versione Completa e Sintetica).
* **Visualizzazione PDF tramite `<iframe>` / `<embed>` nativo del browser**: scartata perché non funziona in Android WebView e presenta problemi di scorrimento pagine su iOS Safari. Sostituita da `pdfjs-dist` locale.
* **Notifiche web tramite backend Web Push**: scartate perché introducono server, database e costi operativi non giustificati per un'app personale; i promemoria restano nativi sull'APK.

## Key Decisions & Staging for Next Steps

### Decisioni consolidate
1. **Stack tecnico**: Vite + React + TypeScript + Capacitor Android (`@capacitor/local-notifications`, `@capacitor/preferences`, `@capacitor-community/keep-awake`) + `pdfjs-dist` con worker locale.
2. **Animazioni**: conversione una tantum delle 6 GIF in MP4 H.264 (`muted loop playsinline`) previa mappatura visiva dei file `gif/Gemini_Generated_Gif_*.gif` agli esercizi `01`–`06`.
3. **Audio offline**: generazione tramite script automatico con servizio TTS neurale gratuito (es. `edge-tts` / Microsoft Edge Neural voices in italiano) a partire da `content/audio_scripts.json`, in due varianti (Completa e Sintetica) + opzione Muto, normalizzati a `-16 LUFS` con `ffmpeg`; beep dei timer via Web Audio API.
4. **Storage**: `@capacitor/preferences` su APK Android, `localStorage` su Web + backup manuale Esporta/Importa JSON per gestire il limite ITP (7 giorni) su iPhone Safari.
5. **Proiezione TV**: Modalità TV 16:9 ad alto contrasto tramite mirroring di sistema + Wake Lock nativo/web + scorciatoie tastiera.

### Elementi operativi da definire in `/egm-draft`
1. **Mappatura visiva delle 6 GIF**: associare ciascun file `gif/Gemini_Generated_Gif_*.gif` al corrispondente esercizio `01`–`06` prima della conversione in MP4.
2. **Flusso di build APK**: definire se compilare l'APK in locale (Android SDK / Gradle) oppure tramite GitHub Actions con keystore firmata nei Secrets.
