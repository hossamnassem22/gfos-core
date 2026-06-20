export const ResponsiveGrid = ({ children }) => (
  <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {children}
  </div>
);
