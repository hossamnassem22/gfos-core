#!/bin/bash
python3 -c "
import re
path = 'src/interfaces/http/server.ts'
with open(path, 'r') as f: content = f.read()

pattern = r'async function viewDebt\(id\) \{.*?\n\}'
new_block = \"\"\"async function viewDebt(id) {
  const data = await api('/debts/'+id);
  if (!data) return;
  const d = data.debt;
  const paid = data.schedule.filter(s=>s.status==='PAID').length;
  const pending = data.schedule.filter(s=>s.status==='PENDING').length;
  const overdue = data.schedule.filter(s=>s.status==='OVERDUE').length;

  const statusBadge = (st) => st==='PAID' ? '<span class=\"badge badge-success\">مدفوع</span>'
    : st==='OVERDUE' ? '<span class=\"badge badge-danger\">متأخر</span>'
    : '<span class=\"badge badge-warning\">معلق</span>';

  const rows = data.schedule.map(s => '<tr>' +
    '<td>'+s.installment_number+'</td>' +
    '<td>'+fmtDate(s.due_date)+'</td>' +
    '<td>'+fmt(s.total_payment_cents)+'</td>' +
    '<td>'+statusBadge(s.status)+'</td>' +
    '</tr>').join('');

  document.getElementById('modal-cust-name').textContent = 'تفاصيل الدين — ' + fmt(d.principal_cents);
  document.getElementById('modal-body').innerHTML =
    '<div class=\"kpi-g	rid\" style=\"grid-template-columns:repeat(4,1fr);margin-bottom:16px\">' +
      '<div class=\"kpi-card\"><div class=\"kpi-label\">المبلغ</div><div class=\"kpi-value\">'+fmt(d.principal_cents)+'</div></div>' +
      '<div class=\"kpi-card success\"><div class=\"kpi-label\">مدفوع</div><div class=\"kpi-value\">'+paid+'</div></div>' +
      '<div class=\"kpi-card warning\"><div class=\"kpi-label\">معلق</div><div class=\"kpi-value\">'+pending+'</div></div>' +
      '<div class=\"kpi-card danger\"><div class=\"kpi-label\">متأخر</div><div class=\"kpi-value\">'+overdue+'</div></div>' +
    '</div>' +
    '<h4 style=\"margin-bottom:8px;font-size:14px\">جدول الأقساط</h4>' +
    '<div class=\"tbl-wrap\"><table><thead><tr><th>#</th><th>تاريخ الاستحقاق</th><th>القسط</th><th>الحالة</th></tr></thead><tbody>' +
    rows + '</tbody></table></div>';
  document.getElementById('cust-modal').style.display = 'block';
}\"\"\"

content = re.sub(pattern, new_block, content, flags=re.DOTALL)
with open(path, 'w') as f: f.write(content)
print('تم التحديث بنجاح
