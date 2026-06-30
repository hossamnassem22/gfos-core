from pathlib import Path
import re

server = Path("src/interfaces/http/server.ts")
css = Path("src/interfaces/http/static/css/dashboard.css")

text = server.read_text(encoding="utf-8")

m = re.search(r"<style>(.*?)</style>", text, re.S)
if not m:
    raise SystemExit("ERROR: <style> block not found")

css.parent.mkdir(parents=True, exist_ok=True)
css.write_text(m.group(1).strip() + "\n", encoding="utf-8")

print("CSS extracted successfully.")
print(css)
