import React, { useEffect, useState, useRef } from "react";
import {
  FiSun,
  FiMoon,
  FiCalendar,
  FiDownload,
  FiFolder,
  FiChevronLeft,
  FiActivity,
  FiFileText,
  FiInfo,
} from "react-icons/fi";
import * as XLSX from "xlsx";
import axios from "axios";
import "./index.css";

function Breadcrumbs({ stack, isDark, onNavigateTo }) {
  return (
    <div className="mb-4 text-sm flex flex-wrap items-center space-x-1">
      <span
        className={
          "cursor-pointer hover:underline " +
          (isDark ? "text-cyan-400" : "text-cyan-700")
        }
        onClick={() => onNavigateTo(0)}
      >
        Home
      </span>
      {stack.map((item, index) => (
        <React.Fragment key={index}>
          <span className={isDark ? "text-gray-500" : "text-gray-400"}>/</span>
          <span
            className={
              "cursor-pointer hover:underline " +
              (isDark ? "text-cyan-400" : "text-cyan-700")
            }
            onClick={() => onNavigateTo(index + 1)}
          >
            {item.title}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

function Card({ title, subtitle, description, onClick, icon, isDark, onMore }) {
  const clickableClass = onClick ? "cursor-pointer hover:scale-105" : "";

  const truncate = (text) => {
    if (typeof text !== "string") return "";
    return text.length > 50 ? text.substring(0, 50) + "..." : text;
  };

  const isSubtitleTruncated = subtitle && subtitle.length > 50;
  const isDescriptionTruncated = description && description.length > 50;

  return (
    <div
      onClick={onClick}
      className={
        "group relative overflow-hidden rounded-xl border p-6 transition-all duration-300 " +
        clickableClass +
        " " +
        (isDark
          ? "bg-gray-800/40 border-gray-700/50 hover:border-cyan-500/50"
          : "bg-white/60 border-gray-200/50 hover:border-cyan-500/50")
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <h3
            className={
              "text-xl font-bold " + (isDark ? "text-white" : "text-gray-900")
            }
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className={
                "text-sm overflow-hidden text-ellipsis break-words " +
                (isDark ? "text-gray-400" : "text-gray-600")
              }
            >
              {typeof subtitle === "object"
                ? truncate(JSON.stringify(subtitle))
                : truncate(subtitle)}
              {isSubtitleTruncated && (
                <button
                  className="ml-1 text-cyan-500 hover:underline text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMore(subtitle, "Subtitle");
                  }}
                >
                  More
                </button>
              )}
            </p>
          )}
        </div>
        {icon && <div className="text-2xl text-cyan-500">{icon}</div>}
      </div>

      {description && (
        <div className="mt-2 text-sm">
          <span
            className={
              "block overflow-hidden text-ellipsis " +
              (isDark ? "text-gray-300" : "text-gray-700")
            }
          >
            {truncate(description)}
            {isDescriptionTruncated && (
              <button
                className="ml-1 text-cyan-500 hover:underline text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onMore(description, "Description");
                }}
              >
                More
              </button>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

function CustomDropdown({ options, selected, onChange, isDark }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className={
        "relative inline-block text-left " +
        (isDark ? "text-gray-300" : "text-gray-700")
      }
    >
      <button
        type="button"
        className={
          "inline-flex justify-between items-center w-52 px-3 py-2 rounded-md border overflow-hidden " +
          (isDark
            ? "bg-gray-800 border-gray-600 hover:border-cyan-500 cursor-pointer"
            : "bg-white border-gray-300 hover:border-cyan-500 cursor-pointer")
        }
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="block truncate w-full text-left">{selected}</span>
        <svg
          className={`ml-2 h-4 w-4 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <ul
          className={
            "absolute mt-1 w-full max-h-40 overflow-y-auto rounded-md border shadow-lg z-10 " +
            (isDark
              ? "bg-gray-800 border-gray-600 text-gray-300"
              : "bg-white border-gray-300 text-gray-700")
          }
        >
          {options.map((option, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-cyan-500 hover:text-white cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [descriptionModal, setDescriptionModal] = useState({
    show: false,
    text: "",
    type: "", // e.g., "Subtitle" or "Description"
  });

  const [dashboardJson, setDashboardJson] = useState({});
  const [refLink, setRefLink] = useState();
  const [nestedViewStack, setNestedViewStack] = useState([]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleBreadcrumbNavigate = (level) => {
    if (level === 0) {
      setNestedViewStack([]);
    } else {
      setNestedViewStack((prev) => prev.slice(0, level));
    }
  };

  // Fetch ref link
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          "/api/x_nuvo_nsm/nuvolo_license/nsmKbInfo"
        );
        setRefLink(
          response &&
            response.data &&
            response.data.result &&
            response.data.result.value
        );
      } catch (err) {
        console.error("Error fetching reference link:", err);
      }
    })();
  }, []);

  // Fetch dates
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          "/api/now/table/x_nuvo_nsm_nuvolo_sub_report?sysparm_query=ORDERBYDESCsys_created_on&sysparm_fields=report_generated_date"
        );
        const dates = response.data.result.map(
          (item) => item.report_generated_date
        );
        setAvailableDates(dates);
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      } catch (err) {
        console.error("Error fetching dates:", err);
      }
    })();
  }, []);

  // Fetch dashboard JSON
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "/api/x_nuvo_nsm/nuvolo_license/fecthResponse/" + selectedDate
        );
        setDashboardJson(response.data.result);
        setNestedViewStack([]);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
      setLoading(false);
    })();
  }, [selectedDate]);

  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;

    return str
      .replace(/[‘’]/g, "'") // smart single quotes to straight
      .replace(/[“”]/g, '"') // smart double quotes to straight
      .replace(/[–—]/g, "-") // en dash/em dash to hyphen
      .replace(/[•]/g, "*") // bullet to asterisk
      .replace(/[^\x00-\x7F]/g, ""); // remove other non-ASCII chars
  };

  const sanitizeData = (data) => {
    if (typeof data === "string") {
      return sanitizeString(data);
    }
    if (Array.isArray(data)) {
      return data.map(sanitizeData);
    }
    if (typeof data === "object" && data !== null) {
      const newObj = {};
      Object.entries(data).forEach(([key, val]) => {
        newObj[key] = sanitizeData(val);
      });
      return newObj;
    }
    return data;
  };

  const exportJsonToExcel = (result) => {
    const sanitizedResult = sanitizeData(result);
    const workbook = XLSX.utils.book_new();

    const createSheetFromData = (data) => {
      let wsData = [];

      if (Array.isArray(data)) {
        if (data.length === 0) return XLSX.utils.aoa_to_sheet([]);
        if (typeof data[0] === "object") {
          wsData.push(Object.keys(data[0]));
          data.forEach((item) => wsData.push(Object.values(item)));
        } else {
          data.forEach((item) => wsData.push([item]));
        }
      } else if (typeof data === "object") {
        wsData.push(["Key", "Job Name", "Description", "Result"]);
        Object.entries(data).forEach(([key, val]) => {
          if (typeof val === "object" && val !== null) {
            wsData.push([
              key,
              val.job_name ?? "",
              val.description ?? "",
              typeof val.result === "object"
                ? JSON.stringify(val.result)
                : val.result,
            ]);
          } else {
            wsData.push([key, "", "", val]);
          }
        });
      } else {
        wsData.push(["Value"]);
        wsData.push([data]);
      }

      return XLSX.utils.aoa_to_sheet(wsData);
    };

    const parseDeepNestedResult = (nestedResult) => {
      const rows = [["Category", "Subcategory", "Count"]];

      Object.entries(nestedResult).forEach(([category, data]) => {
        if (data && typeof data.result === "object") {
          Object.entries(data.result).forEach(([subcat, val]) => {
            const count = val?.result ?? null;
            rows.push([category, subcat, count]);
          });
        } else {
          rows.push([category, "", data?.result ?? data]);
        }
      });

      return XLSX.utils.aoa_to_sheet(rows);
    };

    const isDeepNestedPattern = (val) => {
      if (
        typeof val === "object" &&
        val !== null &&
        "result" in val &&
        typeof val.result === "object"
      ) {
        const firstKey = Object.keys(val.result)[0];
        const firstVal = val.result[firstKey];
        return (
          typeof firstVal === "object" &&
          firstVal !== null &&
          "result" in firstVal
        );
      }
      return false;
    };

    Object.entries(sanitizedResult).forEach(([key, value]) => {
      let sheet;

      if (key === "configVersion" || key === "nsmVersion") {
        sheet = XLSX.utils.aoa_to_sheet([[key], [value]]);
        XLSX.utils.book_append_sheet(workbook, sheet, key.substring(0, 31));
        return;
      }

      if (
        typeof value === "object" &&
        value !== null &&
        "result" in value &&
        typeof value.result === "object"
      ) {
        // ✅ Special case: deep nested result pattern
        if (isDeepNestedPattern(value)) {
          const parsedSheet = parseDeepNestedResult(value.result);
          const sheetName = (value.job_name || key).substring(0, 31);
          XLSX.utils.book_append_sheet(workbook, parsedSheet, sheetName);
          return;
        }

        if (Array.isArray(value.result)) {
          sheet = createSheetFromData(value.result);
        } else if (typeof value.result === "object") {
          sheet = createSheetFromData(value.result);
        } else {
          sheet = XLSX.utils.aoa_to_sheet([[value.job_name], [value.result]]);
        }
      } else if (typeof value === "object" && value !== null) {
        sheet = createSheetFromData(value);
      } else {
        sheet = XLSX.utils.aoa_to_sheet([[key], [value]]);
      }

      XLSX.utils.book_append_sheet(workbook, sheet, key.substring(0, 31));
    });

    XLSX.writeFile(workbook, "exported_data.xlsx");
  };

  const currentView = () => {
    if (nestedViewStack.length === 0) {
      return { title: null, data: dashboardJson };
    } else {
      return nestedViewStack[nestedViewStack.length - 1];
    }
  };

  const handleNavigateInto = (title, data) => {
    setNestedViewStack((prev) => [...prev, { title: title, data: data }]);
  };

  const handleGoBack = () => {
    setNestedViewStack((prev) => {
      const newStack = [...prev];
      newStack.pop();
      return newStack;
    });
  };

  const isDrillable = (value) => {
    if (value && typeof value === "object") {
      if ("result" in value) {
        const resultVal = value.result;
        return typeof resultVal === "object" && !Array.isArray(resultVal);
      }
      return true;
    }
    return false;
  };

  const renderCardsForData = (data) => {
    if (!data || typeof data !== "object") {
      return <p className="text-sm text-gray-400">No data to display</p>;
    }

    return Object.entries(data).map(([key, value]) => {
      let title = value.job_name || key;
      let subtitle = "";
      let description = "";
      let drillable = false;
      let onClick = null;
      let icon = <FiFileText />;

      if (typeof value === "string") {
        subtitle = value;
        drillable = false;
      } else if (typeof value === "object" && value !== null) {
        if ("result" in value) {
          const result = value.result;
          if (typeof result === "string" || typeof result === "number") {
            subtitle = String(result);
            drillable = false;
          } else if (Array.isArray(result)) {
            subtitle = `${result.length}`;
            drillable = false;
          } else if (typeof result === "object" && result !== null) {
            subtitle = "";
            drillable = true;
            onClick = () => handleNavigateInto(title, result);
            icon = <FiFolder />;
          }
        } else {
          subtitle = "Nested Object";
          drillable = true;
          onClick = () => handleNavigateInto(title, value);
          icon = <FiFolder />;
        }

        if (value.job_name) {
          description = value.description;
        }
      } else {
        subtitle = String(value);
      }

      return (
        <Card
          key={key}
          title={title}
          subtitle={subtitle}
          description={description}
          onClick={onClick}
          icon={icon}
          isDark={isDark}
          onMore={(text, type) =>
            setDescriptionModal({ show: true, text, type })
          }
        />
      );
    });
  };

  const { title: currentTitle, data: currentData } = currentView();

  return (
    <div
      className={
        "min-h-screen transition-all duration-300 " +
        (isDark ? "bg-gray-900" : "bg-gray-100")
      }
    >
      {descriptionModal.show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() =>
            setDescriptionModal({ show: false, text: "", type: "" })
          }
        >
          <div
            className={
              "max-w-md w-full rounded-lg p-6 relative shadow-lg " +
              (isDark
                ? "bg-gray-900 text-white border border-gray-700"
                : "bg-white text-gray-900 border border-gray-200")
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={
                "absolute top-2 right-3 text-xl " +
                (isDark
                  ? "text-gray-400 hover:text-red-400"
                  : "text-gray-600 hover:text-red-600")
              }
              onClick={() =>
                setDescriptionModal({ show: false, text: "", type: "" })
              }
            >
              &times;
            </button>
            <h2
              className={
                "text-lg font-semibold mb-2 " +
                (isDark ? "text-white" : "text-gray-900")
              }
            >
              {descriptionModal.type || "Details"}
            </h2>
            <div className="text-sm whitespace-pre-wrap break-words overflow-x-auto max-w-full max-h-[70vh] overflow-y-auto">
              <pre className={isDark ? "text-gray-300" : "text-gray-700"}>
                {typeof descriptionModal.text === "object"
                  ? JSON.stringify(descriptionModal.text, null, 2)
                  : descriptionModal.text}
              </pre>
            </div>
          </div>
        </div>
      )}

      <header
        className={
          "backdrop-blur-md border-b " +
          (isDark
            ? "bg-gray-900/80 border-gray-700/50"
            : "bg-white/80 border-gray-200/50")
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
              <FiActivity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Nuvolo Subscription Management
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div
              className={
                "flex items-center space-x-2 px-3 py-2 rounded-lg border " +
                (isDark
                  ? "bg-gray-800 border-gray-600"
                  : "bg-white border-gray-300")
              }
            >
              <FiCalendar
                className={isDark ? "text-gray-400" : "text-gray-600"}
              />

              <CustomDropdown
                options={availableDates}
                selected={selectedDate}
                onChange={setSelectedDate}
                isDark={isDark}
              />
            </div>

            <button
              onClick={() => {
                setLoading(true);
                axios
                  .get("/api/x_nuvo_nsm/nuvolo_license/ondemandreport")
                  .then((res) => {
                    return axios
                      .get(
                        "/api/now/table/x_nuvo_nsm_nuvolo_sub_report?sysparm_query=ORDERBYDESCsys_created_on&sysparm_fields=report_generated_date"
                      )
                      .then((dateResponse) => {
                        const dates = dateResponse.data.result.map(
                          (item) => item.report_generated_date.split(" ")[0]
                        );
                        setAvailableDates(dates);
                        const today = new Date().toISOString().split("T")[0];
                        if (dates.includes(today)) {
                          setSelectedDate(today);
                        } else {
                          setSelectedDate(dates[0]);
                        }
                        setDashboardJson(res.data.result || {});
                        setNestedViewStack([]);
                      });
                  })
                  .catch((err) =>
                    console.error("Error in on-demand report:", err)
                  )
                  .finally(() => setLoading(false));
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-500 text-sm font-medium"
            >
              <FiActivity className="w-4 h-4" />
              <span>On Demand Report</span>
            </button>

            <button
              onClick={() => exportJsonToExcel(dashboardJson)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700"
            >
              <FiDownload className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>

            <button onClick={toggleTheme} className="p-2 rounded-lg">
              {isDark ? (
                <FiSun className="text-yellow-400" />
              ) : (
                <FiMoon className="text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2
            className={
              "text-3xl font-bold mb-2 " +
              (isDark ? "text-white" : "text-gray-900")
            }
          >
            Analytics Overview
          </h2>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Real-time insights and performance metrics
          </p>
          {refLink && (
            <a
              href={refLink}
              target="_blank"
              rel="noopener noreferrer"
              className={
                "underline text-sm mt-2 inline-block " +
                (isDark ? "text-blue-400" : "text-blue-700")
              }
            >
              Learn what data is collected & how it’s processed
            </a>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p
              className={
                isDark
                  ? "mt-4 text-sm text-gray-300"
                  : "mt-4 text-sm text-gray-600"
              }
            >
              {"Loading data for " + selectedDate + "..."}
            </p>
          </div>
        ) : (
          <>
            {nestedViewStack.length > 0 && (
              <Breadcrumbs
                stack={nestedViewStack}
                isDark={isDark}
                onNavigateTo={handleBreadcrumbNavigate}
              />
            )}
            {nestedViewStack.length > 0 && (
              <button
                onClick={handleGoBack}
                className="flex items-center mb-4 text-sm text-cyan-500 hover:underline"
              >
                <FiChevronLeft className="mr-1" /> Back to Previous
              </button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {renderCardsForData(currentData)}
              functio
            </div>
          </>
        )}
      </main>
    </div>
  );
}
