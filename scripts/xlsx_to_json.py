"""Convert the castle XLSX source to clean EN-only JSON for the Angular app.

Source: old_app/database/Topcastles export.xlsx (1000 castles, 42 columns, Unicode)
Output: new_app/src/assets/data/castles.json (EN-only, 20 fields, UTF-8)

Decisions applied:
- ADR-001: EN-only (drop NL columns: land, gebied, stichter, kasteel_type, etc.)
- ADR-003: Static JSON data layer from XLSX source
- Drops internal/unused columns (tags, maps, ct_code, cc_code, c_code, Description2, etc.)
- Strips trailing whitespace from all string fields
- Removes Unicode control characters (e.g. LRM \u200e)
- Outputs proper JSON with floats/ints (no comma decimals)

Usage:
    python scripts/xlsx_to_json.py
"""

import json
import re
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("ERROR: openpyxl is required. Install with: pip install openpyxl")
    sys.exit(1)

# Paths relative to repo root
REPO_ROOT = Path(__file__).resolve().parent.parent
XLSX_PATH = REPO_ROOT / "old_app" / "database" / "Topcastles export.xlsx"
OUTPUT_DIR = REPO_ROOT / "new_app" / "src" / "assets" / "data"
OUTPUT_PATH = OUTPUT_DIR / "castles.json"

# Column index → JSON field name (EN-only, useful columns)
COLUMNS = {
    0: "position",
    1: "castle_code",
    3: "castle_name",
    4: "country",
    7: "area",
    8: "place",
    9: "region",
    11: "latitude",
    12: "longitude",
    15: "founder",
    16: "era",
    18: "castle_type",
    21: "castle_concept",
    24: "condition",
    27: "remarkable",
    29: "description",
    30: "website",
    31: "score_total",
    32: "score_visitors",
    33: "visitors",
}

# Fields that should be integers
INT_FIELDS = {"position", "era", "visitors"}

# Fields that should be floats
FLOAT_FIELDS = {"latitude", "longitude", "score_total", "score_visitors"}

# Regex to strip Unicode control characters (LRM, RLM, zero-width spaces, etc.)
CONTROL_CHAR_RE = re.compile(r"[\u200e\u200f\u200b\u200c\u200d\ufeff]")


def clean_string(value: str | None) -> str:
    """Strip whitespace and Unicode control characters from a string value."""
    if value is None:
        return ""
    s = str(value).strip()
    s = CONTROL_CHAR_RE.sub("", s)
    return s


def convert_numeric(value, field_name: str) -> int | float | None:
    """Convert a value to int or float based on field type."""
    if value is None or value == "":
        return None
    # Handle comma-decimal strings (e.g. '43,206667' from Excel)
    if isinstance(value, str):
        value = value.strip().replace(",", ".")
    if field_name in INT_FIELDS:
        try:
            return int(float(value))
        except (ValueError, TypeError):
            return None
    if field_name in FLOAT_FIELDS:
        try:
            return round(float(value), 6)
        except (ValueError, TypeError):
            return None
    return value


def process_row(row_values: tuple, columns: dict) -> dict:
    """Extract and clean the selected columns from a row."""
    castle = {}
    for col_idx, field_name in columns.items():
        raw = row_values[col_idx] if col_idx < len(row_values) else None

        if field_name in INT_FIELDS or field_name in FLOAT_FIELDS:
            castle[field_name] = convert_numeric(raw, field_name)
        else:
            castle[field_name] = clean_string(raw)

    return castle


def main():
    if not XLSX_PATH.exists():
        print(f"ERROR: Source file not found: {XLSX_PATH}")
        sys.exit(1)

    print(f"Reading: {XLSX_PATH}")
    wb = openpyxl.load_workbook(XLSX_PATH, read_only=True)
    ws = wb.active

    castles = []
    for i, row in enumerate(ws.iter_rows(min_row=2, values_only=True)):
        castle = process_row(row, COLUMNS)

        # Skip rows without a castle code (safety check)
        if not castle.get("castle_code"):
            print(f"  WARNING: Row {i + 2} has no castle_code, skipping")
            continue

        castles.append(castle)

    wb.close()

    print(f"Processed: {len(castles)} castles")

    # Validate: check for encoding issues
    issues = 0
    for c in castles:
        name = c.get("castle_name", "")
        if "\ufffd" in name or "?" in name and any(ord(ch) > 127 for ch in name):
            print(f"  WARNING: Possible encoding issue: {name}")
            issues += 1

    if issues:
        print(f"  {issues} potential encoding issues found")

    # Write output
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(castles, f, ensure_ascii=False, indent=2)

    file_size = OUTPUT_PATH.stat().st_size
    print(f"Written: {OUTPUT_PATH} ({file_size:,} bytes)")
    print(f"Fields per castle: {len(COLUMNS)}")

    # Print a sample
    print(f"\nSample (first castle):")
    print(json.dumps(castles[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
