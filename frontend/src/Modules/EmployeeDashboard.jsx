import { useState } from "react";
import { useAuth } from "../AuthContext";
import { FaPlus } from "react-icons/fa6";
import { GrLinkNext } from "react-icons/gr";
import { FaFilePdf } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
import { IoMdImage } from "react-icons/io";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";
const EmployeeDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [secondForm, setSecondForm] = useState(false);
  const [thirdForm, setThirdForm] = useState(false);
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setFileName(file.name);
      setFileType(file.type);
    }
  };

  const handleUpload = () => {
    if (file) {
      console.log(file);
      const storageRef = ref(storage, `insurance/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.error("Upload failed", error);
        },
        () => {
          console.log("Upload successful");
        }
      );
    }
  };
  const renderFileIcon = () => {
    if (fileType.includes("pdf")) {
      return <FaFilePdf size={20} className="text-red-700" />;
    } else if (fileType.includes("image")) {
      return <IoMdImage size={20} className="text-blue-600" />;
    } else {
      return <IoDocumentText size={20} className="text-blue-600 " />;
    }
  };
  const handleFirstNext = () => {
    setShowModal(false);
    setSecondForm(true);
  };
  const handleSecondNext = () => {
    setShowModal(false);
    setSecondForm(false);
    setThirdForm(true);
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
      <div className="flex items-start justify-start w-full h-full px-12 py-8">
        <div className="flex flex-row items-center justify-between w-full">
          <h1 className="text-2xl font-semibold">Previously Added Sales</h1>
          <div className="flex flex-row px-10 py-3 text-xl font-bold text-white bg-blue-500 rounded-full cursor-pointer gap-x-3 hover:bg-blue-700">
            {" "}
            <button type="button" onClick={() => setShowModal(true)}>
              Add New Sale
            </button>
            <FaPlus size={25} />
          </div>
        </div>
      </div>

      {showModal ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center w-full overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <div className="relative w-[55%] mx-auto my-6">
              {/*content*/}
              <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                  <button
                    className="float-right ml-auto -mt-1.5 font-semibold leading-none text-black border-0 outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="block text-4xl text-black outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative flex flex-col items-center justify-center flex-auto w-full p-6">
                  <h1 className="w-full mb-5 text-3xl font-bold text-center text-black font-radios">
                    Add a New Sale
                  </h1>
                  <form className="flex flex-col justify-center items-center w-[70%] mx-auto gap-y-4">
                    <h1 className="w-full mb-5 text-xl font-extrabold text-black text-start font-radios">
                      Car Details
                    </h1>
                    <div className="flex flex-row flex-wrap items-center justify-between w-full ">
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="name"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Customer Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Customer Name"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="vehicleMake"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Vehicle Make
                        </label>
                        <input
                          type="text"
                          id="vehicleMake"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Vehicle Make"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="VehicleModel"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Vehicle Model
                        </label>
                        <input
                          type="text"
                          id="VehicleModel"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Vehicle Model"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="StockNumber"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Stock Number
                        </label>
                        <input
                          type="text"
                          id="StockNumber"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Stock Number"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="VIN"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          VIN
                        </label>
                        <input
                          type="text"
                          id="VIN"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="VIN"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="LeadSource"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Lead Source
                        </label>
                        <input
                          type="text"
                          id="LeadSource"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Lead Source"
                          required
                        />
                      </div>
                    </div>
                  </form>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
                  <button
                    className="flex flex-row items-center justify-center px-6 py-3 mb-1 mr-1 text-lg font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none gap-x-2 bg-emerald-500 active:bg-emerald-600 hover:shadow-lg focus:outline-none"
                    type="button"
                    onClick={handleFirstNext}
                  >
                    Next <GrLinkNext size={23} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
        </>
      ) : null}

      {secondForm ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center w-full mt-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <div className="relative w-[55%] mx-auto my-6">
              {/*content*/}
              <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                  <button
                    className="float-right mt-3 ml-auto font-semibold leading-none text-black border-0 outline-none focus:outline-none"
                    onClick={() => setSecondForm(false)}
                  >
                    <span className="block text-4xl text-black outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="relative flex flex-col items-center justify-center flex-auto w-full p-6">
                  <h1 className="w-full mb-5 text-3xl font-bold text-center text-black font-radios">
                    Add a New Sale
                  </h1>
                  <form className="flex flex-col justify-center items-center w-[70%] mx-auto gap-y-4">
                    <h1 className="w-full mb-5 text-xl font-extrabold text-black text-start font-radios">
                      Gross Profit Calculator
                    </h1>
                    <div className="flex flex-row flex-wrap items-center justify-between w-full ">
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="SalePrice"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Sale Price
                        </label>
                        <input
                          type="text"
                          id="SalePrice"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Sale Price"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="UnitCost"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Unit Cost
                        </label>
                        <input
                          type="text"
                          id="UnitCost"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder=" Unit Cost"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="WarCost"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          War Cost
                        </label>
                        <input
                          type="text"
                          id="WarCost"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="War Cost"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="GapCost"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Gap Cost
                        </label>
                        <input
                          type="text"
                          id="GapCost"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Gap Cost"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="Admin"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Admin
                        </label>
                        <input
                          type="text"
                          id="Admin"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Admin"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="PAC"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          PAC
                        </label>
                        <input
                          type="text"
                          id="PAC"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="PAC"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="Safety"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Safety
                        </label>
                        <input
                          type="text"
                          id="Safety"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Safety"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="Reserve"
                          className="block mb-2 text-sm font-medium text-gray-900"
                        >
                          Reserve
                        </label>
                        <input
                          type="text"
                          id="Reserve"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Reserve"
                          required
                        />
                      </div>
                    </div>
                    <button
                      className="flex flex-row items-center justify-center px-6 py-3 mb-1 mr-1 text-lg font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none gap-x-2 bg-emerald-500 active:bg-emerald-600 hover:shadow-lg focus:outline-none"
                      type="button"
                    >
                      Calculate Gross Profit
                    </button>
                  </form>
                </div>
                <div className="w-full ">
                  <div className="w-[60%] mb-5 mx-auto">
                    <label
                      htmlFor="GrossProfit"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Gross Profit
                    </label>
                    <input
                      type="text"
                      id="GrossProfit"
                      className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                      placeholder="Gross Profit"
                      required
                    />
                  </div>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
                  <button
                    className="flex flex-row items-center justify-center px-6 py-3 mb-1 mr-1 text-lg font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none gap-x-2 bg-emerald-500 active:bg-emerald-600 hover:shadow-lg focus:outline-none"
                    type="button"
                    onClick={handleSecondNext}
                  >
                    Next <GrLinkNext size={23} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
        </>
      ) : null}
      {thirdForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center w-full overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
          <div className="relative w-[55%] mx-auto my-6">
            <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
              <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
                <button
                  className="float-right mt-3 ml-auto font-semibold leading-none text-black border-0 outline-none focus:outline-none"
                  onClick={() => setThirdForm(false)}
                >
                  <span className="block text-4xl text-black outline-none focus:outline-none">
                    ×
                  </span>
                </button>
              </div>
              <div className="relative flex flex-col items-center justify-center w-full h-full p-6 gap-y-5">
                <h1 className="w-full text-xl text-center font-radios ">
                  Insurance Policy
                </h1>
                <div className="w-[65%] flex flex-col gap-y-4">
                  <h1 className="w-full text-xl text-start font-radios ">
                    Upload Documents
                  </h1>
                  <label
                    htmlFor="uploadFile1"
                    className="bg-white text-gray-500 py-6 font-semibold text-base rounded w-full h-full flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto font-[sans-serif]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="mb-2 w-11 fill-gray-500"
                      viewBox="0 0 32 32"
                    >
                      <path
                        d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                        data-original="#000000"
                      />
                      <path
                        d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                        data-original="#000000"
                      />
                    </svg>
                    Upload file
                    <input
                      type="file"
                      id="uploadFile1"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="mt-2 text-xs font-medium text-gray-400">
                      PNG, JPG SVG, WEBP, and GIF are Allowed.
                    </p>
                    {fileName && (
                      <p className="flex items-center mt-2 text-sm font-medium text-gray-700">
                        {renderFileIcon()}
                        Selected file: {fileName}
                      </p>
                    )}
                  </label>

                  <div className="flex flex-row justify-end w-full gap-x-4">
                    <button className="inline-block px-5 py-3 mt-3 font-medium text-white bg-indigo-600 rounded shadow-md shadow-indigo-500/20 hover:bg-indigo-700">
                      Add Insurance Later
                    </button>
                    <button
                      className="inline-block px-5 py-3 mt-3 font-medium text-white bg-green-600 rounded shadow-md shadow-indigo-500/20 hover:bg-green-700"
                      onClick={handleUpload}
                    >
                      Upload Insurance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default EmployeeDashboard;
