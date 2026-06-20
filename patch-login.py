from pathlib import Path

p = Path("src/main.ts")
text = p.read_text(encoding="utf-8")

old = """    const valid = password === u.password_hash;"""

new = """    let hash = u.password_hash;
    if (hash.startsWith("$2a$")) {
      hash = hash.replace("$2a$", "$2b$");
    }
    const valid = await bcrypt.compare(password, hash);"""

if old not in text:
    raise SystemExit("Target line not found.")

text = text.replace(old, new, 1)
p.write_text(text, encoding="utf-8")

print("Login route patched successfully.")
