import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config/firebaseConfig";
import { getAuth } from "firebase/auth";
import DocumentModal from "./DocumentModal";

const InsuranceUpload = ({ onClose, sale }) => {
  console.log(sale);
  const { currentUser } = getAuth();
  const [fileURL, setFileURL] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileName, setFileName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const getFileURL = async () => {
      try {
        const saleRef = doc(db, "sales", currentUser.uid);
        const docSnap = await getDoc(saleRef);

        if (docSnap.exists()) {
          const salesData = docSnap.data().sales || [];
          const sale = salesData.find((sale) => sale.saleId === sale.saleId);

          if (sale && sale.documentUrl) {
            setFileURL(sale.documentUrl);

            // Extract file name from the URL
            const urlParts = sale.documentUrl.split("/");
            const name = urlParts[urlParts.length - 1];
            setFileName(name);
            const fileExtension = name.split(".").pop().toLowerCase();
            setFileType(fileExtension);
          } else {
            throw new Error("File URL not found for the specified sale.");
          }
        } else {
          throw new Error("Sale document not found.");
        }
      } catch (error) {
        console.error("Error retrieving file URL: ", error);
      }
    };
    getFileURL();
  }, []);

  const openDocument = () => {
    setIsModalOpen(true);
  };

  const closeDocument = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative w-[55%] max-w-4xl bg-white p-6 rounded-lg shadow-lg mt-10 mb-10 overflow-y-auto max-h-[90%]">
        <button
          onClick={onClose}
          className="absolute text-2xl text-gray-600 top-2 right-2 hover:text-gray-800"
        >
          &times;
        </button>
        <h2 className="mb-4 text-xl font-bold">Sale Details</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Fund Status:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.FundStatus ? "True" : "False"}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Insurance Status:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.InsuranceStatus ? "True" : "False"}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              VIN:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.VIN}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Admin:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.admin}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Customer Name:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.customerName}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Gap Cost:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.gapCost}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Gross Profit:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.grossProfit}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Lead Source:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.leadSource}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              PAC:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.pac}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Reserve:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.reserve}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Safety:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.safety}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Sale Date:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.saleDate}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Sale Price:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.salePrice}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Stock Number:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.stockNumber}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Unit Cost:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.unitCost}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Vehicle Make:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.vehicleMake}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              Vehicle Model:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.vehicleModel}
            </p>
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              War Cost:
            </h1>
            <p className="p-3 text-black bg-white rounded-lg shadow-lg">
              {sale.warCost}
            </p>
          </div>{" "}
          <div className="flex flex-col mb-4 gap-y-2">
            <h1 className="p-3 font-semibold text-white bg-blue-500 rounded-lg">
              File Name:
            </h1>
            <input
              type="text"
              value={sale.documentUrl}
              readOnly
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex flex-col mb-4 gap-y-2">
            <button
              className="px-6 py-2.5 text-white bg-green-600 rounded-lg"
              onClick={openDocument}
            >
              Show Document
            </button>
          </div>
          {isModalOpen ? (
            <DocumentModal
              onRequestClose={closeDocument}
              fileURL={sale.documentUrl}
              fileType={fileType}
              isOpen={isModalOpen}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default InsuranceUpload;
