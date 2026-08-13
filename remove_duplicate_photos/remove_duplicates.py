"""
Remove duplicate photos (and videos) from a folder.

Duplicates are detected by exact content match (SHA-256 hash), so only
byte-for-byte identical files are considered duplicates -- resized,
cropped or re-compressed copies are NOT touched.

Usage:
    python remove_duplicates.py /path/to/photos
    python remove_duplicates.py /path/to/photos --yes        # skip confirmation
    python remove_duplicates.py /path/to/photos --dry-run    # only show a report

A CSV log of every deleted file (and which file was kept in its place)
is written next to this script so deletions can be reviewed afterwards.
"""

import argparse
import csv
import hashlib
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path

MEDIA_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".heic", ".heif", ".gif", ".bmp", ".webp",
    ".mp4", ".mov", ".avi", ".mkv", ".3gp",
}


def hash_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    sha256 = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def find_media_files(root: Path):
    return [
        p for p in root.rglob("*")
        if p.is_file() and p.suffix.lower() in MEDIA_EXTENSIONS
    ]


def group_by_hash(files):
    groups = defaultdict(list)
    for path in files:
        try:
            groups[hash_file(path)].append(path)
        except OSError as exc:
            print(f"  aviso: não foi possível ler {path}: {exc}")
    return {h: paths for h, paths in groups.items() if len(paths) > 1}


def pick_keeper(paths):
    return min(paths, key=lambda p: p.stat().st_mtime)


def main():
    parser = argparse.ArgumentParser(description="Remove fotos/vídeos duplicados (idênticos) de uma pasta.")
    parser.add_argument("folder", type=Path, help="pasta com as fotos (busca recursiva)")
    parser.add_argument("--dry-run", action="store_true", help="apenas mostra o que seria removido, sem apagar nada")
    parser.add_argument("--yes", action="store_true", help="apaga sem pedir confirmação")
    args = parser.parse_args()

    root = args.folder
    if not root.is_dir():
        sys.exit(f"Pasta não encontrada: {root}")

    print(f"Escaneando {root} ...")
    files = find_media_files(root)
    print(f"{len(files)} arquivos de foto/vídeo encontrados. Calculando hashes...")

    duplicate_groups = group_by_hash(files)
    if not duplicate_groups:
        print("Nenhuma duplicata encontrada.")
        return

    to_delete = []
    total_bytes = 0
    print(f"\n{len(duplicate_groups)} grupo(s) de duplicatas encontrados:\n")
    for paths in duplicate_groups.values():
        keeper = pick_keeper(paths)
        losers = [p for p in paths if p != keeper]
        print(f"  MANTER : {keeper}")
        for loser in losers:
            print(f"  REMOVER: {loser}")
            total_bytes += loser.stat().st_size
            to_delete.append((loser, keeper))
        print()

    print(f"Total: {len(to_delete)} arquivo(s) duplicado(s), {total_bytes / (1024 * 1024):.1f} MB a liberar.")

    if args.dry_run:
        print("\n--dry-run: nada foi apagado.")
        return

    if not args.yes:
        resp = input(f"\nConfirma a remoção de {len(to_delete)} arquivo(s)? [s/N] ").strip().lower()
        if resp != "s":
            print("Cancelado. Nada foi apagado.")
            return

    log_path = Path(__file__).parent / f"duplicatas_removidas_{datetime.now():%Y%m%d_%H%M%S}.csv"
    with log_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["arquivo_removido", "arquivo_mantido"])
        deleted = 0
        for loser, keeper in to_delete:
            try:
                loser.unlink()
                writer.writerow([str(loser), str(keeper)])
                deleted += 1
            except OSError as exc:
                print(f"  aviso: não foi possível remover {loser}: {exc}")

    print(f"\n{deleted} arquivo(s) removido(s).")
    print(f"Log salvo em: {log_path}")


if __name__ == "__main__":
    main()
