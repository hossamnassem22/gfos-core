export const AdminControlCenter = ({ modules }) => (
  <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
    {modules.map(mod => (
      <ModuleControlCard key={mod.id} name={mod.name} status={mod.phase} />
    ))}
  </div>
);
