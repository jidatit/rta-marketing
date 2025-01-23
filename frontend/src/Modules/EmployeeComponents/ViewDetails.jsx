import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config/firebaseConfig";
import { getAuth } from "firebase/auth";
import DocumentModal from "./DocumentModal";
// import Box from "@mui/material/Box";
// import Tab from "@mui/material/Tab";
import { Box, Tab, Tabs } from "@mui/material";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

const InsuranceUpload = ({ onClose, sale }) => {
  // console.log(sale);
  const { currentUser } = getAuth();
  const [fileURL, setFileURL] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileName, setFileName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedURL, setSelectedURL] = useState("");

  const [value, setValue] = useState("1");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const getFileURL = async () => {
      try {
        const saleRef = doc(db, "sales", currentUser.uid);
        const docSnap = await getDoc(saleRef);

        if (docSnap.exists()) {
          const salesData = docSnap.data().sales || [];
          const foundSale = salesData.find(
            (item) => item.saleId === sale.saleId
          );

          if (foundSale && foundSale.documentUrl) {
            setFileURL(foundSale.documentUrl);

            // Extract file name from the URL
            const urlParts = foundSale.documentUrl.split("/");
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
  }, [sale, currentUser.uid]);
  // console.log(sale);

  const openDocument = (url) => {
    setSelectedURL(url);
    setIsModalOpen(true);
  };

  const closeDocument = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50">
      <div className="relative w-[45%] max-w-4x bg-white p-6 rounded-lg shadow-lg mt-10 mb-10 overflow-y-auto max-h-[90%]">
        <button
          onClick={onClose}
          className="absolute text-2xl text-gray-600 top-2 right-2 hover:text-gray-800"
        >
          &times;
        </button>
        <h2 className="mb-4 text-xl font-bold text-center">Sale Details</h2>
        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleChange}
                sx={{
                  "& .MuiTab-root": {
                    color: "#003160",
                    "&.Mui-selected": {
                      color: "#003160",
                    },
                  },
                }}
              >
                <Tab label="Details" value="1" />
                <Tab label="Gross Sheet" value="2" />
                <Tab label="Documents" value="3" />
              </TabList>
            </Box>

            <TabPanel value="1" style={{ padding: "0", margin: "0" }}>
              <div className="py-6">
                <div className="flex items-center justify-between mb-6 ">
                  <h3 className="text-lg font-bold w-[45%]">Sale Details</h3>
                  <div className="">
                    <div className="flex flex-row px-4 py-2 text-md font-bold text-white bg-[#003160] rounded-full  gap-x-2">
                      <span>Gross Profit :</span>
                      <p>{sale.grossProfit}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4  ">
                  <div className=" flex flex-col gap-2 w-[45%] ">
                    <p className="text-sm font-medium text-slate-800 ">
                      Customer Name
                    </p>
                    <p className="text-xl font-bold text-black ">
                      {sale.customerName}
                    </p>
                  </div>
                  <div className=" flex flex-col gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">
                      Vehicle Make
                    </p>
                    <p className="text-xl font-bold text-black">
                      {sale.vehicleMake}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4 ">
                  <div className=" flex flex-col gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">
                      Vehicle Model
                    </p>
                    <p className="text-xl font-bold text-black">
                      {sale.vehicleModel}
                    </p>
                  </div>
                  <div className=" flex flex-col gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">
                      Stock Number
                    </p>
                    <p className="text-xl font-bold text-black">
                      {sale.stockNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4 ">
                  <div className=" flex flex-col gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">VIN</p>
                    <p className="text-xl font-bold text-black">{sale.VIN}</p>
                  </div>
                  <div className=" flex flex-col gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">
                      Lead Source
                    </p>
                    <p className="text-xl font-bold text-black">
                      {sale.leadSource}
                    </p>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel value="2" style={{ padding: "0", margin: "0" }}>
              <div className="py-6">
                <div className="flex items-center justify-between mb-6 ">
                  <h3 className="text-lg font-bold w-[45%]">Gross Sheet</h3>
                  <div className="">
                    <div className="flex flex-row px-4 py-2 text-md font-bold text-white bg-[#003160] rounded-full  gap-x-2">
                      <span>Gross Profit :</span>
                      <p>{sale.grossProfit}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 w-[45%] ">
                    <p className="text-sm font-medium text-slate-800">
                      Sale Price :
                    </p>
                    <p className="text-xl font-bold text-black">
                      {sale.salePrice}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">
                      Unit Cost :
                    </p>
                    <p className="text-xl font-bold text-black">
                      {sale.unitCost}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">Warr :</p>
                    <p className="text-xl font-bold text-black">{sale.warr}</p>
                  </div>
                  <div className="flex items-center gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">
                      War Cost :
                    </p>
                    <p className="text-xl font-bold text-black">
                      {sale.warCost}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">Gap :</p>
                    <p className="text-xl font-bold text-black">{sale.gap}</p>
                  </div>
                  <div className="flex items-center gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">
                      Gap Cost :
                    </p>
                    <p className="text-xl font-bold text-black">
                      {sale.gapCost}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">
                      Admin :
                    </p>
                    <p className="text-xl font-bold text-black">{sale.admin}</p>
                  </div>
                  <div className="flex items-center gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">PAC :</p>
                    <p className="text-xl font-bold text-black">{sale.pac}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">
                      Safety :
                    </p>
                    <p className="text-xl font-bold text-black">
                      {sale.safety}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-[45%]">
                    <p className="text-sm font-medium text-slate-800">
                      Safety Reserve :
                    </p>
                    <p className="text-xl font-bold text-black">
                      {sale.reserve}
                    </p>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel value="3" style={{ padding: "0", margin: "0" }}>
              <div className="py-6">
                <div className="flex items-center justify-between mb-6 ">
                  <h3 className="text-lg font-bold w-[45%]">Documents</h3>
                  <div className="">
                    <div className="flex flex-row px-4 py-2 text-md font-bold text-white bg-[#003160] rounded-full  gap-x-2">
                      <span>Gross Profit :</span>
                      <p>{sale.grossProfit}</p>
                    </div>
                  </div>
                </div>
                {sale?.documentUrl?.length > 0 ? (
                  sale?.documentUrl?.map((doc, index) => (
                    <div className="flex justify-between gap-4 items-center mb-4 ">
                      <h4 className=" whitespace-nowrap">
                        Document {index + 1}:
                      </h4>
                      <input
                        type="text"
                        value={doc}
                        readOnly
                        className="w-full p-2 border rounded"
                      />
                      <button
                        className="px-6 py-2.5 text-white bg-[#003160] rounded-lg"
                        onClick={() => {
                          openDocument(doc);
                        }}
                      >
                        Open
                      </button>
                    </div>
                  ))
                ) : (
                  <div>No Document Added</div>
                )}

                {isModalOpen ? (
                  <DocumentModal
                    onRequestClose={closeDocument}
                    fileURL={selectedURL}
                    fileType={fileType}
                    isOpen={isModalOpen}
                  />
                ) : null}
              </div>
            </TabPanel>
          </TabContext>
        </Box>
      </div>
    </div>
  );
};

export default InsuranceUpload;
