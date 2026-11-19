"""Generate offline Italian coach MP3 tracks using edge-tts and normalize to -16 LUFS via ffmpeg."""

from __future__ import annotations

import asyncio
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

import edge_tts

try:
    import imageio_ffmpeg
except ImportError:
    imageio_ffmpeg = None

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_JSON = ROOT / "content" / "audio_scripts.json"
AUDIO_OUT = ROOT / "public" / "media" / "audio"


def resolve_ffmpeg() -> str:
    if shutil.which("ffmpeg"):
        return "ffmpeg"
    if imageio_ffmpeg is not None:
        return imageio_ffmpeg.get_ffmpeg_exe()
    raise RuntimeError("ffmpeg non trovato. Installa ffmpeg nel PATH o imageio-ffmpeg via pip.")


async def synthesize_track(text: str, voice: str, rate: str, raw_mp3: Path, final_mp3: Path, ffmpeg: str) -> None:
    communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate)
    await communicate.save(str(raw_mp3))

    cmd = [
        ffmpeg,
        "-y",
        "-i",
        str(raw_mp3),
        "-af",
        "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-ac",
        "1",
        "-b:a",
        "64k",
        str(final_mp3),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    size_kb = final_mp3.stat().st_size / 1024
    print(f"Generato {final_mp3.name} ({size_kb:.1f} KB)")


async def main() -> None:
    ffmpeg = resolve_ffmpeg()
    AUDIO_OUT.mkdir(parents=True, exist_ok=True)
    data = json.loads(SCRIPTS_JSON.read_text(encoding="utf-8"))
    voice: str = data["voice"]
    rate: str = data.get("rate", "+0%")
    exercises: dict[str, dict[str, str]] = data["exercises"]

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = Path(tmpdir)
        for ex_id, scripts in exercises.items():
            for variant in ("full", "short"):
                text = scripts[variant]
                raw_path = tmp / f"{ex_id}_{variant}_raw.mp3"
                out_path = AUDIO_OUT / f"{ex_id}_{variant}.mp3"
                await synthesize_track(text, voice, rate, raw_path, out_path, ffmpeg)


if __name__ == "__main__":
    asyncio.run(main())
