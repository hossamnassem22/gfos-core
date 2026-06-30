from pathlib import Path
import re

server = Path("src/interfaces/http/server.ts")
js = Path("src/interfaces/http/static/js/dashboard.js")

text = server.read_text(encoding="utf-8")

m = re.search(r"<script>(.*?)</script>", text, re.S)
if not m:
    raise SystemExit("ERROR: <script> block not found")

js.parent.mkdir(parents=True, exist_ok=True)
js.write_text(m.group(1).strip() + "\n", encoding="utf-8")

print("JavaScript extracted successfully.")
print(js)
