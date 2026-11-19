"""Convert source GIFs to iOS/Android-compatible H.264 MP4s and stage media into public/media/."""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

try:
    import imageio_ffmpeg
except ImportError:
    imageio_ffmpeg = None

ROOT = Path(__file__).resolve().parent.parent
GIF_DIR = ROOT / "gif"
IMG_DIR = ROOT / "immagini"
PDF_SRC = ROOT / "guida_equilibrio_corpo_libero.pdf"
PUBLIC_MEDIA = ROOT / "public" / "media"

EXERCISE_MEDIA_MAP: list[tuple[str, str, str]] = [
    ("01_stazione_monopodalica", "Gemini_Generated_Gif_nshy0bnshy0bnshy.gif", "01_stazione_monopodalica.jpg"),
    ("02_camminata_tandem", "Gemini_Generated_Gif_511pw6511pw6511p.gif", "02_camminata_tandem.jpg"),
    ("03_seduto_in_piedi", "Gemini_Generated_Gif_uxy34xuxy34xuxy3.gif", "03_seduto_in_piedi.jpg"),
    ("04_esercizio_orologio", "Gemini_Generated_Gif_z20meez20meez20m.gif", "04_esercizio_orologio.jpg"),
    ("05_talloni_e_punte", "Gemini_Generated_Gif_6r3kqo6r3kqo6r3k.gif", "05_talloni_e_punte.jpg"),
    ("06_camminata_laterale_abduzioni", "Gemini_Generated_Gif_unxtngunxtngunxt.gif", "06_camminata_laterale_abduzioni.jpg"),
]


def resolve_ffmpeg() -> str:
    if shutil.which("ffmpeg"):
        return "ffmpeg"
    if imageio_ffmpeg is not None:
        return imageio_ffmpeg.get_ffmpeg_exe()
    raise RuntimeError("ffmpeg non trovato. Installa ffmpeg nel PATH o imageio-ffmpeg via pip.")


def main() -> int:
    ffmpeg = resolve_ffmpeg()
    videos_dir = PUBLIC_MEDIA / "videos"
    images_dir = PUBLIC_MEDIA / "images"
    videos_dir.mkdir(parents=True, exist_ok=True)
    images_dir.mkdir(parents=True, exist_ok=True)

    if not PDF_SRC.exists():
        print(f"Errore: PDF mancante in {PDF_SRC}", file=sys.stderr)
        return 1
    shutil.copy2(PDF_SRC, PUBLIC_MEDIA / PDF_SRC.name)
    print(f"Copiato PDF -> {PUBLIC_MEDIA / PDF_SRC.name}")

    for slug, gif_name, img_name in EXERCISE_MEDIA_MAP:
        img_src = IMG_DIR / img_name
        gif_src = GIF_DIR / gif_name
        if not img_src.exists():
            print(f"Errore: immagine mancante {img_src}", file=sys.stderr)
            return 1
        if not gif_src.exists():
            print(f"Errore: GIF mancante {gif_src}", file=sys.stderr)
            return 1

        shutil.copy2(img_src, images_dir / img_name)

        mp4_dst = videos_dir / f"{slug}.mp4"
        cmd = [
            ffmpeg,
            "-y",
            "-i",
            str(gif_src),
            "-movflags",
            "+faststart",
            "-pix_fmt",
            "yuv420p",
            "-vf",
            "scale=trunc(iw/2)*2:trunc(ih/2)*2",
            "-c:v",
            "libx264",
            "-crf",
            "24",
            "-an",
            str(mp4_dst),
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        size_kb = mp4_dst.stat().st_size / 1024
        print(f"Convertito {gif_name} -> {mp4_dst.name} ({size_kb:.1f} KB)")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
