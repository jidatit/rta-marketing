import { GrLinkNext } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import { useAuth } from "../../AuthContext";

import { IoArrowBack } from "react-icons/io5";
const SaleForm2 = ({
  formData,
  setShowModal,
  handleInputChange,
  setThirdForm,
  setFormData,
  setSecondForm,
  setFirstForm,
}) => {
  const { currentUser } = useAuth();
  const calculateGrossProfit = () => {
    const {
      salePrice,
      unitCost,
      warCost,
      warr,
      gap,
      gapCost,
      admin,
      pac,
      safety,
      reserve,
    } = formData;
    if (isSecondFormDataValid()) {
      const grossProfit =
        parseFloat(salePrice) -
        parseFloat(unitCost) +
        parseFloat(warr) +
        parseFloat(admin) +
        parseFloat(gap) -
        parseFloat(warCost) -
        parseFloat(gapCost) -
        parseFloat(pac) -
        parseFloat(safety) +
        parseFloat(reserve);

      setFormData((prevData) => ({
        ...prevData,
        grossProfit: grossProfit.toFixed(2),
      }));

      console.log(formData);
    } else {
      toast.error("Please fill in all required fields.");
    }
  };
  const isSecondFormDataValid = () => {
    const requiredFields = [
      formData.salePrice,
      formData.unitCost,
      formData.warCost,
      formData.admin,
      formData.gapCost,
      formData.pac,
      formData.safety,
      formData.reserve,

      formData.saleDate, // Check if date is set
    ];

    // Checking that string fields are not empty and numeric fields are not NaN or null
    return requiredFields.every((value) => {
      if (typeof value === "string") {
        return value.trim() !== ""; // Check if the string is not empty
      }
      return value !== null && value !== undefined && !isNaN(value); // For numbers, ensure they are not null, undefined, or NaN
    });
  };
  const handleSecondNext = () => {
    if (isSecondFormDataValid()) {
      setShowModal(false);
      setSecondForm(false);
      setThirdForm(true);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handleGoBack = () => {
    //code here
    setSecondForm(false);
    setFirstForm(true);
    setShowModal(true);
  };
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen loading-spinner">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 rounded-full border-t-transparent border-gray-900/50 animate-spin"></div>
      </div>
    ); // or you can display a fallback UI or redirect
  }
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center w-full overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div className="relative w-[90%] sm:w-[80%] md:w-[70%] lg:w-[50%] xl:w-[45%] mx-auto my-6 h-[90vh]">
          {/* Modal Content */}
          <div className="relative flex flex-col w-full h-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
              <h1 className="w-full text-2xl font-bold text-center text-black font-radios">
                Add a New Sale
              </h1>
              <button
                className="float-right ml-auto -mt-1.5 font-semibold leading-none text-black border-0 outline-none focus:outline-none"
                onClick={() => setSecondForm(false)}
              >
                <span className="block text-3xl text-black outline-none focus:outline-none cursor-pointer">
                  <IoMdClose />
                </span>
              </button>
            </div>
            {/* Body */}
            <div className="relative flex flex-col items-center justify-center w-full p-6 overflow-y-auto">
              <div className="w-full h-full overflow-y-auto p-4 pt-0">
                {" "}
                {/* Ensure the body scrolls */}
                <form className="flex flex-col justify-center items-center w-[80%] mx-auto gap-y-4">
                  <div className="self-start  flex gap-4">
                    <button
                      onClick={() => {
                        handleGoBack();
                      }}
                    >
                      <IoArrowBack size={20} />
                    </button>
                    <h1 className="w-full mb-1 text-xl font-extrabold text-black text-start font-radios">
                      Gross Profit Calculator
                    </h1>
                  </div>

                  <div className="flex flex-row flex-wrap items-center justify-between w-full ">
                    {/* Form fields */}
                    <div className="w-[48%] mb-2">
                      <label
                        htmlFor="salePrice"
                        className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                      >
                        Sale Price
                      </label>
                      <input
                        type="number"
                        id="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder="Sale Price"
                        required
                      />
                    </div>
                    <div className="w-[48%] mb-2">
                      <label
                        htmlFor="unitCost"
                        className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                      >
                        Unit Cost
                      </label>
                      <input
                        type="number"
                        id="unitCost"
                        value={formData.unitCost}
                        onChange={handleInputChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder=" Unit Cost"
                        required
                      />
                    </div>
                    <div className="w-[48%] mb-2">
                      <label
                        htmlFor="warr"
                        className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                      >
                        Warr
                      </label>
                      <input
                        type="number"
                        id="warr"
                        value={formData.warr}
                        onChange={handleInputChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder="Warr"
                        required
                      />
                    </div>
                    <div className="w-[48%] mb-2">
                      <label
                        htmlFor="warCost"
                        className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                      >
                        War Cost
                      </label>
                      <input
                        type="number"
                        id="warCost"
                        value={formData.warCost}
                        onChange={handleInputChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder="War Cost"
                        required
                      />
                    </div>
                    <div className="w-[48%] mb-2">
                      <label
                        htmlFor="gap"
                        className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                      >
                        Gap
                      </label>
                      <input
                        type="number"
                        id="gap"
                        value={formData.gap}
                        onChange={handleInputChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder="Gap"
                        required
                      />
                    </div>
                    <div className="w-[48%] mb-2">
                      <label
                        htmlFor="gapCost"
                        className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                      >
                        Gap Cost
                      </label>
                      <input
                        type="number"
                        id="gapCost"
                        value={formData.gapCost}
                        onChange={handleInputChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder="Gap Cost"
                        required
                      />
                    </div>
                    <div className="w-[48%] mb-2">
                      <label
                        htmlFor="admin"
                        className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                      >
                        Admin
                      </label>
                      <input
                        type="number"
                        id="admin"
                        value={formData.admin}
                        onChange={handleInputChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder="Admin"
                        required
                      />
                    </div>
                    <div className="w-[48%] mb-2">
                      <label
                        htmlFor="pac"
                        className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                      >
                        PAC
                      </label>
                      <input
                        type="number"
                        id="pac"
                        value={formData.pac}
                        onChange={handleInputChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder="PAC"
                        required
                      />
                    </div>
                    <div className="w-[48%] mb-2">
                      <label
                        htmlFor="safety"
                        className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                      >
                        Safety
                      </label>
                      <input
                        type="number"
                        id="safety"
                        value={formData.safety}
                        onChange={handleInputChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder="Safety"
                        required
                      />
                    </div>
                    <div className="w-[48%] mb-2">
                      <label
                        htmlFor="reserve"
                        className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                      >
                        Reserve
                      </label>
                      <input
                        type="number"
                        id="reserve"
                        value={formData.reserve}
                        onChange={handleInputChange}
                        className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                        placeholder="Reserve"
                        required
                      />
                    </div>
                  </div>
                  <button
                    className="flex flex-row items-center justify-center px-6 py-3 mr-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none gap-x-2 bg-[#6636C0] active:bg-[#6636C0] hover:shadow-lg focus:outline-none"
                    type="button"
                    onClick={calculateGrossProfit}
                  >
                    Calculate Gross Profit
                  </button>
                  <div className="flex flex-col items-end justify-end w-full p-3 border-t border-solid rounded-b border-blueGray-200">
                    <div className="w-full ">
                      <div className="w-full mx-auto mb-4">
                        <label
                          htmlFor="grossProfit"
                          className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                        >
                          Gross Profit
                        </label>
                        <input
                          type="text"
                          id="grossProfit"
                          value={formData.grossProfit}
                          className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Gross Profit"
                          required
                          disabled
                        />
                      </div>
                    </div>
                    <button
                      className={`flex flex-row items-center justify-center px-6 py-3 mb-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none gap-x-2 ${
                        isSecondFormDataValid()
                          ? "bg-[#003160] hover:shadow-lg active:bg-[#003160]"
                          : "bg-gray-500 cursor-not-allowed"
                      }`}
                      type="button"
                      onClick={handleSecondNext}
                      disabled={!isSecondFormDataValid()}
                    >
                      Next <GrLinkNext size={23} className="mb-0.5" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
            {/*footer*/}
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </>
  );
};

export default SaleForm2;
