import DatePicker from "react-datepicker";
import { FaCalendarAlt } from "react-icons/fa";

const Filters = ({
  leadSources = [],
  salesPersons = [""],
  onFilterChange,
  showFilters,
  otherFilters = true,
  handleFilterToggle,
  selectedLeadSource,
  setSelectedLeadSource,
  selectedSalesPerson,
  setSelectedSalesPerson,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}) => {
  const handleApplyFilters = () => {
    onFilterChange({
      selectedLeadSource,
      selectedSalesPerson,
      startDate,
      endDate,
    });
  };

  return (
    <div className="w-full">
      <button
        onClick={handleFilterToggle}
        className="flex items-center px-4 py-3 ml-auto text-white bg-[#003160] rounded-lg"
      >
        <FaCalendarAlt className="mr-2" />
        Toggle Filters
      </button>

      {showFilters && (
        <div className="mt-4 flex items-center justify-end">
          {/* Sales Person Dropdown */}
          {otherFilters && (
            <>
              <div className="relative w-52 mx-4">
                <select
                  value={selectedSalesPerson}
                  onChange={(e) => setSelectedSalesPerson(e.target.value)}
                  className="w-full px-8 py-2 pr-4 border border-gray-300 rounded-md bg-white text-gray-500 cursor-pointer"
                >
                  <option value="">Sales Person</option>
                  {salesPersons?.map((person) => (
                    <option key={person.uid} value={person.uid}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative w-52 mx-4">
                <select
                  value={selectedLeadSource}
                  onChange={(e) => setSelectedLeadSource(e.target.value)}
                  className="w-full px-8 py-2 pr-4 border border-gray-300 rounded-md bg-white text-gray-500 cursor-pointer"
                >
                  <option value="">Lead Source</option>
                  {leadSources?.map((lead) => (
                    <option key={lead} value={lead}>
                      {lead}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {/* Date Pickers */}
          <div className="flex items-center mx-4">
            <label className="mr-2">From:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="dd MMM yyyy"
              className="px-3 py-2 border-1 border-gray-300 rounded-lg"
            />
            <label className="ml-4 mr-2">To:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="dd MMM yyyy"
              className="px-3 py-2 border-1 border-gray-300 rounded-lg"
            />
          </div>

          {/* Apply and Clear Filters */}
          <button
            onClick={handleApplyFilters}
            className="px-3 py-2 mx-4 text-white bg-[#003160] rounded-lg"
          >
            Apply Filter
          </button>
          <button
            onClick={() => {
              setSelectedLeadSource("");
              setSelectedSalesPerson("");
              setStartDate(null);
              setEndDate(null);
              onFilterChange({
                selectedLeadSource: "",
                selectedSalesPerson: "",
                startDate: null,
                endDate: null,
              });
            }}
            className="px-3 py-2 text-white bg-red-500 rounded-lg"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};
export default Filters;
