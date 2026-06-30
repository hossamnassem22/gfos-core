from pathlib import Path

count = 0

for f in Path("src").rglob("*.ts"):
    txt = f.read_text(encoding="utf-8")
    new = txt.replace(
        "infrastructure/db/connection.ts",
        "infrastructure/database/connection.ts"
    )
    new = new.replace(
        "../db/connection.ts",
        "../database/connection.ts"
    )
    if new != txt:
        f.write_text(new, encoding="utf-8")
        print("fixed", f)
        count += 1

print(f"\nUpdated {count} files.")
