export const renderLayout = (content: string) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;600;900&display=swap'); body { font-family: 'Cairo', sans-serif; }</style>
</head>
<body class="bg-slate-50 flex">
  <aside class="w-64 bg-slate-900 min-h-screen text-white p-6">
    <h2 class="text-xl font-black mb-10 text-blue-400">GFOS Enterprise</h2>
    <nav class="space-y-2">
      <a href="#" class="block p-3 bg-blue-600 rounded-xl font-bold">📊 لوحة القيادة</a>
      <a href="#" class="block p-3 hover:bg-slate-800 rounded-xl transition">👥 العملاء</a>
      <a href="#" class="block p-3 hover:bg-slate-800 rounded-xl transition">💰 المالية</a>
    </nav>
  </aside>
  <main class="flex-1 p-8">
    <header class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-black text-slate-800">نظرة عامة على النظام</h1>
    </header>
    ${content}
  </main>
</body>
</html>
`;
