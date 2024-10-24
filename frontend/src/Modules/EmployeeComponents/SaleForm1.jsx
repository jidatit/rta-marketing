import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { GrLinkNext } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";
import { db } from "../../config/firebaseConfig";
import { format } from "date-fns";
const getCurrentDate = () => {
  const now = new Date();
  return format(now, "dd MMMM yyyy");
};
const SaleForm1 = ({
  setShowModal,
  setSecondForm,
  handleInputChange,
  formData,
  setFormData,
}) => {
  const [leadSources, setLeadSources] = useState([]);
  const [selectedLeadSource, setSelectedLeadSource] = useState("");
  const isFormDataValid = () => {
    const requiredFields = [
      formData.customerName,
      formData.vehicleMake,
      formData.vehicleModel,
      formData.stockNumber,
      formData.VIN,
      formData.leadSource,
    ];
    return requiredFields.every((value) => value.trim() !== "");
  };

  const handleFirstNext = () => {
    if (isFormDataValid()) {
      console.log(formData);
      setShowModal(false);
      setSecondForm(true);
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const fetchLeads = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "leads"));
      console.log(querySnapshot);
      const fetchedLeads = querySnapshot.docs.map((doc) => doc.data().leadName);
      setLeadSources(fetchedLeads);
    } catch (error) {
      console.error("Error fetching leads: ", error);
      toast.error("Failed to fetch leads: " + error.message);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSelect = (event, setValue) => {
    console.log(event.target.value);

    setValue(event.target.value);
  };
  console.log(selectedLeadSource);
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center w-full overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
        <div className="relative w-[40%] mx-auto my-6">
          {/*content*/}
          <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
            {/*header*/}
            <div className="flex items-center justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
              <h1 className="w-full text-2xl font-bold text-center text-black font-radios">
                Add a New Sale
              </h1>
              <button
                className="float-right ml-auto -mt-1.5 font-semibold leading-none text-black border-0 outline-none focus:outline-none"
                onClick={() => setShowModal(false)}
              >
                <span className="block text-3xl text-black outline-none focus:outline-none cursor-pointer">
                  <IoMdClose />
                </span>
              </button>
            </div>
            {/*body*/}
            <div className="relative flex flex-col items-center justify-center flex-auto w-full p-6">
              <form className="flex flex-col justify-center items-center w-[80%] mx-auto gap-y-4">
                <h1 className="w-full mb-2 text-xl font-extrabold text-black text-start font-radios">
                  Car Details
                </h1>
                <div className="flex flex-row flex-wrap items-center justify-between w-full ">
                  <div className="w-[48%] mb-4">
                    <label
                      htmlFor="customerName"
                      className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                    >
                      Customer Name
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                      placeholder="Customer Name"
                      required
                      value={formData.customerName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="w-[48%] mb-4">
                    <label
                      htmlFor="vehicleMake"
                      className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                    >
                      Vehicle Make
                    </label>
                    <input
                      type="text"
                      id="vehicleMake"
                      className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                      placeholder="Vehicle Make"
                      required
                      value={formData.vehicleMake}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="w-[48%] mb-4">
                    <label
                      htmlFor="vehicleModel"
                      className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                    >
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      id="vehicleModel"
                      className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                      placeholder="Vehicle Model"
                      required
                      value={formData.vehicleModel}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="w-[48%] mb-4">
                    <label
                      htmlFor="stockNumber"
                      className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                    >
                      Stock Number
                    </label>
                    <input
                      type="text"
                      id="stockNumber"
                      className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                      placeholder="Stock Number"
                      required
                      value={formData.stockNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="w-[48%] mb-4">
                    <label
                      htmlFor="VIN"
                      className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                    >
                      VIN
                    </label>
                    <input
                      type="text"
                      id="VIN"
                      className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                      placeholder="VIN"
                      required
                      value={formData.VIN}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="w-[48%] mb-4">
                    <label
                      htmlFor="leadSource"
                      className="block mb-2 text-sm font-medium text-gray-900 font-radios "
                    >
                      Lead Source
                    </label>

                    <div className="relative">
                      <select
                        name="leads Sources"
                        id="leadSource"
                        value={formData.leadSource}
                        onChange={handleInputChange}
                        className="block w-full p-3  appearance-none text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                      >
                        <option value="">Lead Source</option>
                        {leadSources.map((lead) => (
                          <option key={lead} value={lead}>
                            {lead}
                          </option>
                        ))}
                      </select>

                      <FaChevronDown className="absolute top-1/2 right-7 transform -translate-y-1/2 pointer-events-none text-gray-400 text-sm" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end w-full ml-4 border-t border-solid rounded-b border-blueGray-200 ">
                  <button
                    className={`flex flex-row items-center justify-center px-6 py-3 mb-1 text-sm font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none gap-x-2 ${
                      isFormDataValid()
                        ? "bg-[#003160] hover:shadow-lg active:bg-emerald-600"
                        : "bg-gray-500 cursor-not-allowed"
                    }`}
                    type="button"
                    onClick={handleFirstNext}
                    disabled={!isFormDataValid()}
                  >
                    Next <GrLinkNext size={18} className="" />
                  </button>
                </div>
              </form>
            </div>
            {/*footer*/}
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </>
  );
};

export default SaleForm1;
