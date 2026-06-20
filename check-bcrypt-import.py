from pathlib import Path

text = Path("src/main.ts").read_text(encoding="utf-8")

for line in text.splitlines():
    if "bcrypt" in line and "import" in line:
        print(line)
