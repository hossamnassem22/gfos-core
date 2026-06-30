from pathlib import Path
import re

p = Path("src/interfaces/http/server.ts")
text = p.read_text(encoding="utf-8")

text = re.sub(
    r"<style>.*?</style>",
    '<link rel="stylesheet" href="/static/css/dashboard.css">',
    text,
    flags=re.S,
    count=1,
)

p.write_text(text, encoding="utf-8")
print("CSS reference inserted.")
