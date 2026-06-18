import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center mb-6 shadow-lg">
            <Heart className="w-12 h-12 text-teal-600" />
          </div>
          <h1 className="text-7xl font-bold text-teal-600 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">Page Not Found</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Oops! The page you're looking for seems to have wandered off. Let's get you back to safety.
          </p>
        </div>
        <div className="space-y-3">
          <Button
            asChild
            size="lg"
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-200 hover:shadow-xl transition-all duration-300 font-bold py-6 rounded-xl"
          >
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
