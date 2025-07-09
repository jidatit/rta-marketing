import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../config/firebaseConfig";
import { toast } from "react-toastify";

const DynamicCommissionModal = ({
  onClose,
  userId = null,
  userName = null,
  globalRule,
  refetch,
}) => {
  const [loading, setLoading] = useState(false);
  const [unitThreshold, setUnitThreshold] = useState(
    globalRule?.minSalesCount || 0
  );
  const [grossThreshold, setGrossThreshold] = useState(
    globalRule?.minAvgSalesGross || 0
  );
  const [bonusPercentage, setBonusPercentage] = useState(
    globalRule?.bonusCommissionRate || 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      minSalesCount: Number(unitThreshold),
      minAvgSalesGross: Number(grossThreshold),
      bonusCommissionRate: Number(bonusPercentage),
    };

    const path = userId
      ? doc(db, "userCommissionRules", userId)
      : doc(db, "commissionRules", "global");

    try {
      await setDoc(path, payload, { merge: true });

      toast.success(
        userId
          ? "User-specific commission rule saved!"
          : "Global commission rule saved!"
      );
      refetch();
      onClose();
    } catch (error) {
      console.error("Error saving commission rule:", error);
      toast.error("Failed to save commission rule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center w-full overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[1024px] mx-auto "
      >
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none pt-[90px] pb-[70px] pl-[103px] pr-[135px] z-10">
          {/* Header */}
          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-1 rounded-full absolute   right-[30px] top-[41px]"
          >
            <IoMdClose size={24} />
          </button>
          <div className="flex items-center justify-start mb-8">
            <h1 className="text-[26px] font-semibold">
              Dynamic commission
              {userId ? ` for ${userName}` : "(Global)"}
            </h1>
          </div>

          {/* Body */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-2xl mb-2">Units Sold</label>
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg h-[57px] bg-white text-gray-600"
                  value={unitThreshold}
                  placeholder="No of Sales"
                  onChange={(e) => setUnitThreshold(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-2xl mb-2">Gross Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-3 border rounded-lg pr-16 h-[57px]"
                    value={grossThreshold}
                    onChange={(e) => {
                      setGrossThreshold(e.target.value);
                    }}
                    placeholder="Enter Gross amount"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-2xl mb-2">Bonus comission</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full p-3 border rounded-lg pr-16 h-[57px]"
                    value={bonusPercentage}
                    onChange={(e) => {
                      setBonusPercentage(e.target.value);
                    }}
                    placeholder="Enter Bonus %"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className="bg-blue-900 text-white px-6 py-2 rounded-lg text-2xl font-medium hover:bg-blue-800 mt-[50px] transition-colors disabled:opacity-50"
            >
              {loading
                ? "Adding"
                : userId
                ? "Add Custom Commission"
                : "Add Global Commission"}
            </button>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 bg-black opacity-25"></div>
    </div>
  );
};

export default DynamicCommissionModal;
