import { FaFilePdf } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
import { IoMdImage } from "react-icons/io";
import { useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../../config/firebaseConfig";
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { useAuth } from "../../AuthContext";
const InsuranceUpload = ({ onClose, sale }) => {
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState(null);
  const [fileType, setFileType] = useState("");
  const { currentUser } = useAuth();
  console.log(sale);
  console.log(file);
  const handleUpload = async () => {
    if (file) {
      console.log(file);
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

          // Reference to the user's sales document
          const saleRef = doc(db, "sales", currentUser.uid);
          const docSnap = await getDoc(saleRef);

          if (docSnap.exists()) {
            // Get the sales array from the document
            const sales = docSnap.data().sales;

            // Find the index of the sale with the matching saleId
            const saleIndex = sales.findIndex((s) => s.saleId === sale.saleId);

            if (saleIndex !== -1) {
              // Update the InsuranceStatus and documentUrl for the specific sale
              const updatedSale = {
                ...sales[saleIndex],
                InsuranceStatus: true,
                documentUrl: downloadURL,
              };

              // Replace the old sale with the updated one
              const updatedSales = [...sales];
              updatedSales[saleIndex] = updatedSale;

              // Update the sales array in the Firestore document
              await updateDoc(saleRef, { sales: updatedSales });

              toast.success("Insurance document uploaded successfully");
            } else {
              console.log("Sale not found");
            }
          } else {
            console.log("No document found for the current user");
          }
        }
      );
    }
  };

  // Your JSX for the component

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

  const renderFileIcon = () => {
    if (fileType.includes("pdf")) {
      return <FaFilePdf size={20} className="text-red-700" />;
    } else if (fileType.includes("image")) {
      return <IoMdImage size={20} className="text-blue-600" />;
    } else {
      return <IoDocumentText size={20} className="text-blue-600 " />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center w-full overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-[55%] mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
            <button
              className="float-right mt-3 ml-auto font-semibold leading-none text-black border-0 outline-none focus:outline-none"
              onClick={onClose}
            >
              <span className="block text-4xl text-black outline-none focus:outline-none">
                ×
              </span>
            </button>
          </div>
          <div className="relative flex flex-col items-center justify-center w-full h-full p-6 gap-y-5">
            <h1 className="w-full text-xl text-center font-radios">
              Insurance Policy
            </h1>
            <div className="w-[65%] flex flex-col gap-y-4">
              <h1 className="w-full text-xl text-start font-radios">
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
  );
};

export default InsuranceUpload;
