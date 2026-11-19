<p align="center">
  <img src="public/icon-192.png" alt="Equilibrium Icon" width="110" height="110" />
</p>

<h1 align="center">Equilibrium</h1>

<p align="center">
  <strong>Programma guidato di 6 esercizi a corpo libero per migliorare l'equilibrio, la propriocezione e la stabilità articolare.</strong><br/>
  Web App statica (PC, iPhone, Android) e App Android offline (APK) da un'unica base di codice.
</p>

<p align="center">
  <a href="https://leoamadori.github.io/equilibrium/"><strong>🌐 Apri la Web App</strong></a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="https://github.com/leoamadori/equilibrium/releases/latest/download/Equilibrium.apk"><strong>📱 Scarica Equilibrium.apk (Android)</strong></a>
</p>

---

## Funzionalità principali

| Sezione | Cosa offre |
| :--- | :--- |
| **Avvio rapido** | Scelta immediata tra **Inizia Sessione** e **Leggi la Guida**, con riepilogo settimanale (obiettivo 3–5 sessioni). |
| **Guida completa** | **6 schede interattive** (obiettivi, carichi, passi, errori comuni, livelli Facile/Avanzato, animazioni MP4) + **PDF originale offline** integrato (`pdfjs-dist`). |
| **Sessione guidata** | Voce allenatore italiana preregistrata (**Sintetica**, **Completa** o **Spento**), avanzamento manuale via tap/swipe/tastiera e promemoria iniziale di sicurezza. |
| **Timer per esercizio & Pausa** | Timer dedicati a ogni singolo esercizio con distinzione visiva tra **Esercizio** e **Pausa**, azzerati automaticamente al cambio scheda. |
| **Modalità TV (16:9)** | Vista orizzontale ad alto contrasto con schermo sempre acceso (*Wake Lock*), pensata per il mirroring su TV (Smart View, AirPlay, HDMI) e comandi da tastiera/telecomando. |
| **Statistiche locali** | Cronometro di sessione separato dai timer di esercizio, storico su dispositivo, minuti settimanali/totali e backup manuale **Esporta/Importa JSON** (utile su iPhone Safari). |
| **Promemoria Android** | Notifica settimanale ricorrente personalizzabile (giorni e ora) funzionante completamente offline sull'APK Android. |

---

## I 6 esercizi del programma

Circuito completo da **15–20 minuti**, consigliato **3–5 volte a settimana** (preferibilmente a piedi scalzi o con calze antiscivolo vicino a un appoggio stabile):

1. **Stazione Monopodalica** (*Single-Leg Stance*) — 3 serie × 20–30 s per gamba
2. **Camminata e Stazione in Tandem** (*Heel-to-Toe*) — 3 × 20–30 s statica o 2–3 × 10–15 passi
3. **Transizione Seduto-in-Piedi** (*Sit-to-Stand Drill*) — 2–3 serie × 8–12 ripetizioni lente
4. **Esercizio dell'Orologio** (*Clock Reach Drill*) — 2 serie × 1–2 giri completi per lato
5. **Sollevamento sui Talloni e sulle Punte** (*Calf & Toe Raises*) — 2–3 serie × 10–15 ripetizioni
6. **Camminata Laterale e Abduzioni dell'Anca** (*Sideways Walk & Hip Abduction*) — 2–3 serie × 10 passi/sollevamenti per lato

---

## Come usare l'app

### Su PC, iPhone o Android (Web App)
Apri direttamente **[https://leoamadori.github.io/equilibrium/](https://leoamadori.github.io/equilibrium/)**.
Su iPhone o Android puoi anche aggiungerla alla schermata Home dal menu del browser (l'icona Equilibrium è già inclusa).

### Su Android (App offline con notifiche)
1. Scarica direttamente **[Equilibrium.apk](https://github.com/leoamadori/equilibrium/releases/latest/download/Equilibrium.apk)** dal telefono (nessuno ZIP da estrarre).
2. Apri il file scaricato e consenti l'installazione da origini sconosciute se richiesto.
3. L'app funziona **100% offline** (anche in modalità aereo) e include i promemoria settimanali nativi in **Impostazioni**.

---

## Sviluppo locale e Build

### Avvio in locale
```bash
npm install
npm run dev       # server di sviluppo
npm run build     # build statica in dist/
npm run preview   # anteprima locale della build statica
npm test          # test unitari (Vitest)
npm run lint      # controllo codice (ESLint)
```

> Non aprire `dist/index.html` con doppio clic (`file://`): usa sempre `npm run preview` o un server HTTP statico.

### Rigenerazione asset offline (MP4 e MP3)
Tutti i media finali sono già inclusi in `public/media/`. Per rigenerarli dai file sorgenti (`gif/`, `immagini/`, `content/audio_scripts.json`):

```bash
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r scripts/requirements.txt
.venv\Scripts\python.exe scripts/convert_gifs.py
.venv\Scripts\python.exe scripts/generate_audio.py
.venv\Scripts\python.exe scripts/generate_icons.py
```

### Pubblicazione automatica (GitHub Actions)
* **Web App (GitHub Pages)**: il workflow `.github/workflows/deploy-pages.yml` pubblica automaticamente `dist/` ad ogni push su `main`.
* **APK Android firmato**: il workflow `.github/workflows/build-android-apk.yml` (avviabile da **Actions → Build Signed Android APK → Run workflow** o con un tag `v*.*.*`) compila l'app con Capacitor 7 + Java 21 e pubblica direttamente **`Equilibrium.apk`** nella sezione **Releases**.

Per firmare l'APK in release sono configurati i 4 Repository Secrets in **Settings → Secrets and variables → Actions**:
`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
