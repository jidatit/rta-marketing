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
import SaleForm1 from "./SaleForm1";
import SaleForm2 from "./SaleForm2";
const getCurrentDate = () => {
  const now = new Date();
  return format(now, "dd MMMM yyyy");
};
const EmployeeDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [Url, setUrl] = useState(false);
  const [secondForm, setSecondForm] = useState(false);
  const [thirdForm, setThirdForm] = useState(false);
  const [firstForm, setFirstForm] = useState(false);
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
    saleDate: getCurrentDate(),
    InsuranceStatus: false,
    FundStatus: false,
  });
  const [files, setFiles] = useState([]);

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
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const handleUpload = async () => {
    if (files.length > 0) {
      setLoading(true);
      const saleId = generateSaleId();
      const documentURLsArray = []; // To store download URLs of all files

      // Loop through each file and upload to Firebase
      for (const fileObj of files) {
        const file = fileObj.file; // Extract the actual file object from the file structure
        const uniqueFileName = `${saleId}_${file.name}`; // Create a unique filename using saleId and file name

        const storageRef = ref(storage, `files/${uniqueFileName}`);

        const metadata = {
          contentType: file.type, // Set the file's MIME type
        };

        // Upload file and wait for it to complete
        const uploadTask = uploadBytesResumable(storageRef, file, metadata);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // console.log(
              //   "Upload progress:",
              //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100 + "%"
              // );
            },
            (error) => {
              console.error("Error uploading file:", error);
              reject(error); // Handle errors
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              documentURLsArray.push(downloadURL); // Add the download URL to the array
              resolve();
            }
          );
        });
      }

      // Once all files are uploaded and URLs are collected
      const updatedFormData = {
        ...formData,
        InsuranceStatus: true,
        documentUrl: documentURLsArray, // Save array of URLs
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
      setLoading(false);
      setFiles([]);
      setFormData({
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
        saleDate: getCurrentDate(),
        InsuranceStatus: false,
        FundStatus: false,
      });
      setThirdForm(false);
      toast.success("New Sale Added Successfully");
    }
  };

  const handleLaterUpload = async () => {
    try {
      setLoading2(true);
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
      // setFormData({ ...formData, grossProfit: "" });

      // Reset grossProfit
      setLoading2(false);
      setFiles([]);
      setFormData({
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
        saleDate: getCurrentDate(),
        InsuranceStatus: false,
        FundStatus: false,
      });
      setThirdForm(false);
      toast.success("New Sale Added Successfully");
    } catch (error) {
      console.error("Error adding sale: ", error);
    } finally {
      // setFileName("");
      // setFileType("");
      setFiles([]);
    }
  };
  // console.log(setShowModal);
  return (
    <>
      <div className="flex items-start justify-start w-full px-12 py-8 overflow-y-auto h-full ">
        <div className="flex flex-col w-full h-full gap-y-8">
          <div className="flex flex-row items-center justify-between w-full">
            <h1 className="text-2xl font-semibold">Previously Added Sales</h1>
            <div className="">
              {" "}
              <button
                type="button"
                className="flex flex-row px-10 py-3 text-xl font-bold text-white bg-[#003160] rounded-full cursor-pointer gap-x-3 hover:bg-blue-900 transition-all ease-in-out duration-300"
                onClick={() => setShowModal(true)}
              >
                Add New Sale
                <FaPlus size={25} />
              </button>
            </div>
          </div>
          <SalesRecordTable setShowModal={setShowModal} />
        </div>
      </div>

      {showModal ? (
        <SaleForm1
          setShowModal={setShowModal}
          setSecondForm={setSecondForm}
          handleInputChange={handleInputChange}
          formData={formData}
          setFormData={setFormData}
        />
      ) : null}
      {secondForm ? (
        <SaleForm2
          setShowModal={setShowModal}
          setSecondForm={setSecondForm}
          handleInputChange={handleInputChange}
          formData={formData}
          setThirdForm={setThirdForm}
          setFormData={setFormData}
          setFirstForm={setFirstForm}
        />
      ) : null}
      {thirdForm ? (
        <InsuranceUploadForm
          formData={formData}
          setFormData={setFormData}
          handleUpload={handleUpload}
          handleLaterUpload={handleLaterUpload}
          setThirdForm={setThirdForm}
          files={files}
          setFiles={setFiles}
          setSecondForm={setSecondForm}
          loading={loading}
          loading2={loading2}
        />
      ) : null}
    </>
  );
};

export default EmployeeDashboard;
