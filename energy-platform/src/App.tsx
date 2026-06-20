import { useState } from 'react';
import { RetailerInterface } from './components/RetailerInterface';
import { FactoryDashboard } from './components/FactoryDashboard';
import { AdminPanel } from './components/AdminPanel';
import { orderRegistry } from './core/DataModel';

export default function App() {
  const [view, setView] = useState<'RETAILER' | 'FACTORY' | 'ADMIN'>('RETAILER');

  return (
    <div className="max-w-md mx-auto p-4 font-sans">
      <nav className="flex justify-between mb-6 bg-gray-100 p-1 rounded-lg">
        <button onClick={() => setView('RETAILER')} className="flex-1 p-2 rounded bg-white shadow-sm">تاجر</button>
        <button onClick={() => setView('FACTORY')} className="flex-1 p-2">مصنع</button>
        <button onClick={() => setView('ADMIN')} className="flex-1 p-2">مدير</button>
      </nav>
      {view === 'RETAILER' && <RetailerInterface />}
      {view === 'FACTORY' && <FactoryDashboard orders={orderRegistry} />}
      {view === 'ADMIN' && <AdminPanel orders={orderRegistry} />}
    </div>
  );
}
