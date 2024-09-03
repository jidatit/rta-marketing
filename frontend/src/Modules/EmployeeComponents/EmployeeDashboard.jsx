import { useState } from "react";
import { useAuth } from "../../AuthContext";
import { format } from "date-fns"; // Import date-fns for formatting dates
import { FaPlus } from "react-icons/fa6";
import { GrLinkNext } from "react-icons/gr";
import { IoMdClose } from "react-icons/io";
import SalesRecordTable from "../EmployeeComponents/SalesRecordTable";
import InsuranceUploadForm from "./InsuranceUploadForm";
import { toast } from "react-toastify";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db, storage } from "../../config/firebaseConfig";
const getCurrentDate = () => {
  const now = new Date();
  return format(now, "dd MMMM yyyy");
};
const EmployeeDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [Url, setUrl] = useState(false);
  const [secondForm, setSecondForm] = useState(false);
  const [thirdForm, setThirdForm] = useState(false);
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    saleId: "",
    customerName: "",
    vehicleMake: "",
    vehicleModel: "",
    stockNumber: "",
    VIN: "",
    leadSource: "",
    salePrice: "",
    unitCost: "",
    warCost: "",
    warr: "",
    gap: "",
    gapCost: "",
    admin: "",
    pac: "",
    safety: "",
    reserve: "",
    grossProfit: "",
    saleDate: getCurrentDate(), // Use getCurrentDate function to set the current date
    InsuranceStatus: false, // Set a default value
    FundStatus: false, // Set a default value
  });
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("");
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
  // Step 2: Handle input changes
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };
  const generateSaleId = () => {
    const timestamp = Date.now(); // Get current timestamp
    const randomNum = Math.floor(Math.random() * 10000); // Generate a random number from 0 to 9999
    return timestamp + randomNum; // Combine timestamp and random number
  };
  const handleUpload = async () => {
    if (file) {
      console.log(file);
      const saleId = generateSaleId();
      // Ensure a unique file name
      const storageRef = ref(storage, `files/${fileName}`);

      const metadata = {
        contentType: file.type, // Use the MIME type of the file
      };

      // Upload file with metadata
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.log(
            "Upload progress:",
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100 + "%"
          );
        },
        (error) => {
          console.log(error); // Handle any errors
        },
        async () => {
          // Retrieve the download URL after the upload is complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadURL);

          // Update the formData with the file URL and InsuranceStatus: true
          const updatedFormData = {
            ...formData,
            InsuranceStatus: true,
            documentUrl: downloadURL, // Use the correct download URL
            saleId,
          };

          const saleRef = doc(db, "sales", currentUser.uid);
          const docSnap = await getDoc(saleRef);

          if (!docSnap.exists()) {
            // Create a new document if it does not exist
            await setDoc(saleRef, {
              sales: [updatedFormData],
            });
          } else {
            // Update the existing document
            await updateDoc(saleRef, {
              sales: arrayUnion(updatedFormData),
            });
          }

          // Reset formData and form state after upload
          setFormData({ ...formData, grossProfit: "" });
          setThirdForm(false);
          toast.success("New Sale Added Successfully");
        }
      );
    }
  };

  const handleLaterUpload = async () => {
    try {
      const saleId = generateSaleId(); // Generate a unique sale ID
      const updatedFormData = {
        ...formData,
        saleId, // Add the sale ID here
      };
      const saleRef = doc(db, "sales", currentUser.uid);
      const docSnap = await getDoc(saleRef);

      if (!docSnap.exists()) {
        // Create a new document if it does not exist
        await setDoc(saleRef, {
          sales: [updatedFormData],
        });
      } else {
        // Update the existing document
        await updateDoc(saleRef, {
          sales: arrayUnion(updatedFormData),
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
      <div className="flex items-start justify-start w-full px-12 py-8 overflow-y-auto ">
        <div className="flex flex-col w-full h-full gap-y-8">
          <div className="flex flex-row items-center justify-between w-full">
            <h1 className="text-2xl font-semibold">Previously Added Sales</h1>
            <div className="flex flex-row px-10 py-3 text-xl font-bold text-white bg-[#003160] rounded-full cursor-pointer gap-x-3 hover:bg-blue-900 transition-all ease-in-out duration-300">
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
                        <input
                          type="text"
                          id="leadSource"
                          className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg shadow-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-sm-light"
                          placeholder="Lead Source"
                          required
                          value={formData.leadSource}
                          onChange={handleInputChange}
                        />
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
      ) : null}
      {secondForm ? (
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
                      <h1 className="w-full mb-1 text-xl font-extrabold text-black text-start font-radios">
                        Gross Profit Calculator
                      </h1>
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
      ) : null}
      {thirdForm ? (
        <InsuranceUploadForm
          formData={formData}
          setFormData={setFormData}
          handleUpload={handleUpload}
          handleLaterUpload={handleLaterUpload}
          setThirdForm={setThirdForm}
          file={file}
          setFile={setFile}
          fileName={fileName}
          setFileName={setFileName}
          fileType={fileType}
          setFileType={setFileType}
        />
      ) : null}
    </>
  );
};

export default EmployeeDashboard;
