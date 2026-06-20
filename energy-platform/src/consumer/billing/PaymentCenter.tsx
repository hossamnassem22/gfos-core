export const PaymentCenter = ({ balance }) => (
  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
    <h3 className="font-semibold">المبلغ المستحق: {balance} جنيه</h3>
    <button className="bg-green-600 text-white w-full py-3 mt-4 rounded-lg font-bold">
      ادفع الآن
    </button>
  </div>
);
