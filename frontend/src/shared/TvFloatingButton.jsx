import { Tv } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingTVButton = () => {
  return (
    <Link
      to="/tv"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg transition-colors duration-200 cursor-pointer"
      aria-label="Open TV View"
    >
      <Tv className="w-6 h-6 text-white" />
    </Link>
  );
};

export default FloatingTVButton;
