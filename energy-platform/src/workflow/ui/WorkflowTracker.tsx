export const WorkflowTracker = ({ steps, currentStep }) => (
  <div className="flex justify-between p-4 my-6 bg-white border rounded">
    {steps.map((step, index) => (
      <div key={index} className={index <= currentStep ? "text-blue-600 font-bold" : "text-gray-400"}>
        {index + 1}. {step}
      </div>
    ))}
  </div>
);
