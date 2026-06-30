from pathlib import Path
import re

p = Path("src/interfaces/http/server.ts")
text = p.read_text(encoding="utf-8")

text = re.sub(
    r"<script>.*?</script>",
    '<script src="/static/js/dashboard.js"></script>',
    text,
    flags=re.S,
    count=1,
)

p.write_text(text, encoding="utf-8")
print("JS reference inserted.")
