import os
import re

def fix_file(filepath):
    content = open(filepath).read()
    original = content
    
    # أضف .ts لأي relative import بدون extension
    def add_ts(m):
        prefix = m.group(1)
        path = m.group(2)
        quote = m.group(3)
        if path.endswith('.ts') or path.endswith('.js') or path.endswith('.json'):
            return m.group(0)
        return f"{prefix}{path}.ts{quote}"
    
    content = re.sub(
        r"(from ['\"])((?:\.\.?/)[^'\"]+)(['\"])",
        add_ts,
        content
    )
    
    # حذف drizzle-orm
    content = re.sub(r"^import.*from ['\"]drizzle-orm.*['\"].*\n?", '', content, flags=re.MULTILINE)
    content = re.sub(r"^import.*from ['\"]drizzle.*['\"].*\n?", '', content, flags=re.MULTILINE)
    
    if content != original:
        open(filepath, 'w').write(content)
        return True
    return False

fixed = 0
for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ['node_modules']]
    for f in files:
        if f.endswith('.ts'):
            path = os.path.join(root, f)
            if fix_file(path):
                print(f"Fixed: {path}")
                fixed += 1

print(f"\nTotal fixed: {fixed} files")
