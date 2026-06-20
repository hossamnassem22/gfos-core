export const FeedbackButton = ({ actionId }) => (
  <button 
    onClick={() => console.log(`[FEEDBACK] Evaluating action: ${actionId}`)}
    className="bg-gray-200 px-3 py-1 rounded text-xs hover:bg-yellow-300 transition"
  >
    قيّم هذه الخدمة
  </button>
);
