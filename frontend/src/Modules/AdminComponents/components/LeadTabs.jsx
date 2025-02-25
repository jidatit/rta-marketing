// import TabContext from "@mui/lab/TabContext";
// import TabList from "@mui/lab/TabList";
// import TabPanel from "@mui/lab/TabPanel";
// import { Box, Tab, Tabs } from "@mui/material";
// import React, { useState } from "react";

// const LeadTabs = ({
//   leadSources,
//   setLeadSources,
//   SalesPerson,
//   setSalesPerson,
//   setTotalLeads,
// }) => {
//   const [value, setValue] = useState("one");
//   console.log("value", value);

//   const handleChange = (newValue) => {
//     setValue(newValue);
//   };
//   return (
//     <div className="px-6">
//       <Box sx={{ width: "100%" }}>
//         <Tabs
//           value={value}
//           onChange={handleChange}
//           aria-label="wrapped label tabs example"
//         >
//           <Tab value="one" label="Source Analytics" wrapped />
//           <Tab value="two" label="Leads" />
//         </Tabs>
//       </Box>
//     </div>
//   );
// };

// export default LeadTabs;

import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { Box, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";
import LeadsPageVA from "../../VirtualAssistantComponents/components/LeadsTableAll";
import LeadPagesAnalytics from "./LeadPagesAnalytics";

const LeadTabs = ({
  leadSources,
  setLeadSources,
  SalesPerson,
  setSalesPerson,
  setTotalLeads,
}) => {
  const [value, setValue] = useState("one");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div className="">
      <TabContext value={value}>
        <Box sx={{ width: "100%" }}>
          <TabList
            onChange={handleChange}
            aria-label="wrapped label tabs example"
            sx={{
              "& .MuiTabs-indicator": { backgroundColor: "#003160" },
              paddingLeft: "16px", // Active tab indicator color
            }}
          >
            <Tab
              value="one"
              label="Source Analytics"
              wrapped
              sx={{
                fontWeight: "bold",
                "&.Mui-selected": { color: "#003160" },
                "&:hover": { color: "#003160" },
              }}
            />
            <Tab
              value="two"
              label="Leads"
              sx={{
                fontWeight: "bold",
                "&.Mui-selected": { color: "#003160" },
                "&:hover": { color: "#003160" },
              }}
            />
          </TabList>
        </Box>

        {/* Tab Panels */}
        <TabPanel value="one">
          <LeadPagesAnalytics />
        </TabPanel>
        <TabPanel value="two">
          <LeadsPageVA
            leadSources={leadSources}
            setLeadSources={setLeadSources}
            SalesPerson={SalesPerson}
            setSalesPerson={setSalesPerson}
            setTotalLeads={setTotalLeads}
          />
        </TabPanel>
      </TabContext>
    </div>
  );
};

export default LeadTabs;
