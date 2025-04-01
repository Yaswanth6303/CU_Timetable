import { useState, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent } from "../../ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  FileText,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";

function FileViewModal({
  isOpen,
  onClose,
  allFiles,
  initialFileData,
  fetchFileData,
}) {
  const [fileData, setFileData] = useState(initialFileData);
  const [selectedSheet, setSelectedSheet] = useState(
    initialFileData?.sheetNames[0] || ""
  );
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState({});
  const [showManualSearch, setShowManualSearch] = useState(false);
  const rowsPerPage = 30;

  // Date and Time Formatting Functions
  const excelDateToJSDate = (excelDate) =>
    new Date((excelDate - 25569) * 86400 * 1000);

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (decimalTime) => {
    const hours = Math.floor(decimalTime * 24);
    const minutes = Math.round((decimalTime * 24 - hours) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  // Helper function to format cell value based on column type
  const formatCellValue = (value, header) => {
    if (value === null || value === undefined) return "";

    if (typeof value === "number") {
      if (header.toLowerCase().includes("date")) {
        return formatDate(excelDateToJSDate(value));
      }
      if (header.toLowerCase().includes("time")) {
        return formatTime(value);
      }
    }
    return String(value).trim();
  };

  // Helper function to normalize values for comparison
  const normalizeValue = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).toLowerCase().trim();
  };

  useEffect(() => {
    setFileData(initialFileData);
    setSelectedSheet(initialFileData?.sheetNames[0] || "");
    setFilters({});
    setSearchQuery({});
    setCurrentPage(1);
  }, [initialFileData]);

  const handleFileChange = async (fileId) => {
    const newFileData = await fetchFileData(fileId);
    setFileData(newFileData);
    setSelectedSheet(newFileData.sheetNames[0]);
    setFilters({});
    setSearchQuery({});
    setCurrentPage(1);
  };

  const handleManualSearchChange = (key, value) => {
    setSearchQuery((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const toggleFilter = (column, value) => {
    setFilters((prevFilters) => {
      const columnFilters = prevFilters[column] || [];
      if (columnFilters.includes(value)) {
        return {
          ...prevFilters,
          [column]: columnFilters.filter((v) => v !== value),
        };
      } else {
        return { ...prevFilters, [column]: [...columnFilters, value] };
      }
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({});
    setSearchQuery({});
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    if (!selectedSheet) return [];
    let filtered = fileData.sheets[selectedSheet]?.data || [];

    // Apply manual search filters
    Object.entries(searchQuery).forEach(([key, value]) => {
      if (value) {
        const searchTerm = normalizeValue(value);
        filtered = filtered.filter((row) => {
          const cellValue = formatCellValue(row[key], key);
          return normalizeValue(cellValue).includes(searchTerm);
        });
      }
    });

    // Apply checkbox filters
    Object.entries(filters).forEach(([column, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter((row) => {
          const cellValue = formatCellValue(row[column], column);
          return values.some(
            (filterValue) =>
              normalizeValue(filterValue) === normalizeValue(cellValue)
          );
        });
      }
    });

    return filtered;
  }, [fileData, selectedSheet, filters, searchQuery]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Get unique values for filters
  const uniqueValues = useMemo(() => {
    if (!selectedSheet || !fileData.sheets[selectedSheet]) return {};

    const values = {};
    const { headers, data } = fileData.sheets[selectedSheet];

    headers.forEach((header) => {
      const uniqueSet = new Set();
      data.forEach((row) => {
        if (row[header] !== undefined && row[header] !== null) {
          const formattedValue = formatCellValue(row[header], header);
          uniqueSet.add(formattedValue);
        }
      });
      values[header] = Array.from(uniqueSet).sort();
    });

    return values;
  }, [fileData, selectedSheet]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Custom Filter Component
  const CustomFilter = ({ header, values }) => {
    const filterRef = useRef(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
      const handleScroll = (e) => {
        if (filterRef.current) {
          filterRef.current.scrollTop += e.deltaY;
          e.preventDefault(); // Prevents the default behavior which might interfere with our custom scrolling
        }
      };

      filterRef.current?.addEventListener("wheel", handleScroll, {
        passive: false,
      });
      return () =>
        filterRef.current?.removeEventListener("wheel", handleScroll);
    }, []);

    // Filter values based on search term
    const filteredValues = values.filter((value) =>
      normalizeValue(value).includes(normalizeValue(searchTerm))
    );

    return (
      <div
        ref={filterRef}
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          padding: "10px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.3) rgba(0,0,0,0.1)",
        }}
      >
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${header}`}
          className="mb-2 w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {filteredValues.map((value, i) => (
          <div key={i} className="flex items-center gap-2 py-1">
            <Checkbox
              id={`${header}-${value}`}
              checked={filters[header]?.includes(value)}
              onCheckedChange={() => toggleFilter(header, value)}
            />
            <label
              htmlFor={`${header}-${value}`}
              className="text-sm font-medium"
            >
              {value}
            </label>
          </div>
        ))}
        {filteredValues.length === 0 && (
          <div className="text-sm text-gray-500">No matches found</div>
        )}
      </div>
    );
  };

  const removeSpecificExtension = (fileName) => {
    const extensions = [".xls", ".xlsx", ".csv"];
    return extensions.reduce((name, ext) => {
      if (name.toLowerCase().endsWith(ext)) {
        return name.slice(0, -ext.length);
      }
      return name;
    }, fileName);
  };

  if (!fileData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full w-full h-screen p-0">
        {/* File Selection Header */}
        <div className="border-b">
          <div className="p-4 flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4 w-full pr-8 md:w-auto">
              <Select value={fileData.file} onValueChange={handleFileChange}>
                <SelectTrigger className="sm:w-[370px] md:w-[200px] lg:w-[280px]">
                  <SelectValue
                    placeholder={removeSpecificExtension(fileData.fileName)}
                  />
                </SelectTrigger>
                <SelectContent>
                  {allFiles.map((file) => (
                    <SelectItem key={file.file} value={file.file}>
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>{removeSpecificExtension(file.fileName)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fileData.sheetNames.length > 1 && (
                <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                  <SelectTrigger className="w-full sm:w-[198px] md:w-[200px] lg:w-[200px]">
                    <SelectValue placeholder="Select a sheet" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileData.sheetNames.map((sheetName) => (
                      <SelectItem key={sheetName} value={sheetName}>
                        {sheetName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManualSearch(!showManualSearch)}
                className="sm:w-auto"
              >
                <Search className="h-4 w-4 mr-2" />
                {showManualSearch ? "Hide Search" : "Manual Search"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="sm:w-auto"
                style={{ marginRight: "25px" }}
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area with Scroll */}
        <div className="overflow-y-auto md:h-[calc(100vh-11.5rem)]">
          {/* Manual Search Section */}
          {showManualSearch && (
            <div className="bg-gray-50 border-b">
              <div className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h4 className="text-lg font-bold">Manual Search</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-2">
                  {selectedSheet &&
                    fileData.sheets[selectedSheet].headers.map((header) => (
                      <div key={header} className="flex flex-col space-y-1.5">
                        <label
                          htmlFor={header}
                          className="text-sm font-medium text-gray-700"
                        >
                          {header}
                        </label>
                        <input
                          type="text"
                          id={header}
                          value={searchQuery[header] || ""}
                          onChange={(e) =>
                            handleManualSearchChange(header, e.target.value)
                          }
                          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400"
                          placeholder={`Search ${header}`}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Rest of the component remains the same... */}
          {/* Table Content Section */}
          <div className="overflow-x-auto bg-white transition-all duration-300 ease-in-out">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectedSheet &&
                    fileData.sheets[selectedSheet].headers.map(
                      (header, index) => (
                        <TableHead
                          key={index}
                          className="bg-gray-50 py-3 px-4 text-left text-sm font-semibold text-gray-900 transition-colors duration-300 ease-in-out hover:bg-gray-100"
                        >
                          <div className="flex items-center justify-between">
                            <span>{header}</span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 transition-all duration-300 ease-in-out hover:bg-gray-200"
                                >
                                  <Filter className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[300px] p-0 transition-transform duration-300 ease-in-out scale-95 data-[state=open]:scale-100"
                                align="start"
                                side="bottom"
                                // Remove overflowY: auto here since CustomFilter handles this internally
                                style={{
                                  maxHeight: "300px",
                                }}
                              >
                                <CustomFilter
                                  header={header}
                                  values={uniqueValues[header] || []}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </TableHead>
                      )
                    )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((row, rowIndex) => (
                    <TableRow
                      key={rowIndex}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {fileData.sheets[selectedSheet].headers.map(
                        (header, colIndex) => (
                          <TableCell
                            key={colIndex}
                            className="py-3 px-4 text-sm text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis min-w-[150px] max-w-[300px]"
                          >
                            {formatCellValue(row[header], header)}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={
                        fileData.sheets[selectedSheet]?.headers.length || 1
                      }
                      className="text-center py-8 text-gray-500"
                    >
                      No data found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination Footer */}
        <div className="border-t bg-white p-4 flex-none">
          <div className="flex flex-row justify-between items-center sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              Showing {filteredData.length} results | Page {currentPage} of{" "}
              {totalPages}
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FileViewModal;
