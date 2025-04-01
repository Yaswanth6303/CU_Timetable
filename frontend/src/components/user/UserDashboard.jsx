import { useState, useEffect } from "react";
import { FileText, Eye } from "lucide-react";
import axios from "axios";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ScrollArea } from "../ui/scroll-area";
import FileViewModal from "./FileViewModal";

function UserDashboard() {
  const [files, setFiles] = useState([]);
  const [fileData, setFileData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/`);
      setFiles(response.data.files);
      setError("");
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Unable to fetch files");
    }
  };

  const fetchFileData = async (fileId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/view/${fileId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error viewing file:", error);
      setError("Error viewing file");
      return null;
    }
  };

  const viewFile = async (fileId) => {
    const data = await fetchFileData(fileId);
    if (data) {
      setFileData(data);
      setIsModalOpen(true);
      setError("");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFileData(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            User Dashboard
          </h1>
          <p className="text-gray-600">Manage and view your timetables</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Available Timetables
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {files.length > 0 ? (
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <div className="space-y-4 p-4">
                  {files.map((file) => (
                    <Card
                      key={file._id}
                      className="overflow-hidden transition-all hover:shadow-md"
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {removeSpecificExtension(file.fileName)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Uploaded on:{" "}
                              {new Date(file.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => viewFile(file.file)}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-12 flex flex-col items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="50px"
                  height="50px"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mb-4"
                >
                  <path
                    d="M12 8L12 12"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16.01L12.01 15.9989"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 3H4V6"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 11V13"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 11V13"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 3H20V6"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 21H4V18"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M15 21H20V18"
                    stroke="#000000"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No timetables available to be viewed.
                  </h3>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {fileData && (
          <FileViewModal
            isOpen={isModalOpen}
            onClose={closeModal}
            allFiles={files}
            initialFileData={fileData}
            fetchFileData={fetchFileData}
          />
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
