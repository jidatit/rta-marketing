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
  console.log(setShowModal);
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
          <SalesRecordTable setShowModal={setShowModal} />
        </div>
      </div>

      {showModal ? (
        <SaleForm1
          setShowModal={setShowModal}
          setSecondForm={setSecondForm}
          handleInputChange={handleInputChange}
          formData={formData}
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
        />
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
