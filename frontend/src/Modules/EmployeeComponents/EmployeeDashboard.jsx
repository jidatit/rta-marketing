import { useState } from "react";
import { useAuth } from "../../AuthContext";
import { format } from "date-fns"; // Import date-fns for formatting dates
import { FaPlus } from "react-icons/fa6";
import { GrLinkNext } from "react-icons/gr";
import { FaFilePdf } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
import { IoMdImage } from "react-icons/io";
import { toast } from "react-toastify";
import { ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../../config/firebaseConfig";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import SalesRecordTable from "../EmployeeComponents/SalesRecordTable";
const EmployeeDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [secondForm, setSecondForm] = useState(false);
  const [thirdForm, setThirdForm] = useState(false);
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    vehicleMake: "",
    vehicleModel: "",
    stockNumber: "",
    VIN: "",
    leadSource: "",
    salePrice: "",
    unitCost: "",
    warCost: "",
    gapCost: "",
    admin: "",
    pac: "",
    safety: "",
    reserve: "",
    grossProfit: "",
    saleDate: "",
    InsuranceStatus: "",
    FundStatus: "",
  });

  const calculateGrossProfit = () => {
    const {
      salePrice,
      unitCost,
      warCost,
      gapCost,
      admin,
      pac,
      safety,
      reserve,
    } = formData;

    const totalCost =
      parseFloat(unitCost) +
      parseFloat(warCost) +
      parseFloat(gapCost) +
      parseFloat(admin) +
      parseFloat(pac) +
      parseFloat(safety) +
      parseFloat(reserve);

    const grossProfit = parseFloat(salePrice) - totalCost;

    setFormData((prevData) => ({
      ...prevData,
      grossProfit: grossProfit.toFixed(2),
    }));
    console.log(formData);
  };
  // Step 2: Handle input changes
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFile(file);
      setFileName(file.name);
      setFileType(file.type);
    } else {
      setFile(null);
      setFileName("");
      setFileType("");
    }
  };

  const handleUpload = async () => {
    if (file) {
      console.log(file);
      const storageRef = ref(storage, "insuranceFiles");
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log(snapshot);
        },
        (error) => {
          console.error("Upload failed", error);
        },
        async () => {
          console.log("Upload successful");

          try {
            const saleRef = doc(db, "sales", currentUser.uid);
            const docSnap = await getDoc(saleRef);

            if (!docSnap.exists()) {
              // Create a new document if it does not exist
              await setDoc(saleRef, {
                sales: [formData],
              });
            } else {
              // Update the existing document
              await updateDoc(saleRef, {
                sales: arrayUnion(formData),
              });
            }

            // Wait for the update to complete before updating the formData state
            setFormData({ ...formData, grossProfit: "" });

            // Reset grossProfit
            setThirdForm(false);
            toast.success("New Sale Added Successfully");
          } catch (error) {
            console.error("Error adding sale: ", error);
          } finally {
            setFileName("");
            setFileType("");
            setFile(null);
          }
        }
      );
    }
  };
  const getCurrentDate = () => {
    const now = new Date();
    return format(now, "dd MMMM yyyy");
  };
  const handleLaterUpload = async () => {
    try {
      const saleRef = doc(db, "sales", currentUser.uid);
      const docSnap = await getDoc(saleRef);

      if (!docSnap.exists()) {
        // Create a new document if it does not exist
        await setDoc(saleRef, {
          sales: [formData],
        });
      } else {
        // Update the existing document
        await updateDoc(saleRef, {
          sales: arrayUnion(formData),
        });
      }

      // Wait for the update to complete before updating the formData state
      setFormData({ ...formData, grossProfit: "" });

      // Reset grossProfit
      setThirdForm(false);
      toast.success("New Sale Added Successfully");
    } catch (error) {
      console.error("Error adding sale: ", error);
    } finally {
      setFileName("");
      setFileType("");
      setFile(null);
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
      formData.grossProfit,
    ];
    return requiredFields.every((value) => value.trim() !== "");
  };
  const handleFirstNext = () => {
    if (isFormDataValid()) {
      setShowModal(false);
      setSecondForm(true);
    } else {
      toast.error("Please fill in all required fields");
    }
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
      <div className="flex items-start justify-start w-full h-full px-12 py-8 overflow-y-auto">
        <div className="flex flex-col w-full h-full gap-y-8">
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
          <SalesRecordTable />
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
                          htmlFor="customerName"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Customer Name
                        </label>
                        <input
                          type="text"
                          id="customerName"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Customer Name"
                          required
                          value={formData.customerName}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="vehicleMake"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Vehicle Make
                        </label>
                        <input
                          type="text"
                          id="vehicleMake"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Vehicle Make"
                          required
                          value={formData.vehicleMake}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="vehicleModel"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Vehicle Model
                        </label>
                        <input
                          type="text"
                          id="vehicleModel"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Vehicle Model"
                          required
                          value={formData.vehicleModel}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="stockNumber"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Stock Number
                        </label>
                        <input
                          type="text"
                          id="stockNumber"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Stock Number"
                          required
                          value={formData.stockNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="VIN"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          VIN
                        </label>
                        <input
                          type="text"
                          id="VIN"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="VIN"
                          required
                          value={formData.VIN}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="leadSource"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Lead Source
                        </label>
                        <input
                          type="text"
                          id="leadSource"
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Lead Source"
                          required
                          value={formData.leadSource}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="flex items-end justify-end w-full p-6 ml-4 border-t border-solid rounded-b border-blueGray-200 ">
                      <button
                        className={`flex flex-row items-end justify-end px-6 py-3 mb-1 text-lg font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none gap-x-2 ${
                          isFormDataValid()
                            ? "bg-emerald-500 hover:shadow-lg active:bg-emerald-600"
                            : "bg-gray-500 cursor-not-allowed"
                        }`}
                        type="button"
                        onClick={handleFirstNext}
                        disabled={!isFormDataValid()}
                      >
                        Next <GrLinkNext size={23} />
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
      ) : null}

      {secondForm ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center w-full mt-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <div className="relative w-[55%] mx-auto my-6">
              {/*content*/}
              <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 mt-24 border-b border-solid rounded-t border-blueGray-200">
                  <button
                    className="float-right ml-auto font-semibold leading-none text-black border-0 outline-none focus:outline-none"
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
                          htmlFor="salePrice"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Sale Price
                        </label>
                        <input
                          type="text"
                          id="salePrice"
                          value={formData.salePrice}
                          onChange={handleInputChange}
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Sale Price"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="unitCost"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Unit Cost
                        </label>
                        <input
                          type="text"
                          id="unitCost"
                          value={formData.unitCost}
                          onChange={handleInputChange}
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder=" Unit Cost"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="warCost"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          War Cost
                        </label>
                        <input
                          type="text"
                          id="warCost"
                          value={formData.warCost}
                          onChange={handleInputChange}
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="War Cost"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="aapCost"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Gap Cost
                        </label>
                        <input
                          type="text"
                          id="gapCost"
                          value={formData.gapCost}
                          onChange={handleInputChange}
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Gap Cost"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="admin"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Admin
                        </label>
                        <input
                          type="text"
                          id="admin"
                          value={formData.admin}
                          onChange={handleInputChange}
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Admin"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="pac"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          PAC
                        </label>
                        <input
                          type="text"
                          id="pac"
                          value={formData.pac}
                          onChange={handleInputChange}
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="PAC"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="safety"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Safety
                        </label>
                        <input
                          type="text"
                          id="safety"
                          value={formData.safety}
                          onChange={handleInputChange}
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Safety"
                          required
                        />
                      </div>
                      <div className="w-[48%] mb-5">
                        <label
                          htmlFor="reserve"
                          className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                        >
                          Reserve
                        </label>
                        <input
                          type="text"
                          id="reserve"
                          value={formData.reserve}
                          onChange={handleInputChange}
                          className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Reserve"
                          required
                        />
                      </div>
                    </div>
                    <button
                      className="flex flex-row items-center justify-center px-6 py-3 mb-1 mr-1 text-lg font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none gap-x-2 bg-emerald-500 active:bg-emerald-600 hover:shadow-lg focus:outline-none"
                      type="button"
                      onClick={calculateGrossProfit}
                    >
                      Calculate Gross Profit
                    </button>
                    <div className="flex flex-col items-end justify-end w-full p-6 border-t border-solid rounded-b border-blueGray-200">
                      <div className="w-full ">
                        <div className="w-full mx-auto mb-5">
                          <label
                            htmlFor="grossProfit"
                            className="block mb-2 text-lg font-medium text-gray-900 font-radios "
                          >
                            Gross Profit
                          </label>
                          <input
                            type="text"
                            id="grossProfit"
                            value={formData.grossProfit}
                            className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                            placeholder="Gross Profit"
                            required
                          />
                        </div>
                      </div>
                      <button
                        className={`flex flex-row items-end justify-end px-6 py-3 mb-1 text-lg font-bold text-white uppercase transition-all duration-150 ease-linear rounded shadow outline-none gap-x-2 ${
                          isSecondFormDataValid()
                            ? "bg-emerald-500 hover:shadow-lg active:bg-emerald-600"
                            : "bg-gray-500 cursor-not-allowed"
                        }`}
                        type="button"
                        onClick={handleSecondNext}
                        disabled={!isSecondFormDataValid()}
                      >
                        Next <GrLinkNext size={23} />
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
                    <button
                      className="inline-block px-5 py-3 mt-3 font-medium text-white bg-indigo-600 rounded shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
                      onClick={handleLaterUpload}
                    >
                      Add Insurance Later
                    </button>
                    <button
                      className={`inline-block px-5 py-3 mt-3 font-medium text-white rounded shadow-md shadow-indigo-500/20 ${
                        file
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                      onClick={handleUpload}
                      disabled={!file}
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
