"""Generate high-resolution Equilibrium app icons for Web (PWA/iOS/favicon) and Android mipmaps."""

from __future__ import annotations

import math
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ANDROID_RES = ROOT / "android" / "app" / "src" / "main" / "res"
PUBLIC_DIR = ROOT / "public"

NAVY = (13, 43, 69, 255)        # #0D2B45
NAVY_DARK = (9, 29, 48, 255)    # #091D30
TEAL = (20, 184, 166, 255)      # #14B8A6
TEAL_LIGHT = (94, 234, 212, 255) # #5EEAD4
WHITE = (248, 250, 252, 255)    # #F8FAFC


def render_master(size: int, with_background: bool, circle_mask: bool = False) -> Image.Image:
    """Render an anti-aliased Equilibrium balance emblem at 4x supersampling."""
    ss = size * 4
    img = Image.new("RGBA", (ss, ss), NAVY if with_background else (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx = ss / 2
    cy = ss / 2

    if with_background:
        # Subtle radial highlight in center
        for i in range(18, 0, -1):
            frac = i / 18
            r = ss * 0.56 * frac
            c = (
                int(NAVY_DARK[0] + (18 - NAVY_DARK[0]) * (1 - frac)),
                int(NAVY_DARK[1] + (74 - NAVY_DARK[1]) * (1 - frac)),
                int(NAVY_DARK[2] + (96 - NAVY_DARK[2]) * (1 - frac)),
                255,
            )
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=c)

    # Outer balance ring (adaptive-safe radius ~31% for foreground, ~38% for full icon)
    scale = 0.72 if not with_background else 0.90
    ring_r = ss * 0.38 * scale
    ring_w = max(4, int(ss * 0.042 * scale))
    draw.ellipse(
        [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
        outline=TEAL,
        width=ring_w,
    )

    # Horizontal equilibrium beam
    beam_half = ss * 0.25 * scale
    beam_y = cy + ss * 0.03 * scale
    beam_h = max(4, int(ss * 0.036 * scale))
    draw.rounded_rectangle(
        [cx - beam_half, beam_y - beam_h / 2, cx + beam_half, beam_y + beam_h / 2],
        radius=beam_h / 2,
        fill=WHITE,
    )

    # Center fulcrum triangle below beam
    tri_w = ss * 0.13 * scale
    tri_h = ss * 0.14 * scale
    tri_top = beam_y + beam_h * 0.55
    draw.polygon(
        [
            (cx, tri_top),
            (cx - tri_w, tri_top + tri_h),
            (cx + tri_w, tri_top + tri_h),
        ],
        fill=TEAL_LIGHT,
    )

    # Stylized person head + upright core above beam (symbolizing bodyweight balance)
    head_r = ss * 0.068 * scale
    head_y = cy - ss * 0.155 * scale
    draw.ellipse(
        [cx - head_r, head_y - head_r, cx + head_r, head_y + head_r],
        fill=WHITE,
    )

    # Curved balance arc / arms
    arc_r = ss * 0.19 * scale
    arc_box = [cx - arc_r, head_y - ss * 0.01 * scale, cx + arc_r, head_y + arc_r * 1.65]
    draw.arc(arc_box, start=25, end=155, fill=TEAL_LIGHT, width=max(4, int(ss * 0.034 * scale)))

    # Vertical alignment dot at top of ring
    dot_r = ss * 0.028 * scale
    dot_y = cy - ring_r
    draw.ellipse([cx - dot_r, dot_y - dot_r, cx + dot_r, dot_y + dot_r], fill=WHITE)

    out = img.resize((size, size), Image.Resampling.LANCZOS)

    if circle_mask:
        mask = Image.new("L", (size * 4, size * 4), 0)
        mdraw = ImageDraw.Draw(mask)
        pad = int(size * 4 * 0.04)
        mdraw.ellipse([pad, pad, size * 4 - pad, size * 4 - pad], fill=255)
        mask_small = mask.resize((size, size), Image.Resampling.LANCZOS)
        circ = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        circ.paste(out, (0, 0), mask_small)
        return circ

    return out


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    # Web & PWA icons
    render_master(512, with_background=True).save(PUBLIC_DIR / "icon-512.png")
    render_master(192, with_background=True).save(PUBLIC_DIR / "icon-192.png")
    render_master(180, with_background=True).save(PUBLIC_DIR / "apple-touch-icon.png")
    render_master(64, with_background=True, circle_mask=True).save(PUBLIC_DIR / "favicon.png")

    # Android mipmaps
    densities = {
        "mdpi": (48, 108),
        "hdpi": (72, 162),
        "xhdpi": (96, 216),
        "xxhdpi": (144, 324),
        "xxxhdpi": (192, 432),
    }

    for density, (launcher_px, fg_px) in densities.items():
        target_dir = ANDROID_RES / f"mipmap-{density}"
        target_dir.mkdir(parents=True, exist_ok=True)
        render_master(launcher_px, with_background=True).save(target_dir / "ic_launcher.png")
        render_master(launcher_px, with_background=True, circle_mask=True).save(
            target_dir / "ic_launcher_round.png"
        )
        render_master(fg_px, with_background=False).save(
            target_dir / "ic_launcher_foreground.png"
        )

    # Adaptive icon background color matching brand navy
    bg_xml = ANDROID_RES / "values" / "ic_launcher_background.xml"
    bg_xml.write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        "<resources>\n"
        '    <color name="ic_launcher_background">#0D2B45</color>\n'
        "</resources>\n",
        encoding="utf-8",
    )

    # Verify unused math import not needed
    _ = math.pi
    print("Icone Web e Android generate correttamente.")


if __name__ == "__main__":
    main()
