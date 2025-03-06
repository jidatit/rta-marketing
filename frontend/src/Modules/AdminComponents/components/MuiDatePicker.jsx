import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { TextField } from "@mui/material";

const CustomDateRangePicker = ({
  timeRangeFilter,
  dateFrom,
  dateTo,
  handleCustomDateChange,
}) => {
  return (
    <>
      {timeRangeFilter !== "custom" ? (
        ""
      ) : (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div
            className={`flex gap-6 ${
              timeRangeFilter !== "custom" ? "opacity-50" : ""
            }`}
          >
            <div className="flex flex-col gap-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Date From:
              </label>
              <DatePicker
                value={dateFrom}
                onChange={(newDate) => {
                  if (newDate) {
                    handleCustomDateChange(
                      newDate.toISOString().split("T")[0],
                      true
                    );
                  }
                }}
                disabled={timeRangeFilter !== "custom"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    className="bg-white rounded shadow-sm "
                    InputProps={{
                      ...params.InputProps,
                      className:
                        "border rounded text-gray-700 hover:bg-gray-50 transition-colors",
                    }}
                  />
                )}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Date To:
              </label>
              <DatePicker
                value={dateTo}
                onChange={(newDate) => {
                  if (newDate) {
                    handleCustomDateChange(
                      newDate.toISOString().split("T")[0],
                      false
                    );
                  }
                }}
                disabled={timeRangeFilter !== "custom"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    className="bg-white rounded shadow-sm"
                    InputProps={{
                      ...params.InputProps,
                      className:
                        "border rounded text-gray-700 hover:bg-gray-50 transition-colors",
                    }}
                  />
                )}
              />
            </div>
          </div>
        </LocalizationProvider>
      )}
    </>
  );
};

export default CustomDateRangePicker;
