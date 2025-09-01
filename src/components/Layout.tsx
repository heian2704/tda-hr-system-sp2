// src/components/Layout.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Search, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile"; // Assuming this hook correctly detects mobile
import { LanguageProvider, useLanguage } from "../contexts/LanguageContext";

// Manual Burmese translations and number converter (as previously defined)
const burmeseWeekdays = [
  "တနင်္ဂနွေနေ့", "တနင်္လာနေ့", "အင်္ဂါနေ့", "ဗုဒ္ဓဟူးနေ့",
  "ကြာသပတေးနေ့", "သောကြာနေ့", "စနေနေ့",
];

const burmeseMonths = [
  "ဇန်နဝါရီ", "ဖေဖော်ဝါရီ", "မတ်", "ဧပြီ", "မေ", "ဇွန်",
  "ဇူလိုင်", "ဩဂုတ်", "စက်တင်ဘာ", "အောက်တိုဘာ", "နိုဝင်ဘာ", "ဒီဇင်ဘာ",
];

const convertToBurmeseNumerals = (num: number): string => {
  const burmeseDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  return String(num).split('').map(digit => burmeseDigits[parseInt(digit, 10)]).join('');
};


interface LayoutProps {
  children: React.ReactNode;
  setIsLoggedIn: (value: boolean) => void;
}

