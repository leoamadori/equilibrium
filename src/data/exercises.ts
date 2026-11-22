import type { Exercise } from '../types/exercise';

export const EXERCISES: Exercise[] = [
  {
    id: '01',
    number: 1,
    title: 'Stazione Monopodalica',
    subtitle: 'Single-Leg Stance',
    objective:
      'Attivare i meccanocettori della caviglia, la propriocezione e il medio gluteo.',
    loadParams: [
      { label: 'Serie', value: '3 per gamba' },
      { label: 'Tenuta isometrica', value: '20–30 secondi per arto' },
      { label: 'Recupero', value: '30–45 secondi tra le serie' },
      { label: 'Frequenza consigliata', value: '3–5 volte a settimana' },
    ],
    steps: [
      'Posizionati in piedi con i piedi alla larghezza del bacino e la postura eretta.',
      "Fissa un punto immobile davanti a te all'altezza degli occhi.",
      'Trasferisci gradualmente il peso su una sola gamba, mantenendo il ginocchio portante leggermente sbloccato (non iperesteso).',
      'Solleva il piede opposto flettendo il ginocchio a 90° e mantieni il bacino perfettamente orizzontale.',
    ],
    tvPoints: [
      'Ginocchio portante leggermente sbloccato',
      'Bacino orizzontale e sguardo fisso davanti',
      'Respiro regolare senza apnea',
    ],
    targetMuscles:
      'Caviglia, tibiale anteriore, muscoli peronieri, medio e piccolo gluteo, core addominale.',
    commonErrors: [
      'Inclinare il busto lateralmente per compensare la perdita di stabilità.',
      'Bloccare il respiro (apnea involontaria).',
      "Lasciare che il ginocchio d'appoggio collassi verso l'interno (valgismo).",
    ],
    easyLevel:
      'Appoggiare la punta del piede libero a terra o sfiorare una sedia/parete con una mano.',
    advancedLevel:
      'Chiudere gli occhi, ruotare la testa a destra/sinistra, o salire su un cuscino morbido.',
    pdfPage: 2,
    imagePath: './media/images/01_stazione_monopodalica.jpg',
    videoPath: './media/videos/01_stazione_monopodalica.mp4',
    audioFullPath: './media/audio/01_full.mp3',
    audioShortPath: './media/audio/01_short.mp3',
    levels: {
      facile: {
        summary: '3 serie × 20 s per gamba • Pausa 45 s',
        workSec: 20,
        restSec: 45,
      },
      allenato: {
        summary: '3 serie × 30 s per gamba • Pausa 30 s',
        workSec: 30,
        restSec: 30,
      },
    },
  },
  {
    id: '02',
    number: 2,
    title: 'Camminata e Stazione in Tandem',
    subtitle: 'Heel-to-Toe',
    objective:
      'Ridurre la base di appoggio sul piano laterale e migliorare la coordinazione dinamica del passo.',
    loadParams: [
      { label: 'Statica', value: '3 serie da 20–30 secondi (invertendo il piede anteriore)' },
      { label: 'Dinamica', value: '2–3 percorsi da 10–15 passi in avanti' },
      { label: 'Recupero', value: '45 secondi tra i percorsi' },
    ],
    steps: [
      'Immagina o traccia una linea retta sul pavimento.',
      "Posiziona un piede direttamente davanti all'altro, in modo che il tallone anteriore tocchi la punta del piede posteriore.",
      'Allarga le braccia a "croce" per assistere il bilanciamento.',
      'Per la camminata, fai un passo avanti posizionando lentamente il nuovo tallone a contatto con la punta del piede precedente.',
      'Fai una pausa di 1–2 secondi ad ogni singolo passo prima di avanzare nuovamente.',
    ],
    tvPoints: [
      'Tallone anteriore a contatto con la punta posteriore',
      'Braccia a croce per bilanciare',
      'Sguardo orizzontale (non sui piedi)',
    ],
    targetMuscles:
      'Muscoli intrinseci del piede, complessi stabilizzatori di caviglia e ginocchio, canali vestibolari.',
    commonErrors: [
      'Correre o muoversi a scatti senza stabilizzare ogni singolo appoggio.',
      'Guardare costantemente verso i propri piedi anziché mantenere lo sguardo orizzontale.',
    ],
    easyLevel:
      'Posizione semi-tandem (piede anteriore leggermente spostato lateralmente) vicino a un corrimano.',
    advancedLevel:
      "Camminata in tandem all'indietro o con rotazione continua dello sguardo a destra e a sinistra.",
    pdfPage: 5,
    imagePath: './media/images/02_camminata_tandem.jpg',
    videoPath: './media/videos/02_camminata_tandem.mp4',
    audioFullPath: './media/audio/02_full.mp3',
    audioShortPath: './media/audio/02_short.mp3',
    levels: {
      facile: {
        summary: 'Statica 3 × 20 s oppure 2 × 10 passi • Pausa 45 s',
        workSec: 20,
        restSec: 45,
      },
      allenato: {
        summary: 'Statica 3 × 30 s oppure 3 × 15 passi • Pausa 45 s',
        workSec: 30,
        restSec: 45,
      },
    },
  },
  {
    id: '03',
    number: 3,
    title: 'Transizione Seduto-in-Piedi',
    subtitle: 'Sit-to-Stand Drill',
    objective:
      'Potenziare la forza funzionale degli arti inferiori e controllare lo spostamento antero-posteriore del baricentro.',
    loadParams: [
      { label: 'Serie', value: '2–3 serie' },
      { label: 'Ripetizioni', value: '8–12 ripetizioni lente e controllate' },
      { label: 'Recupero', value: '60 secondi tra le serie' },
    ],
    steps: [
      'Siediti sul bordo anteriore di una sedia solida e non scorrevole, con i piedi piatti a terra e alla larghezza delle spalle.',
      'Incrocia le braccia sul petto per evitare di fare leva con le mani sulle cosce o sui braccioli.',
      'Inclina il tronco in avanti a partire dalle anche mantenendo la schiena piatta.',
      'Spingi attraverso i talloni per sollevarti in posizione eretta completa, contraendo i glutei.',
      'Riscendi lentamente verso la sedia impiegando 3–4 secondi, sfiorando la seduta prima di risalire o sederti senza tonfi.',
    ],
    tvPoints: [
      'Braccia incrociate sul petto, spinta sui talloni',
      'Ginocchia allineate (non chiuderle)',
      'Discesa lenta 3–4 secondi senza tonfi',
    ],
    targetMuscles:
      'Quadricipiti, grande gluteo, muscoli ischiocrurali, erettori spinali.',
    commonErrors: [
      'Darsi slancio con le braccia o oscillare il busto a scatto.',
      "Chiudere le ginocchia verso l'interno durante la fase di spinta o discesa.",
      '"Cadere" passivamente sulla sedia nella fase di ritorno.',
    ],
    easyLevel:
      'Sedia leggermente più alta o appoggio leggero delle mani sui braccioli.',
    advancedLevel:
      'Esecuzione con appoggio dei piedi sfalsato (staggered stance) o sfiorando la sedia su una gamba sola.',
    pdfPage: 8,
    imagePath: './media/images/03_seduto_in_piedi.jpg',
    videoPath: './media/videos/03_seduto_in_piedi.mp4',
    audioFullPath: './media/audio/03_full.mp3',
    audioShortPath: './media/audio/03_short.mp3',
    levels: {
      facile: {
        summary: '2 serie × 8 ripetizioni lente • Pausa 60 s',
        restSec: 60,
      },
      allenato: {
        summary: '3 serie × 12 ripetizioni lente • Pausa 60 s',
        restSec: 60,
      },
    },
  },
  {
    id: '04',
    number: 4,
    title: "Esercizio dell'Orologio",
    subtitle: 'Clock Reach Drill',
    objective:
      "Ottimizzare il controllo dinamico multiplanare e la stabilità reattiva dell'anca e del ginocchio.",
    loadParams: [
      { label: 'Serie', value: '2 serie per gamba' },
      { label: 'Ripetizioni', value: '1–2 giri completi del quadrante per lato' },
      { label: 'Recupero', value: '45–60 secondi' },
    ],
    steps: [
      'Immagina di essere in piedi al centro del quadrante di un orologio, in equilibrio sulla gamba sinistra.',
      'Mantieni il ginocchio sinistro leggermente piegato e le mani sui fianchi.',
      'Con la punta del piede destro, allungati in avanti per toccare leggermente "ore 12" senza appoggiare il peso.',
      'Riporta il piede al centro senza fargli toccare terra, poi tocca "ore 3" (lato) e "ore 6" (dietro).',
      'Ripeti invertendo la gamba di sostegno (la gamba destra al centro toccherà le posizioni ore 12, 9 e 6).',
    ],
    tvPoints: [
      'Peso sempre sulla gamba portante (ginocchio morbido)',
      'Sfiora ore 12, lato (3 o 9) e ore 6 senza appoggiare',
      'Busto dritto e mani sui fianchi',
    ],
    targetMuscles:
      "Stabilizzatori della caviglia, quadricipite e flessori d'anca, muscoli glutei della gamba di terra.",
    commonErrors: [
      "Scaricare il peso corporeo sul piede che esplora le posizioni dell'orologio anziché mantenerlo sulla gamba portante.",
      "Perdere l'allineamento del busto inclinandosi eccessivamente.",
    ],
    easyLevel:
      'Toccare solo i punti cardinali (avanti e dietro) tenendosi a una spalliera.',
    advancedLevel:
      'Aumentare la distanza di tocco allontanando il piede dal centro, oppure toccare i punti in ordine casuale su indicazione verbale.',
    pdfPage: 11,
    imagePath: './media/images/04_esercizio_orologio.jpg',
    videoPath: './media/videos/04_esercizio_orologio.mp4',
    audioFullPath: './media/audio/04_full.mp3',
    audioShortPath: './media/audio/04_short.mp3',
    levels: {
      facile: {
        summary: '2 serie × 1 giro per lato • Pausa 60 s',
        restSec: 60,
      },
      allenato: {
        summary: '2 serie × 2 giri per lato • Pausa 45 s',
        restSec: 45,
      },
    },
  },
  {
    id: '05',
    number: 5,
    title: 'Sollevamento sui Talloni e sulle Punte',
    subtitle: 'Calf & Toe Raises',
    objective:
      'Incrementare la forza distale della gamba, la flessibilità tibio-tarsica e la reattività della caviglia alle oscillazioni.',
    loadParams: [
      { label: 'Serie', value: '2–3 serie' },
      { label: 'Ripetizioni', value: '10–15 ripetizioni complete (punte + talloni)' },
      { label: 'Recupero', value: '30–45 secondi' },
    ],
    steps: [
      'Posizionati in piedi con i piedi paralleli alla larghezza delle anche e la parete/sedia a portata di mano.',
      "Spingi sull'avampiede e solleva entrambi i talloni verso l'alto il più possibile.",
      'Mantieni la contrazione apicale in cima per 2–3 secondi.',
      'Scendi lentamente fino a poggiare la pianta a terra.',
      "Immediatamente dopo, sposta il peso sui talloni e solleva le punte dei piedi verso l'alto (dorsiflessione) per 2 secondi prima di tornare a terra.",
    ],
    tvPoints: [
      'Sali sulle punte (2–3 s), scendi lento senza rimbalzare',
      'Solleva le punte sui talloni per 2 secondi',
      'Mantieni il corpo allineato vicino a un appoggio',
    ],
    targetMuscles:
      'Complesso gastrocnemio-soleo (polpacci), muscolo tibiale anteriore, dita dei piedi e fascia plantare.',
    commonErrors: [
      "Piegare il bacino all'indietro durante il sollevamento delle punte anziché mantenere il corpo allineato.",
      'Rimbalzare elasticamente senza controllare la fase di discesa.',
    ],
    easyLevel:
      'Esecuzione con due mani saldamente appoggiate a un ripiano solido.',
    advancedLevel:
      'Esecuzione monopodalica (un piede alla volta) senza supporto manuale.',
    pdfPage: 14,
    imagePath: './media/images/05_talloni_e_punte.jpg',
    videoPath: './media/videos/05_talloni_e_punte.mp4',
    audioFullPath: './media/audio/05_full.mp3',
    audioShortPath: './media/audio/05_short.mp3',
    levels: {
      facile: {
        summary: '2 serie × 10 ripetizioni complete • Pausa 45 s',
        restSec: 45,
      },
      allenato: {
        summary: '3 serie × 15 ripetizioni complete • Pausa 30 s',
        restSec: 30,
      },
    },
  },
  {
    id: '06',
    number: 6,
    title: "Camminata Laterale e Abduzioni dell'Anca",
    subtitle: 'Sideways Walk & Hip Abduction',
    objective:
      "Consolidare la stabilità frontale del bacino, prevenendo i cedimenti laterali dell'anca.",
    loadParams: [
      { label: 'Camminata Laterale', value: '2–3 serie da 10 passi a destra e 10 a sinistra' },
      { label: 'Abduzione Statica', value: '2–3 serie da 10 sollevamenti lenti per gamba' },
      { label: 'Recupero', value: '45 secondi' },
    ],
    steps: [
      'Per la camminata laterale: posizionati con ginocchia leggermente flesse e addome contratto. Fai un passo laterale ampio verso destra e unisci il piede sinistro con ritmo controllato; ripeti nella direzione opposta.',
      'Per le abduzioni: mettiti in posizione eretta con le mani sui fianchi.',
      "Trasferisci il carico sulla gamba sinistra e solleva la gamba destra lateralmente (circa 30–45°) mantenendo la punta del piede rivolta in avanti (non ruotata verso l'alto).",
      'Mantieni la posizione per 2–3 secondi e torna lentamente alla base senza far toccare il pavimento.',
    ],
    tvPoints: [
      'Punta del piede rivolta in avanti (non verso l’alto)',
      'Busto verticale senza inclinarti di lato',
      'Tenuta 2–3 s in alto, discesa controllata',
    ],
    targetMuscles:
      'Medio gluteo, piccolo gluteo, tensore della fascia lata, stabilizzatori laterali della colonna.',
    commonErrors: [
      'Inclinare il tronco dal lato opposto durante il sollevamento della gamba.',
      "Ruotare la punta del piede all'infuori (extrarotazione d'anca anziché abduzione pura).",
    ],
    easyLevel:
      "Eseguire l'abduzione tenendosi con entrambe le mani a un tavolo.",
    advancedLevel:
      'Mantenere la gamba abdotta per 5 secondi o posizionare una banda elastica leggera attorno alle caviglie.',
    pdfPage: 17,
    imagePath: './media/images/06_camminata_laterale_abduzioni.jpg',
    videoPath: './media/videos/06_camminata_laterale_abduzioni.mp4',
    audioFullPath: './media/audio/06_full.mp3',
    audioShortPath: './media/audio/06_short.mp3',
    levels: {
      facile: {
        summary: '2 serie × 10 passi o 10 aperture/lato • Pausa 45 s',
        restSec: 45,
      },
      allenato: {
        summary: '3 serie × 10 passi o 10 aperture/lato • Pausa 45 s',
        restSec: 45,
      },
    },
  },
];

export const PDF_PATH = './media/guida_equilibrio_corpo_libero.pdf';
export const WEEKLY_TARGET_MIN = 3;
export const WEEKLY_TARGET_MAX = 5;
