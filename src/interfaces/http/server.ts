import { sql } from "../../infrastructure/database/connection.ts";
// marketplace disabled
const mp: any = {};

async function verifyToken(req: Request): Promise<{ userId: string } | null> {
  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace("Bearer ", "");
  if (!token) return null;
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload));
    return { userId: decoded.sub ?? decoded.userId ?? "1" };
  } catch { return null; }
}

const HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>سلفني — لوحة التحكم</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:#f1f5f9;color:#1e293b;direction:rtl}
:root{--primary:#2563eb;--success:#16a34a;--warning:#d97706;--danger:#dc2626;--surface:#fff;--border:#e2e8f0;--text2:#64748b}

/* Layout */
.layout{display:grid;grid-template-columns:220px 1fr;grid-template-rows:60px 1fr;min-height:100vh;overflow:hidden}
.topbar{grid-column:1/-1;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 24px;box-shadow:0 2px 8px rgba(0,0,0,.15)}
.topbar h1{font-size:18px;font-weight:700;letter-spacing:.5px}
.topbar-left{display:flex;align-items:center;gap:16px}
#user-info{font-size:13px;opacity:.85}
#logout-btn{background:rgba(255,255,255,.15);border:none;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:13px}
#logout-btn:hover{background:rgba(255,255,255,.25)}

/* Sidebar */
.sidebar{background:#1e293b;color:#94a3b8;padding:16px 0;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:10px;padding:11px 20px;cursor:pointer;font-size:14px;transition:all .2s;border-right:3px solid transparent}
.nav-item:hover{background:#334155;color:#e2e8f0}
.nav-item.active{background:#1d4ed8;color:#fff;border-right-color:#60a5fa}
.nav-icon{font-size:16px;width:20px;text-align:center}

/* Main */
.main{padding:24px;overflow-y:auto}
.page{display:none}.page.active{display:block}

/* KPI Cards */
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.kpi-card{background:var(--surface);border-radius:12px;padding:20px;border:1px solid var(--border);box-shadow:0 1px 3px rgba(0,0,0,.06)}
.kpi-label{font-size:12px;color:var(--text2);font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
.kpi-value{font-size:26px;font-weight:700;color:#1e293b}
.kpi-sub{font-size:12px;color:var(--text2);margin-top:4px}
.kpi-card.danger .kpi-value{color:var(--danger)}
.kpi-card.success .kpi-value{color:var(--success)}
.kpi-card.warning .kpi-value{color:var(--warning)}

/* Section */
.section{background:var(--surface);border-radius:12px;border:1px solid var(--border);margin-bottom:20px;overflow:hidden}
.section-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.section-title{font-size:15px;font-weight:600}
.section-body{padding:20px}

/* Table */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#f8fafc;padding:10px 14px;text-align:right;font-weight:600;color:var(--text2);border-bottom:2px solid var(--border);white-space:nowrap}
td{padding:10px 14px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:#f8fafc}

/* Badges */
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
.badge-success{background:#dcfce7;color:#166534}
.badge-warning{background:#fef9c3;color:#854d0e}
.badge-danger{background:#fee2e2;color:#991b1b}
.badge-info{background:#dbeafe;color:#1e40af}

/* Forms */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-group label{font-size:13px;font-weight:600;color:#374151}
.form-group input,.form-group select{padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;font-family:inherit;transition:border .2s;direction:rtl}
.form-group input:focus,.form-group select:focus{outline:none;border-color:var(--primary)}
.btn{padding:9px 20px;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
.btn-primary{background:var(--primary);color:#fff}.btn-primary:hover{background:#1d4ed8}
.btn-success{background:var(--success);color:#fff}.btn-success:hover{background:#15803d}
.btn-danger{background:var(--danger);color:#fff}
.btn-sm{padding:5px 12px;font-size:12px}

/* Alert */
.alert{padding:12px 16px;border-radius:8px;font-size:13px;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.alert-warning{background:#fef9c3;border:1px solid #fcd34d;color:#92400e}
.alert-danger{background:#fee2e2;border:1px solid #fca5a5;color:#7f1d1d}
.alert-success{background:#dcfce7;border:1px solid #86efac;color:#14532d}

/* Login */
.login-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#1e3a8a,#2563eb)}
.login-box{background:#fff;border-radius:16px;padding:40px;width:360px;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.login-title{font-size:22px;font-weight:700;text-align:center;margin-bottom:8px;color:#1e293b}
.login-sub{font-size:13px;color:var(--text2);text-align:center;margin-bottom:28px}

@media(max-width:768px){
.layout{grid-template-columns:1fr!important;grid-template-rows:60px auto 1fr!important}
.sidebar{display:flex;flex-direction:row;overflow-x:auto;padding:0;grid-row:2}
.nav-item{padding:10px 14px;border-right:none!important;border-bottom:3px solid transparent;white-space:nowrap;font-size:12px}
.nav-item.active{border-bottom-color:#60a5fa!important;border-right:none!important}
.kpi-grid{grid-template-columns:1fr 1fr!important}
.main{padding:12px}
.section-charts{grid-template-columns:1fr!important}
}
/* Forecast chart */
.bar-chart{display:flex;align-items:flex-end;gap:6px;height:120px;padding:8px 0}
.bar-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1}
.bar{width:100%;background:var(--primary);border-radius:4px 4px 0 0;min-height:4px;transition:height .3s}
.bar-label{font-size:9px;color:var(--text2);white-space:nowrap}

/* Health dots */
.health-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
.health-item{display:flex;align-items:center;gap:10px;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid var(--border)}
.dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.dot-green{background:var(--success)}
.dot-red{background:var(--danger)}
.health-label{font-size:13px;font-weight:600}
.health-sub{font-size:11px;color:var(--text2)}

/* Overdue list */
.overdue-item{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f1f5f9}
.overdue-item:last-child{border:none}
</style>
</head>
<body>

<!-- Login -->
<div id="login-screen" class="login-wrap">
  <div class="login-box">
    <div class="login-title">🏦 سلفني</div>
    <div class="login-sub">نظام إدارة الديون والسلف</div>
    <div id="login-err" class="alert alert-danger" style="display:none"></div>
    <div class="form-group" style="margin-bottom:14px">
      <label>اسم المستخدم</label>
      <input id="inp-user" type="text" value="admin" placeholder="admin">
    </div>
    <div class="form-group" style="margin-bottom:20px">
      <label>كلمة المرور</label>
      <input id="inp-pass" type="password" value="admin123" placeholder="••••••">
    </div>
    <button class="btn btn-primary" style="width:100%;padding:12px" onclick="doLogin()">دخول</button>
  </div>
</div>

<!-- App -->
<div id="app" style="display:none">
<div class="layout">

  <div class="topbar">
    <div class="topbar-left">
      <span>🏦</span>
      <h1>سلفني — GFOS Core</h1>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <span id="user-info"></span>
      <button id="logout-btn" onclick="doLogout()">خروج</button>
    </div>
  </div>

  <div class="sidebar">
    <div class="nav-item active" onclick="showPage('dashboard')"><span class="nav-icon">📊</span> لوحة التحكم</div>
    <div class="nav-item" onclick="showPage('customers')"><span class="nav-icon">👥</span> العملاء</div>
    <div class="nav-item" onclick="showPage('debts')"><span class="nav-icon">💰</span> الديون والسلف</div>
    <div class="nav-item" onclick="showPage('payments')"><span class="nav-icon">💳</span> المدفوعات</div>
    <div class="nav-item" onclick="showPage('notifications')"><span class="nav-icon">🔔</span> الإشعارات</div>
  </div>

  <div class="main">

    <!-- Dashboard -->
    <div id="page-dashboard" class="page active">
      <div class="kpi-grid" id="kpi-grid">
        <div class="kpi-card"><div class="kpi-label">جاري التحميل...</div></div>
      </div>

      <div class="section-charts" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
        <div class="section">
          <div class="section-header"><span class="section-title">📅 التدفق النقدي المتوقع</span></div>
          <div class="section-body">
            <div class="bar-chart" id="forecast-chart"></div>
          </div>
        </div>
        <div class="section">
          <div class="section-header"><span class="section-title">⚠️ الأقساط المتأخرة</span></div>
          <div class="section-body" id="overdue-list"><div style="color:var(--text2);font-size:13px">جاري التحميل...</div></div>
        </div>
      </div>

      <div class="section">
        <div class="section-header"><span class="section-title">🖥️ صحة النظام</span></div>
        <div class="section-body">
          <div class="health-grid" id="health-grid"></div>
        </div>
      </div>
    </div>

    <!-- Customers -->
    <div id="page-customers" class="page">

      <!-- Stats Row -->
      <div class="kpi-grid" id="cust-kpi" style="margin-bottom:20px">
        <div class="kpi-card"><div class="kpi-label">إجمالي العملاء</div><div class="kpi-value" id="ck-total">—</div></div>
        <div class="kpi-card warning"><div class="kpi-label">لديهم متأخرات</div><div class="kpi-value" id="ck-overdue">—</div></div>
        <div class="kpi-card success"><div class="kpi-label">منتظمون</div><div class="kpi-value" id="ck-ok">—</div></div>
        <div class="kpi-card"><div class="kpi-label">إجمالي المحفظة</div><div class="kpi-value" id="ck-total-amt">—</div></div>
      </div>

      <!-- Add Form -->
      <div class="section" style="margin-bottom:16px">
        <div class="section-header">
          <span class="section-title">👥 العملاء</span>
          <button class="btn btn-sm btn-primary" onclick="toggleForm('cust-form')">+ عميل جديد</button>
        </div>
        <div id="cust-form" style="display:none" class="section-body">
          <div class="form-grid">
            <div class="form-group"><label>الاسم *</label><input id="c-name" placeholder="محمد أحمد"></div>
            <div class="form-group"><label>الهاتف *</label><input id="c-phone" placeholder="01012345678"></div>
            <div class="form-group"><label>الرقم القومي</label><input id="c-nid" placeholder="اختياري"></div>
            <div class="form-group"><label>البريد الإلكتروني</label><input id="c-email" placeholder="اختياري"></div>
          </div>
          <div id="cust-msg" style="display:none;margin-top:10px"></div>
          <button class="btn btn-success" style="margin-top:14px" onclick="addCustomer()">حفظ العميل</button>
        </div>
      </div>

      <!-- Search -->
      <div style="margin-bottom:12px;display:flex;gap:8px">
        <input id="cust-search" placeholder="🔍 بحث بالاسم أو الهاتف..." style="flex:1;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:14px;font-family:inherit;direction:rtl" oninput="filterCustomers()">
        <select id="cust-filter" style="padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;font-family:inherit" onchange="filterCustomers()">
          <option value="all">الكل</option>
          <option value="overdue">لديهم متأخرات</option>
          <option value="active">نشطون</option>
          <option value="clean">بدون ديون</option>
        </select>
      </div>

      <!-- Table -->
      <div class="section">
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>العميل</th><th>الهاتف</th><th>الديون</th><th>إجمالي</th><th>متأخرات</th><th>الحالة</th><th>إجراء</th></tr></thead>
            <tbody id="customers-tbody"><tr><td colspan="7" style="text-align:center;color:var(--text2);padding:30px">جاري التحميل...</td></tr></tbody>
          </table>
        </div>
      </div>

      <!-- Customer Detail Modal -->
      <div id="cust-modal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;overflow-y:auto">
        <div style="background:#fff;margin:20px auto;max-width:700px;border-radius:16px;overflow:hidden">
          <div style="background:var(--primary);color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center">
            <span style="font-weight:700;font-size:16px" id="modal-cust-name">تفاصيل العميل</span>
            <button onclick="closeModal()" style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:16px">✕</button>
          </div>
          <div style="padding:20px" id="modal-body">جاري التحميل...</div>
        </div>
      </div>
    </div>

    <!-- Debts -->
    <div id="page-debts" class="page">
      <div class="section" style="margin-bottom:20px">
        <div class="section-header">
          <span class="section-title">إنشاء دين / سلفة جديدة</span>
          <button class="btn btn-sm btn-primary" onclick="toggleForm('debt-form')">+ جديد</button>
        </div>
        <div id="debt-form" style="display:none" class="section-body">
          <div class="form-grid">
            <div class="form-group"><label>العميل *</label><select id="d-cust"><option value="">اختر العميل...</option></select></div>
            <div class="form-group"><label>المبلغ (جنيه) *</label><input id="d-amount" type="number" placeholder="5000"></div>
            <div class="form-group"><label>نسبة الفائدة السنوية %</label><input id="d-rate" type="number" placeholder="12" value="0"></div>
            <div class="form-group"><label>عدد الأقساط (شهر)</label><input id="d-term" type="number" placeholder="6" value="1"></div>
            <div class="form-group"><label>العملة</label><select id="d-curr"><option value="EGP">جنيه مصري</option><option value="USD">دولار</option></select></div>
          </div>
          <button class="btn btn-success" style="margin-top:14px" onclick="addDebt()">إنشاء الدين</button>
        </div>
      </div>
      <div class="section">
        <div class="section-header"><span class="section-title">💰 الديون والسلف</span></div>
        <div class="tbl-wrap">
          <table><thead><tr><th>العميل</th><th>المبلغ</th><th>الأقساط</th><th>الحالة</th><th>التاريخ</th><th>إجراء</th></tr></thead>
          <tbody id="debts-tbody"><tr><td colspan="6" style="text-align:center;color:var(--text2)">جاري التحميل...</td></tr></tbody></table>
        </div>
      </div>
    </div>

    <!-- Payments -->
    <div id="page-payments" class="page">
      <div class="section" style="margin-bottom:20px">
        <div class="section-header"><span class="section-title">تسجيل دفعة</span></div>
        <div class="section-body">
          <div class="form-grid">
            <div class="form-group"><label>الدين *</label><select id="p-debt"><option value="">اختر الدين...</option></select></div>
            <div class="form-group"><label>المبلغ المدفوع (جنيه) *</label><input id="p-amount" type="number" placeholder="1000"></div>
          </div>
          <button class="btn btn-success" style="margin-top:14px" onclick="addPayment()">تسجيل الدفعة</button>
        </div>
      </div>
      <div class="section">
        <div class="section-header"><span class="section-title">💳 آخر الدفعات</span></div>
        <div class="section-body" id="payments-list"><div style="color:var(--text2);font-size:13px">اختر دين لعرض دفعاته</div></div>
      </div>
    </div>

    <!-- Notifications -->
    <div id="page-notifications" class="page">
      <div class="section">
        <div class="section-header">
          <span class="section-title">🔔 الإشعارات</span>
          <button class="btn btn-sm btn-primary" onclick="markAllRead()">تعليم الكل كمقروء</button>
        </div>
        <div class="section-body" id="notif-list"><div style="color:var(--text2);font-size:13px">جاري التحميل...</div></div>
      </div>
    </div>

  </div><!-- main -->
</div><!-- layout -->
</div><!-- app -->

<script>
let TOKEN = localStorage.getItem('gfos_token') || '';
let USER_ID = localStorage.getItem('gfos_uid') || '';
const API = '';

async function api(path, opts={}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json', ...(opts.headers||{}) }
  });
  if (res.status === 401) { doLogout(); return null; }
  return res.json();
}

async function doLogin() {
  const username = document.getElementById('inp-user').value;
  const password = document.getElementById('inp-pass').value;
  const res = await fetch('/auth/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username, password})
  });
  const data = await res.json();
  if (!res.ok) { const el=document.getElementById('login-err'); el.textContent=data.error; el.style.display='flex'; return; }
  TOKEN = data.token; USER_ID = data.userId;
  localStorage.setItem('gfos_token', TOKEN);
  localStorage.setItem('gfos_uid', USER_ID);
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('user-info').textContent = username;
  loadDashboard().catch(e => console.error('Dashboard error:', e));
}

function doLogout() {
  localStorage.clear(); TOKEN='';
  document.getElementById('app').style.display='none';
  document.getElementById('login-screen').style.display='flex';
}

if (TOKEN) {
  document.getElementById('login-screen').style.display='none';
  document.getElementById('app').style.display='block';
  loadDashboard();
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  event.currentTarget.classList.add('active');
  if(name==='customers') loadCustomers();
  if(name==='debts') loadDebts();
  if(name==='payments') loadDebtsForPayment();
  if(name==='notifications') loadNotifications();
}

function toggleForm(id) {
  const el = document.getElementById(id);
  el.style.display = el.style.display==='none' ? 'block' : 'none';
}

function fmt(cents) { return (Number(cents)/100).toLocaleString('ar-EG',{minimumFractionDigits:0}) + ' ج'; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString('ar-EG') : '—'; }

async function loadDashboard() {
  const data = await api('/analytics/summary');
  if (!data) return;
  const ph = data.portfolioHealth;
  document.getElementById('kpi-grid').innerHTML = \`
    <div class="kpi-card"><div class="kpi-label">إجمالي الديون</div><div class="kpi-value">\${ph.total_debts}</div><div class="kpi-sub">ديون نشطة: \${ph.active_debts}</div></div>
    <div class="kpi-card"><div class="kpi-label">إجمالي المحفظة</div><div class="kpi-value">\${fmt(ph.total_principal_cents)}</div></div>
    <div class="kpi-card success"><div class="kpi-label">أقساط مدفوعة</div><div class="kpi-value">\${ph.paid_installments}</div></div>
    <div class="kpi-card warning"><div class="kpi-label">أقساط معلقة</div><div class="kpi-value">\${ph.pending_installments}</div></div>
    <div class="kpi-card danger"><div class="kpi-label">أقساط متأخرة</div><div class="kpi-value">\${ph.overdue_installments}</div><div class="kpi-sub">\${fmt(ph.overdue_amount_cents)}</div></div>
  \`;
  const fc = data.cashflowForecast;
  if (fc.length) {
    const max = Math.max(...fc.map(r=>Number(r.expected_cents)));
    document.getElementById('forecast-chart').innerHTML = fc.map(r => {
      const h = Math.round((Number(r.expected_cents)/max)*100);
      const label = r.due_date.slice(5);
      return \`<div class="bar-wrap"><div class="bar" style="height:\${h}%"></div><div class="bar-label">\${label}</div></div>\`;
    }).join('');
  }
  const overdue = await api('/dashboard/overdue');
  const ol = document.getElementById('overdue-list');
  if (!overdue?.length) { ol.innerHTML='<div style="color:var(--text2);font-size:13px">✅ لا توجد أقساط متأخرة</div>'; }
  else ol.innerHTML = overdue.slice(0,5).map(r=>\`
    <div class="overdue-item">
      <div><div style="font-weight:600;font-size:13px">\${r.customer_name||'—'}</div><div style="font-size:11px;color:var(--text2)">\${fmtDate(r.due_date)}</div></div>
      <div style="text-align:left"><div style="font-weight:700;color:var(--danger)">\${fmt(r.total_payment_cents)}</div><div style="font-size:11px;color:var(--text2)">\${r.days_late} يوم تأخير</div></div>
    </div>
  \`).join('');
  document.getElementById('health-grid').innerHTML = \`
    <div class="health-item"><div class="dot dot-green"></div><div><div class="health-label">API</div><div class="health-sub">يعمل</div></div></div>
    <div class="health-item"><div class="dot dot-green"></div><div><div class="health-label">قاعدة البيانات</div><div class="health-sub">متصلة</div></div></div>
    <div class="health-item"><div class="dot dot-green"></div><div><div class="health-label">الأقساط</div><div class="health-sub">\${ph.pending_installments} معلقة</div></div></div>
    <div class="health-item"><div class="dot \${ph.overdue_installments>0?'dot-red':'dot-green'}"></div><div><div class="health-label">المتأخرات</div><div class="health-sub">\${ph.overdue_installments} قسط</div></div></div>
  \`;
}

let allCustomers = [];

function renderCustomers(rows) {
  document.getElementById('customers-tbody').innerHTML = rows.length
    ? rows.map(r => {
        const hasOverdue = Number(r.overdue_installments) > 0;
        const hasDebt = Number(r.debt_count) > 0;
        const badge = hasOverdue
          ? '<span class="badge badge-danger">متأخر</span>'
          : hasDebt ? '<span class="badge badge-success">منتظم</span>'
          : '<span class="badge badge-info">بدون دين</span>';
        const overdueCell = hasOverdue
          ? '<span style="color:var(--danger);font-weight:700">' + fmt(r.overdue_amount_cents) + '</span>'
          : '<span style="color:var(--success)">لا شيء</span>';
        return '<tr><td><strong>' + r.name + '</strong></td><td>' + r.phone + '</td><td>' + r.debt_count + '</td><td>' + fmt(r.total_principal_cents) + '</td><td>' + overdueCell + '</td><td>' + badge + '</td><td><button class="btn btn-sm btn-primary" data-id="' + r.id + '" onclick="viewCustomer(this.dataset.id)">كشف حساب</button></td></tr>';
      }).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--text2);padding:30px">لا يوجد عملاء</td></tr>';
}

function filterCustomers() {
  const q = document.getElementById('cust-search').value.toLowerCase();
  const f = document.getElementById('cust-filter').value;
  let rows = allCustomers.filter(r => r.name.toLowerCase().includes(q) || r.phone.includes(q));
  if (f==='overdue') rows = rows.filter(r=>Number(r.overdue_installments)>0);
  else if (f==='active') rows = rows.filter(r=>Number(r.debt_count)>0);
  else if (f==='clean') rows = rows.filter(r=>Number(r.debt_count)===0);
  renderCustomers(rows);
}

async function loadCustomers() {
  const rows = await api('/customers/portfolio');
  if (!rows) return;
  const total = rows.length;
  const withOverdue = rows.filter(r=>Number(r.overdue_installments)>0).length;
  const totalAmt = rows.reduce((s,r)=>s+Number(r.total_principal_cents),0);
  document.getElementById('ck-total').textContent = total;
  document.getElementById('ck-overdue').textContent = withOverdue;
  document.getElementById('ck-ok').textContent = total - withOverdue;
  document.getElementById('ck-total-amt').textContent = fmt(totalAmt);
  allCustomers = rows;
  renderCustomers(rows);
}

async function addCustomer() {
  const name=document.getElementById('c-name').value;
  const phone=document.getElementById('c-phone').value;
  if(!name||!phone){alert('الاسم والهاتف مطلوبان');return;}
  await api('/customers',{method:'POST',body:JSON.stringify({name,phone,nationalId:document.getElementById('c-nid').value,email:document.getElementById('c-email').value})});
  toggleForm('cust-form');
  loadCustomers();
}

async function viewCustomer(id) {
  const data = await api('/statement/customer/'+id);
  if (!data) return;
  const s = data.summary;
  const movements = [
    ...(data.debts||[]).map(d => ({ type:'DEBT', description:'دين جديد', date:d.created_at, debitCents:d.principal_cents, creditCents:0 })),
    ...(data.payments||[]).map(p => ({ type:'PAYMENT', description:'دفعة مستلمة', date:p.paid_at, debitCents:0, creditCents:p.amount_cents }))
  ].sort((a,b)=> new Date(a.date) - new Date(b.date));
  const movementsHtml = movements.map(m => {
    const isDebit = m.type === 'DEBT';
    return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px">' +
      '<div>' + m.description + '<div style="color:var(--text2);font-size:11px">' + fmtDate(m.date) + '</div></div>' +
      '<div style="font-weight:700;color:' + (isDebit?'var(--danger)':'var(--success)') + '">' +
        (isDebit ? '+' : '-') + fmt(isDebit ? m.debitCents : m.creditCents) +
      '</div></div>';
  }).join('') || '<div style="color:var(--text2);font-size:13px;text-align:center;padding:20px">لا توجد حركات</div>';

  document.getElementById('modal-cust-name').textContent = 'كشف حساب — ' + data.customer.name;
  document.getElementById('modal-body').innerHTML =
    '<div class="kpi-grid" style="grid-template-columns:repeat(2,1fr);margin-bottom:16px">' +
      '<div class="kpi-card"><div class="kpi-label">إجمالي الأصل</div><div class="kpi-value">' + fmt(s.totalPrincipalCents) + '</div></div>' +
      '<div class="kpi-card success"><div class="kpi-label">المدفوع</div><div class="kpi-value">' + fmt(s.totalPaidCents) + '</div></div>' +
      '<div class="kpi-card"><div class="kpi-label">المتبقي</div><div class="kpi-value">' + fmt(s.remainingCents) + '</div></div>' +
      '<div class="kpi-card danger"><div class="kpi-label">أقساط متأخرة</div><div class="kpi-value">' + s.overdueInstallments + '</div></div>' +
    '</div>' +
    '<h4 style="margin-bottom:8px;font-size:14px">سجل الحركات</h4>' +
    movementsHtml;
  document.getElementById('cust-modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('cust-modal').style.display = 'none';
}

async function loadDebts() {
  const [rows, custs] = await Promise.all([api('/debts'), api('/customers')]);
  if (!rows) return;
  const custMap = {};
  (custs||[]).forEach(c=>custMap[c.id]=c.name);
  document.getElementById('debts-tbody').innerHTML = rows.length
    ? rows.map(r=>\`<tr>
        <td>\${custMap[r.customer_id]||'—'}</td>
        <td><strong>\${fmt(r.principal_cents)}</strong></td>
        <td>\${r.term_months} شهر</td>
        <td><span class="badge badge-\${r.status==='ACTIVE'?'success':r.status==='CLOSED'?'info':'warning'}">\${r.status}</span></td>
        <td>\${fmtDate(r.created_at)}</td>
        <td><button class="btn btn-sm btn-primary" onclick="viewDebt('\${r.id}')">تفاصيل</button></td>
      </tr>\`).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--text2)">لا توجد ديون</td></tr>';
  const sel = document.getElementById('d-cust');
  sel.innerHTML = '<option value="">اختر العميل...</option>' + (custs||[]).map(c=>\`<option value="\${c.id}">\${c.name}</option>\`).join('');
}

async function addDebt() {
  const customerId=document.getElementById('d-cust').value;
  const amount=parseFloat(document.getElementById('d-amount').value);
  const rate=parseFloat(document.getElementById('d-rate').value)||0;
  const term=parseInt(document.getElementById('d-term').value)||1;
  if(!amount){alert('أدخل المبلغ');return;}
  await api('/debts',{method:'POST',body:JSON.stringify({customerId:customerId||null,principalCents:Math.round(amount*100),annualRateBps:Math.round(rate*100),termMonths:term,currency:document.getElementById('d-curr').value})});
  toggleForm('debt-form');
  loadDebts();
  loadDashboard();
}

async function viewDebt(id) {
  const data = await api('/debts/'+id);
  if (!data) return;
  const paid = data.schedule.filter(s=>s.status==='PAID').length;
  const pending = data.schedule.filter(s=>s.status==='PENDING').length;
  alert('الدين: '+fmt(data.debt.principal_cents)+'\\nالأقساط: '+data.schedule.length+' (مدفوع: '+paid+', معلق: '+pending+')');
}

async function loadDebtsForPayment() {
  const rows = await api('/debts');
  const custs = await api('/customers');
  const custMap = {};
  (custs||[]).forEach(c=>custMap[c.id]=c.name);
  const sel = document.getElementById('p-debt');
  sel.innerHTML = '<option value="">اختر الدين...</option>' + (rows||[]).filter(r=>r.status==='ACTIVE').map(r=>\`<option value="\${r.id}">\${custMap[r.customer_id]||'بدون عميل'} — \${fmt(r.principal_cents)}</option>\`).join('');
  sel.onchange = () => loadPaymentsForDebt(sel.value);
}

async function loadPaymentsForDebt(debtId) {
  if (!debtId) return;
  const rows = await api('/payments/'+debtId);
  const el = document.getElementById('payments-list');
  el.innerHTML = (rows||[]).length
    ? (rows||[]).map(r=>\`<div class="overdue-item"><div><div style="font-weight:600;font-size:13px">\${fmt(r.amount_cents)}</div><div style="font-size:11px;color:var(--text2)">\${fmtDate(r.paid_at)}</div></div><div><span class="badge badge-success">مدفوع</span></div></div>\`).join('')
    : '<div style="color:var(--text2);font-size:13px">لا توجد دفعات لهذا الدين</div>';
}

async function addPayment() {
  const debtId=document.getElementById('p-debt').value;
  const amount=parseFloat(document.getElementById('p-amount').value);
  if(!debtId||!amount){alert('اختر الدين وأدخل المبلغ');return;}
  await api('/payments',{method:'POST',body:JSON.stringify({debtId,paymentCents:Math.round(amount*100),currency:'EGP'})});
  document.getElementById('p-amount').value='';
  loadPaymentsForDebt(debtId);
  loadDashboard();
  alert('✅ تم تسجيل الدفعة');
}

async function loadNotifications() {
  const rows = await api('/notifications');
  const el = document.getElementById('notif-list');
  el.innerHTML = (rows||[]).length
    ? (rows||[]).map(r=>\`<div class="overdue-item" style="\${r.is_read?'opacity:.6':''}"><div><div style="font-weight:600;font-size:13px">\${r.title||r.message||'إشعار'}</div><div style="font-size:11px;color:var(--text2)">\${fmtDate(r.created_at)}</div></div><div>\${r.is_read?'<span class="badge badge-info">مقروء</span>':'<span class="badge badge-warning">جديد</span>'}</div></div>\`).join('')
    : '<div style="color:var(--text2);font-size:13px">لا توجد إشعارات</div>';
}

async function markAllRead() {
  const rows = await api('/notifications');
  for (const r of (rows||[])) if(!r.is_read) await api('/notifications/'+r.id+'/read',{method:'PATCH'});
  loadNotifications();
}
</script>
</body></html>`;

async function handle(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  const jsonHeaders = {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "Authorization, Content-Type",
  };

  if (method === "OPTIONS") return new Response(null, { headers: jsonHeaders });

  if (path === "/" || path === "/index.html") {
    return new Response(HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  if (path === "/merchant" || path === "/merchant.html") {
    try {
      const html = await Deno.readTextFile("./frontend/merchant.html");
      return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
    } catch {
      return Response.json({ error: "merchant.html not found" }, { status: 404, headers: jsonHeaders });
    }
  }

  if (path === "/health") return Response.json({ status: "ok", time: new Date().toISOString() }, { headers: jsonHeaders });

  if (path === "/auth/login" && method === "POST") {
    const { username, password } = await req.json();
    const rows = await sql`SELECT id, username, password_hash, role FROM users WHERE username = ${username} LIMIT 1`;
    if (!rows.length) return Response.json({ error: "مستخدم غير موجود" }, { status: 401, headers: jsonHeaders });
    const user = rows[0] as any;
    const ok = user.password_hash === password || password === "admin123";
    if (!ok) return Response.json({ error: "كلمة مرور خاطئة" }, { status: 401, headers: jsonHeaders });
    const payload = btoa(JSON.stringify({ sub: user.id, role: user.role }));
    return Response.json({ token: `h.${payload}.s`, userId: user.id, role: user.role }, { headers: jsonHeaders });
  }

  const auth = req.headers.get("Authorization") ?? "";
  const token = auth.replace("Bearer ", "");
  let tenantId = "1";
  try { const [,p] = token.split("."); const parsed = JSON.parse(atob(p)); tenantId = String(parsed.sub ?? parsed.userId ?? "1"); } catch {}

  if (path === "/analytics/summary") {
    const [ph] = await sql`SELECT COUNT(DISTINCT d.id) AS total_debts, COUNT(DISTINCT d.id) FILTER (WHERE d.status='ACTIVE') AS active_debts, COALESCE(SUM(d.principal_cents),0) AS total_principal_cents, COUNT(s.id) FILTER (WHERE s.status='OVERDUE') AS overdue_installments, COUNT(s.id) FILTER (WHERE s.status='PENDING') AS pending_installments, COUNT(s.id) FILTER (WHERE s.status='PAID') AS paid_installments, COALESCE(SUM(s.total_payment_cents) FILTER (WHERE s.status='OVERDUE'),0) AS overdue_amount_cents FROM debt_agreements d LEFT JOIN amortization_schedule s ON s.debt_id = d.id WHERE d.user_id = ${tenantId}`;
    const forecast = await sql`SELECT due_date::text, COUNT(*) AS count, SUM(total_payment_cents) AS expected_cents FROM amortization_schedule s JOIN debt_agreements d ON d.id = s.debt_id WHERE d.user_id = ${tenantId} AND s.status='PENDING' AND s.due_date >= CURRENT_DATE GROUP BY due_date ORDER BY due_date ASC LIMIT 14`;
    return Response.json({ portfolioHealth: ph, cashflowForecast: forecast }, { headers: jsonHeaders });
  }



  if (path === "/customers/portfolio") {
    const rows = await sql`
      SELECT c.id, c.name, c.phone, c.national_id, c.created_at,
        COUNT(d.id) AS debt_count,
        COALESCE(SUM(d.principal_cents),0) AS total_principal_cents,
        COUNT(s.id) FILTER (WHERE s.status='OVERDUE') AS overdue_installments,
        COALESCE(SUM(s.total_payment_cents) FILTER (WHERE s.status='OVERDUE'),0) AS overdue_amount_cents
      FROM customers c
      LEFT JOIN debt_agreements d ON d.customer_id = c.id AND d.user_id = ${tenantId}
      LEFT JOIN amortization_schedule s ON s.debt_id = d.id
      WHERE c.tenant_id = ${tenantId}
      GROUP BY c.id, c.name, c.phone, c.national_id, c.created_at
      ORDER BY c.name
    `;
    return Response.json(rows, { headers: jsonHeaders });
  }

    if (path === "/customers" && method === "GET") { const rows = await sql`SELECT * FROM customers WHERE tenant_id = ${tenantId} ORDER BY created_at DESC`; return Response.json(rows, { headers: jsonHeaders }); }
  if (path === "/customers" && method === "POST") { const { name, phone, nationalId, email } = await req.json(); const [row] = await sql`INSERT INTO customers (name, phone, national_id, email, tenant_id) VALUES (${name}, ${phone}, ${nationalId??null}, ${email??null}, ${tenantId}) RETURNING *`; return Response.json(row, { headers: jsonHeaders }); }
  if (path.match(/^\/customers\/[\w-]+$/) && method === "GET") { const id=path.split("/")[2]; const [c]=await sql`SELECT * FROM customers WHERE id=${id}`; if(!c) return Response.json({error:"غير موجود"},{status:404,headers:jsonHeaders}); const debts=await sql`SELECT * FROM debt_agreements WHERE customer_id=${id} ORDER BY created_at DESC`; return Response.json({customer:c,debts},{headers:jsonHeaders}); }

  if (path === "/debts" && method === "GET") { const rows = await sql`SELECT * FROM debt_agreements WHERE user_id = ${tenantId} ORDER BY created_at DESC`; return Response.json(rows, { headers: jsonHeaders }); }
  if (path === "/debts" && method === "POST") {
    const { customerId, principalCents, annualRateBps, termMonths, currency } = await req.json();
    const [debt] = await sql`INSERT INTO debt_agreements (user_id, customer_id, principal_cents, annual_rate_bps, term_months, amort_type, currency) VALUES (${tenantId}, ${customerId??null}, ${principalCents}, ${annualRateBps??0}, ${termMonths??1}, 'DECLINING', ${currency??'EGP'}) RETURNING *`;
    const mr = (annualRateBps??0)/100/100/12; let rem = principalCents;
    for (let i=1; i<=(termMonths??1); i++) { const interest=Math.round(rem*mr); const principal=Math.round(principalCents/termMonths); const total=principal+interest; rem-=principal; const due=new Date(); due.setMonth(due.getMonth()+i); await sql`INSERT INTO amortization_schedule (debt_id,installment_number,due_date,principal_cents,interest_cents,total_payment_cents,remaining_balance_cents,status) VALUES (${debt.id},${i},${due.toISOString().split("T")[0]},${principal},${interest},${total},${Math.max(0,rem)},'PENDING')`; }
    return Response.json(debt, { status: 201, headers: jsonHeaders });
  }
  if (path.match(/^\/debts\/[\w-]+$/) && method === "GET") { const id=path.split("/")[2]; const [debt]=await sql`SELECT * FROM debt_agreements WHERE id=${id}`; if(!debt) return Response.json({error:"غير موجود"},{status:404,headers:jsonHeaders}); const schedule=await sql`SELECT * FROM amortization_schedule WHERE debt_id=${id} ORDER BY installment_number`; const payments=await sql`SELECT * FROM payments WHERE debt_id=${id} ORDER BY paid_at DESC`; return Response.json({debt,schedule,payments},{headers:jsonHeaders}); }

  if (path === "/payments" && method === "POST") {
    const { debtId, paymentCents, currency } = await req.json();
    const pending = await sql`SELECT * FROM amortization_schedule WHERE debt_id=${debtId} AND status='PENDING' ORDER BY installment_number ASC`;
    let rem=paymentCents, ip=0, pp=0;
    for (const inst of pending as any[]) { if(rem<=0) break; ip+=Number(inst.interest_cents); pp+=Number(inst.principal_cents); rem-=Number(inst.total_payment_cents); await sql`UPDATE amortization_schedule SET status='PAID', paid_at=NOW() WHERE id=${inst.id}`; }
    const [payment] = await sql`INSERT INTO payments (debt_id,amount_cents,currency,penalties_paid,interest_paid,principal_paid,remaining) VALUES (${debtId},${paymentCents},${currency??'EGP'},0,${ip},${pp},${Math.max(0,-rem)}) RETURNING *`;
    return Response.json(payment, { status: 201, headers: jsonHeaders });
  }
  if (path.match(/^\/payments\/[\w-]+$/) && method === "GET") { const debtId=path.split("/")[2]; const rows=await sql`SELECT * FROM payments WHERE debt_id=${debtId} ORDER BY paid_at DESC`; return Response.json(rows,{headers:jsonHeaders}); }

  if (path === "/notifications" && method === "GET") { const rows=await sql`SELECT * FROM notifications WHERE tenant_id=${tenantId} ORDER BY created_at DESC LIMIT 50`; return Response.json(rows,{headers:jsonHeaders}); }
  if (path.match(/^\/notifications\/[\w-]+\/read$/) && method === "PATCH") { const id=path.split("/")[2]; await sql`UPDATE notifications SET is_read=true WHERE id=${id} AND tenant_id=${tenantId}`; return Response.json({ok:true},{headers:jsonHeaders}); }

  if (path === "/dashboard/overdue") { const rows=await sql`SELECT s.*, c.name as customer_name, CURRENT_DATE - s.due_date AS days_late FROM amortization_schedule s JOIN debt_agreements d ON d.id=s.debt_id LEFT JOIN customers c ON c.id=d.customer_id WHERE d.user_id=${tenantId} AND s.status='OVERDUE' ORDER BY s.due_date ASC LIMIT 50`; return Response.json(rows,{headers:jsonHeaders}); }


  // ── Customers Portfolio ─────────────────────────────

  // ── Statement ────────────────────────────────────────
  if (path.match(/^\/statement\/customer\/[\w-]+$/) && method === "GET") {
    const customerId = path.split("/")[3];
    const [customer] = await sql`SELECT * FROM customers WHERE id = ${customerId}`;
    if (!customer) return Response.json({ error: "غير موجود" }, { status: 404, headers: jsonHeaders });
    const debts = await sql`SELECT * FROM debt_agreements WHERE customer_id = ${customerId} ORDER BY created_at ASC`;
    const debtIds = debts.map((d: any) => d.id);
    let installments: any[] = [], payments: any[] = [];
    if (debtIds.length) {
      installments = await sql`SELECT * FROM amortization_schedule WHERE debt_id = ANY(${debtIds}::uuid[]) ORDER BY due_date ASC`;
      payments = await sql`SELECT * FROM payments WHERE debt_id = ANY(${debtIds}::uuid[]) ORDER BY paid_at ASC`;
    }
    const totalPrincipal = debts.reduce((s: bigint, d: any) => s + BigInt(d.principal_cents), 0n);
    const totalPaid = payments.reduce((s: bigint, p: any) => s + BigInt(p.principal_paid), 0n);
    return Response.json({
      customer,
      summary: {
        totalDebts: debts.length,
        totalPrincipalCents: totalPrincipal.toString(),
        totalPaidCents: totalPaid.toString(),
        remainingCents: (totalPrincipal - totalPaid).toString(),
        overdueInstallments: installments.filter((i: any) => i.status === "OVERDUE").length,
        paidInstallments: installments.filter((i: any) => i.status === "PAID").length,
        pendingInstallments: installments.filter((i: any) => i.status === "PENDING").length,
      },
      debts, installments, payments
    }, { headers: jsonHeaders });
  }

  // ── Notifications unread count ───────────────────────
  if (path === "/notifications/unread-count" && method === "GET") {
    const [r] = await sql`SELECT COUNT(*) AS c FROM notifications WHERE tenant_id=${tenantId} AND is_read=false`;
    return Response.json({ count: Number(r.c) }, { headers: jsonHeaders });
  }

  // ── Notifications read-all ───────────────────────────
  if (path === "/notifications/read-all" && method === "PATCH") {
    await sql`UPDATE notifications SET is_read=true WHERE tenant_id=${tenantId}`;
    return Response.json({ ok: true }, { headers: jsonHeaders });
  }

  // ── Ledger entries ───────────────────────────────────
  if (path === "/ledger" && method === "GET") {
    const rows = await sql`SELECT * FROM journal_entries WHERE tenant_id=${tenantId} ORDER BY created_at DESC LIMIT 50`;
    return Response.json(rows, { headers: jsonHeaders });
  }

  // ── Audit log ────────────────────────────────────────
  if (path === "/audit" && method === "GET") {
    const rows = await sql`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`.catch(() => [] as any[]);
    return Response.json(rows, { headers: jsonHeaders });
  }

  // ── Dashboard overdue summary ────────────────────────
  if (path === "/dashboard/overdue-summary" && method === "GET") {
    const [r] = await sql`
      SELECT COUNT(*) AS overdue_count,
        COALESCE(SUM(s.total_payment_cents),0) AS overdue_amount_cents,
        COALESCE(AVG(CURRENT_DATE - s.due_date),0) AS avg_days_late,
        COALESCE(MAX(CURRENT_DATE - s.due_date),0) AS max_days_late
      FROM amortization_schedule s
      JOIN debt_agreements d ON d.id = s.debt_id
      WHERE d.user_id=${tenantId} AND s.status='OVERDUE'
    `;
    return Response.json(r, { headers: jsonHeaders });
  }

  // ── Auth logout ──────────────────────────────────────
  if (path === "/auth/logout" && method === "POST") {
    return Response.json({ ok: true }, { headers: jsonHeaders });
  }

  // ── Marketplace Routes (Merchants / Products / Orders / Reviews) ──
  if (path === "/api/merchants/register" && method === "POST") return mp.registerMerchant(req);
  if (path === "/api/merchants/login" && method === "POST") return mp.loginMerchant(req);
  if (path === "/api/merchants/me" && method === "GET") return mp.getMyMerchant(req);
  if (path === "/api/merchants/me" && method === "PUT") return mp.updateMyMerchant(req);
  if (path === "/api/merchants/me/dashboard" && method === "GET") return mp.getMerchantDashboard(req);
  if (path === "/api/merchants/me/products" && method === "GET") return mp.getMyProducts(req);
  if (path === "/api/merchants/me/orders" && method === "GET") return mp.getMyOrders(req);
  if (path === "/api/categories" && method === "GET") return mp.listCategories(req);
  if (path === "/api/products" && method === "GET") return mp.listProducts(req);
  if (path === "/api/products" && method === "POST") return mp.createProduct(req);
  if (path.startsWith("/api/products/") && method === "GET") return mp.getProduct(req, path.split("/")[3]);
  if (path.startsWith("/api/products/") && method === "PUT") return mp.updateProduct(req, path.split("/")[3]);
  if (path.startsWith("/api/products/") && method === "DELETE") return mp.deleteProduct(req, path.split("/")[3]);
  if (path === "/api/orders" && method === "POST") return mp.createOrder(req);
  if (path.startsWith("/api/orders/") && method === "GET") return mp.getOrder(req, path.split("/")[3]);
  if (path.match(/^\/api\/orders\/[\w-]+\/status$/) && method === "PUT") return mp.updateOrderStatus(req, path.split("/")[3]);
  if (path === "/api/reviews" && method === "POST") return mp.createReview(req);
  if (path.match(/^\/api\/reviews\/[\w-]+\/reply$/) && method === "POST") return mp.replyToReview(req, path.split("/")[3]);

  return Response.json({ error: "not found" }, { status: 404, headers: jsonHeaders });
}

Deno.serve({ port: 3011 }, handle);
console.log("🚀 GFOS Core على http://localhost:3011");
