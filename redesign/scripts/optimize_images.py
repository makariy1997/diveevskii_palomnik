from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps

try:
    import pillow_avif  # Registers the AVIF encoder when available.
except ImportError:
    pass

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = PROJECT_ROOT / "img"
OUTPUT_DIR = PROJECT_ROOT / "redesign" / "img" / "optimized"
SOURCE_NAMES = (
    "hero.jpg", "hero-1600.jpg", "room2-1.jpg", "tower.jpg", "pond.jpg",
    "place-1.jpg", "place-2.jpg", "place-3.jpg", "place-4.jpg",
    "place-5.jpg", "place-6.jpg", "evening.jpg",
    "room1-1.jpg", "room3-1.jpg", "room4-1.jpg",
)
TARGET_WIDTHS = (800, 1600, 2560)


def process_image(source: Path) -> list[dict[str, object]]:
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
    image = ImageEnhance.Brightness(image).enhance(1.01)
    image = ImageEnhance.Contrast(image).enhance(1.03)
    image = ImageEnhance.Color(image).enhance(1.04)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.1, percent=90, threshold=3))

    output = []
    stem = source.stem
    small = image.copy()
    small.thumbnail((40, 40), Image.Resampling.LANCZOS)
    small = small.filter(ImageFilter.GaussianBlur(1.2))
    lqip_path = OUTPUT_DIR / f"{stem}-lqip.webp"
    small.save(lqip_path, "WEBP", quality=35, method=6)
    output.append({"file": str(lqip_path.relative_to(PROJECT_ROOT)), "width": small.width, "format": "webp-lqip"})

    source_width, source_height = image.size
    for target_width in TARGET_WIDTHS:
        if target_width > source_width:
            continue
        target_height = round(source_height * target_width / source_width)
        resized = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
        for fmt, settings in (
            ("webp", {"quality": 78, "method": 6}),
            ("avif", {"quality": 50, "speed": 6}),
        ):
            path = OUTPUT_DIR / f"{stem}-{target_width}.{fmt}"
            try:
                resized.save(path, fmt.upper(), **settings)
            except (OSError, ValueError) as exc:
                if fmt == "avif":
                    continue
                raise RuntimeError(f"Could not encode {path}: {exc}") from exc
            output.append({"file": str(path.relative_to(PROJECT_ROOT)), "width": target_width, "format": fmt})
    return output


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report = []
    missing = []
    for name in SOURCE_NAMES:
        source = SOURCE_DIR / name
        if not source.exists():
            missing.append(name)
            continue
        report.extend(process_image(source))
    print(json.dumps({"generated": report, "missing_sources": missing}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

