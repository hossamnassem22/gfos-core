#!/usr/bin/env python3
"""Update main element in server.ts with new dashboard HTML."""

import re
import os
import shutil
import logging
from pathlib import Path
from typing import Optional

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

FILE_PATH = Path('../src/interfaces/http/server.ts')
BACKUP_PATH = FILE_PATH.with_suffix('.bak')

NEW_MAIN = '''  <main class="main">
    <div id="page-dashboard" class="page active">
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">إجمالي المحفظة</div><div class="kpi-value" id="total-portfolio">١٢١٬٠٠٠ ج</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي الديون</div><div class="kpi-value" id="total-debts">2</div></div>
        <div class="kpi-card"><div class="kpi-label">أقساط معلقة</div><div class="kpi-value" style="color:#f59e0b" id="pending">11</div></div>
        <div class="kpi-card"><div class="kpi-label">أقساط مدفوعة</div><div class="kpi-value" id="paid" style="color:#10b981">1</div></div>
        <div class="kpi-card"><div class="kpi-label">أقساط متأخرة</div><div class="kpi-value" id="overdue" style="color:#ef4444">1</div></div>
      </div>
    </div>
    <div id="page-customers" class="page">
      <h2>👥 العملاء</h2>
      <div class="tbl-wrap"><table><tbody id="customers-tbody"></tbody></table></div>
    </div>
  </main>'''

def create_backup(file_path: Path, backup_path: Path) -> bool:
    """Create backup file, return True if successful."""
    try:
        shutil.copy2(file_path, backup_path)
        logger.info(f"✅ Backup created: {backup_path}")
        return True
    except Exception as e:
        logger.error(f"❌ Backup failed: {e}")
        return False

def update_main(file_path: Path, new_main: str) -> bool:
    """Update main element in file, return True if content was changed."""
    if not file_path.exists():
        logger.error(f"❌ File not found: {file_path}")
        return False

    if not create_backup(file_path, BACKUP_PATH):
        return False

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        logger.error(f"❌ Failed to read file: {e}")
        return False

    pattern = r'<main class="main">.*?</main>'
    if not re.search(pattern, content, flags=re.DOTALL):
        logger.warning('⚠️ No <main class="main"> found in file')
        return False

    updated_content = re.sub(pattern, new_main, content, flags=re.DOTALL)
    
    if updated_content == content:
        logger.info("ℹ️ Content already matches new main, no changes needed")
        return True

    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        logger.info("✅ Updated main element successfully")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to write file: {e}")
        try:
            shutil.copy2(BACKUP_PATH, file_path)
            logger.info("✅ Restored from backup")
        except:
            logger.error("❌ Failed to restore backup")
        return False

if __name__ == "__main__":
    success = update_main(FILE_PATH, NEW_MAIN)
    exit(0 if success else 1)
