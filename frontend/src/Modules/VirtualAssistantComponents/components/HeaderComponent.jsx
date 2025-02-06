import React from "react";
import { FaPlus } from "react-icons/fa6";

const HeaderComponent = ({
  title = "Monthly Targets",
  buttonText = "Add Sales Target",
  showButton = true,
  onButtonClick = () => {},
  className = "",
  name = "",
  totalLeads = "",
  totalSales = "",
  showStats = false,
}) => {
  const metrics = [
    { label: "Total Leads", value: totalLeads, color: "bg-[#003160]" },
    { label: "Total Sales", value: totalSales, color: "bg-sky-400" },
  ];

  return (
    <div
      className={`flex justify-between items-start bg-white px-6 py-3 border-b border-gray-200 ${className}`}
    >
      <h2 className="text-2xl font-bold text-gray-900">
        {showButton ? title : `${title} sales`}
      </h2>

      {showButton && (
        <button
          onClick={onButtonClick}
          className="bg-[#003160] font-bold text-xl hover:bg-blue-900 text-white rounded-full shadow-sm py-4 px-14 flex items-center justify-center gap-2 h-fit transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          {buttonText}
        </button>
      )}
      {showStats && (
        <div className="flex gap-8 p-8 items-start justify-start -mt-10">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`${metric.color} rounded-full w-36 h-36 flex flex-col items-center justify-center text-white`}
            >
              <div className="text-2xl font-bold mb-2">{metric.value}</div>
              <div className="text-lg">{metric.label}</div>{" "}
              {/* Fixed this line */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HeaderComponent;