const LayoutContent = ({ children, setIsLoggedIn }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, translations } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const isMobile = useIsMobile();
  const sidebarItems = translations.sidebar;
  const [headerHeight, setHeaderHeight] = useState(80); // Default height, will be updated

  const today = new Date();
  let displayDay: string;
  let displayDate: string;

  if (language === "English") {
    displayDay = today.toLocaleDateString("en-US", { weekday: "long" });
    displayDate = today.toLocaleDateString("en-GB");
  } else {
    const dayOfWeek = today.getDay();
    const month = today.getMonth();
    const dateNum = today.getDate();
    const yearNum = today.getFullYear();
    displayDay = burmeseWeekdays[dayOfWeek];
    displayDate = `${convertToBurmeseNumerals(dateNum)} ${burmeseMonths[month]} ${convertToBurmeseNumerals(yearNum)}`;
  }

  // Get current search query from URL
  const currentSearchQuery = searchParams.get('q') || '';

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect to dynamically set header height for content padding
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight(); // Initial call
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  // Effect to close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]); // Only re-run when path or mobile status changes. No need for sidebarOpen in dependency for closing it *because* path changed.

  const handleBurgerClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleSelectLanguage = (lang: "English" | "Burmese") => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    if (newQuery) {
      setSearchParams({ q: newQuery });
    } else {
      setSearchParams({});
    }
  }, [setSearchParams]); // setSearchParams should be in the dependency array for useCallback

  return (
    <div className="flex flex-col min-h-screen font-poppins bg-white overflow-hidden">
      {/* Header */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 w-full z-40 sm:z-30 flex flex-col sm:flex-row sm:h-[80px] items-center justify-between px-4 md:px-8 border-b border-[#E5E5E5] bg-[#F8F8F8] py-3"
      >
        <div className="flex justify-between items-center w-full sm:w-auto">
          <div className="flex items-center text-[28px] font-semibold font-inter">
            <span className="text-[#FF6767]">TDA</span>
            <span className="text-black">: HR</span>
          </div>
          {isMobile && (
            <button
              onClick={handleBurgerClick}
              className="md:hidden text-[#FF6767] p-2 relative z-50" // Added z-50 for clickability
              aria-label="Toggle menu"
              tabIndex={0} // Added for accessibility
              role="button" // Added for accessibility
            >
              {sidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          )}
        </div>

        {/* Search + Language */}
        <div className={`flex items-center gap-2 sm:gap-4 ${isMobile ? "w-full mt-2" : "flex-shrink-0"}`}>
          <div className="flex items-center w-full max-w-xs flex-grow px-4 py-2 rounded-[10px] outline outline-1 outline-[#FF676733]">
            <Search size={20} className="text-[#FF6767] mr-2" />
            <input
              type="text"
              placeholder={translations.searchPlaceholder}
              className="bg-transparent placeholder-[#16151C33] text-[16px] font-light leading-[24px] focus:outline-none w-full"
              value={currentSearchQuery}
              onChange={handleSearchInputChange}
            />
          </div>

          <div
            ref={dropdownRef}
            className="flex items-center justify-center h-[38px] px-2 sm:px-3 rounded-[10px] outline outline-1 outline-[#FF676733] gap-1 sm:gap-2 relative cursor-pointer select-none flex-shrink-0"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-[#16151C] text-[12px] sm:text-[14px] font-light whitespace-nowrap">{language}</span>
            <ChevronDown size={18} className="text-[#16151C]" />
            {dropdownOpen && (
              <div className="absolute top-full mt-1 right-0 bg-white border border-gray-300 rounded shadow-md min-w-[120px] z-50">
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[14px]"
                  onClick={() => handleSelectLanguage("English")}
                >
                  English
                </div>
                <div
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[14px]"
                  onClick={() => handleSelectLanguage("Burmese")}
                >
                  Burmese
                </div>
              </div>
            )}
          </div>

          {!isMobile && (
            <div className="text-right flex-shrink-0 min-w-0">
              <div className="text-[13px] sm:text-[15px] text-black font-medium font-inter truncate" title={displayDay}>{displayDay}</div>
              <div className="text-[12px] sm:text-[14px] text-[#3ABEFF] font-medium font-inter truncate" title={displayDate}>{displayDate}</div>
            </div>
          )}
        </div>
      </header>

      {/* Layout Body */}
      <div className="flex flex-1" style={{ marginTop: `${headerHeight}px` }}>
        {/* Sidebar */}
        <aside
          className={`${
            isMobile
              ? `fixed top-0 left-0 h-screen w-[260px] bg-[#FAFAFA] pt-4 px-4 border-r border-gray-200 z-50 transform transition-transform duration-300 ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } overflow-y-auto`
              : "hidden sm:flex flex-col w-[260px] bg-[#FAFAFA] pt-4 px-4 border-r border-gray-200"
          }`}
        >
          {/* Close button for mobile sidebar (appears when open) */}
          {isMobile && sidebarOpen && (
            <div className="flex justify-end pr-2 pt-2 pb-4"> {/* Adjust padding as needed */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:text-gray-800"
                aria-label="Close sidebar"
              >
                <X size={28} />
              </button>
            </div>
          )}
          <nav className="flex-1 space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobile) setSidebarOpen(false); // Close sidebar on nav item click
                  // Preserve search query if it exists
                  if (currentSearchQuery) {
                    navigate({ pathname: item.path, search: `?q=${currentSearchQuery}` });
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`relative flex items-center w-full h-[44px] pl-4 rounded-r-[10px] transition-all duration-150 ${
                  location.pathname === item.path
                    ? "bg-[rgba(255,103,103,0.05)] text-[#FF6767] font-semibold"
                    : "text-[#16151C] font-light hover:bg-gray-100"
                }`}
              >
                <div
                  className={`absolute left-0 top-0 h-full w-[3px] rounded-[10px] ${
                    location.pathname === item.path ? "bg-[#FF6767]" : "opacity-0"
                  }`}
                />
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="text-[15px] leading-[22px]">{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-4 py-2 bg-[#FF6767] text-white rounded-lg text-sm font-medium hover:bg-red-600"
            >
              <LogOut size={16} className="mr-2" />
              {translations.logout}
            </button>
          </div>
        </aside>

        {/* Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-30 z-40"
            onClick={() => setSidebarOpen(false)} // Close sidebar when clicking overlay
            aria-hidden="true"
          />
        )}

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50">
          {React.Children.map(children, (child) =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<any>, {
                  currentPath: location.pathname,
                  searchQuery: currentSearchQuery,
                })
              : child
          )}
        </main>
      </div>
    </div>
  );
};

const Layout = ({ children, setIsLoggedIn }: LayoutProps) => (
  <LanguageProvider>
    <LayoutContent setIsLoggedIn={setIsLoggedIn}>{children}</LayoutContent>
  </LanguageProvider>
);

export default Layout;
