from pathlib import Path

lines = Path("src/main.ts").read_text(encoding="utf-8").splitlines()

for i, line in enumerate(lines, 1):
    if 'app.post("/auth/login"' in line:
        start = max(1, i)
        end = min(len(lines), i + 25)
        for n in range(start, end + 1):
            print(f"{n}: {lines[n-1]}")
        break
