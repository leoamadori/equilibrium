# Equilibrium — Web App & APK Android Offline

Applicazione client-only per il programma di 6 esercizi a corpo libero per l'equilibrio (`guida_equilibrio_corpo_libero.pdf`):
- **Web App statica** (GitHub Pages e locale su PC, iPhone, Android)
- **APK Android offline** (Capacitor 7, notifiche locali settimanali, storage persistente nativo, Wake Lock)

## Avvio in Locale

```bash
npm install
npm run dev       # sviluppo
npm run build     # build statica in dist/
npm run preview   # anteprima server locale della build statica
npm test          # test unitari Vitest
npm run lint      # controllo ESLint
```

> Nota: non aprire `dist/index.html` con doppio clic (`file://`), usa `npm run preview` o un server HTTP statico.

## Rigenerazione Asset Offline (MP4 e MP3)

Gli asset finali sono già inclusi in `public/media/`. Per rigenerarli dai sorgenti (`gif/`, `immagini/`, `content/audio_scripts.json`):

```bash
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r scripts/requirements.txt
.venv\Scripts\python.exe scripts/convert_gifs.py
.venv\Scripts\python.exe scripts/generate_audio.py
```

## Compilazione APK Firmato su GitHub Actions

1. Genera una keystore Android una sola volta (conserva una copia sicura fuori da Git):

   ```bash
   keytool -genkey -v -keystore equilibrium-release.keystore -alias equilibrium -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Converti la keystore in Base64 (PowerShell):

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("equilibrium-release.keystore")) | Set-Clipboard
   ```

3. Configura questi 4 **GitHub Repository Secrets** (`Settings -> Secrets and variables -> Actions`):
   - `ANDROID_KEYSTORE_BASE64`
   - `ANDROID_KEYSTORE_PASSWORD`
   - `ANDROID_KEY_ALIAS` (`equilibrium`)
   - `ANDROID_KEY_PASSWORD`

4. Avvia manualmente il workflow **Build Signed Android APK** dalla tab Actions (oppure crea un tag `v1.0.0`) e scarica l'APK firmato.
