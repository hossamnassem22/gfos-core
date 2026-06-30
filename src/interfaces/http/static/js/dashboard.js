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
  const d = data.debt;
  const paid = data.schedule.filter(s=>s.status==='PAID').length;
  const pending = data.schedule.filter(s=>s.status==='PENDING').length;
  const overdue = data.schedule.filter(s=>s.status==='OVERDUE').length;

  const statusBadge = (st) => st==='PAID' ? '<span class="badge badge-success">مدفوع</span>'
    : st==='OVERDUE' ? '<span class="badge badge-danger">متأخر</span>'
    : '<span class="badge badge-warning">معلق</span>';

  const rows = data.schedule.map(s => '<tr>' +
    '<td>'+s.installment_number+'</td>' +
    '<td>'+fmtDate(s.due_date)+'</td>' +
    '<td>'+fmt(s.total_payment_cents)+'</td>' +
    '<td>'+statusBadge(s.status)+'</td>' +
    '</tr>').join('');

  document.getElementById('modal-cust-name').textContent = 'تفاصيل الدين — ' + fmt(d.principal_cents);
  document.getElementById('modal-body').innerHTML =
    '<div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">' +
      '<div class="kpi-card"><div class="kpi-label">المبلغ</div><div class="kpi-value">'+fmt(d.principal_cents)+'</div></div>' +
      '<div class="kpi-card success"><div class="kpi-label">مدفوع</div><div class="kpi-value">'+paid+'</div></div>' +
      '<div class="kpi-card warning"><div class="kpi-label">معلق</div><div class="kpi-value">'+pending+'</div></div>' +
      '<div class="kpi-card danger"><div class="kpi-label">متأخر</div><div class="kpi-value">'+overdue+'</div></div>' +
    '</div>' +
    '<h4 style="margin-bottom:8px;font-size:14px">جدول الأقساط</h4>' +
    '<div class="tbl-wrap"><table><thead><tr><th>#</th><th>تاريخ الاستحقاق</th><th>القسط</th><th>الحالة</th></tr></thead><tbody>' +
    rows + '</tbody></table></div>';
  document.getElementById('cust-modal').style.display = 'block';
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
