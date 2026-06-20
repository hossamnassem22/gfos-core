from pathlib import Path

p = Path("src/main.ts")
text = p.read_text(encoding="utf-8")

marker = "// ✅ تطبيع prefix قبل المقارنة"

idx = text.find(marker)
if idx != -1:
    text = text[:idx].rstrip() + "\n"
    p.write_text(text, encoding="utf-8")
    print("Removed appended invalid code.")
else:
    print("Marker not found. Nothing changed.")
