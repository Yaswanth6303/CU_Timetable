// src/components/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import axios from "axios";
import { Button } from "../../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "../../ui/toaster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import FileUploadCard from "./FileUploadCard";
import FileListCard from "./FileListCard";
import SheetVisibilityDialog from "./SheetVisibilityDialog";
import FileViewModal from "../FileViewModal/FileViewModal";

export default function AdminDashboard({ setIsAdminAuthenticated }) {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [currentFileSheets, setCurrentFileSheets] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [deletedFiles, setDeletedFiles] = useState(new Set());
  const [localFiles, setLocalFiles] = useState([]);
  const [pendingUploads, setPendingUploads] = useState(new Set());

  const sheetVisibilityMap = files.reduce((acc, file) => {
    if (file.sheetVisibility) {
      acc[file.file] = file.sheetVisibility;
    }
    return acc;
  }, {});

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    const filteredFiles = files
      .filter((file) => !deletedFiles.has(file.file))
      .concat(
        Array.from(pendingUploads).map((file) => ({
          _id: `pending-${file.name}`,
          fileName: file.name,
          file: file,
          createdAt: new Date().toISOString(),
          isPending: true,
        }))
      );
    setLocalFiles(filteredFiles);
  }, [files, deletedFiles, pendingUploads]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}`);
      setFiles(response.data.files);
      setLocalFiles(response.data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (fileId) => {
    setDeletedFiles((prev) => new Set([...prev, fileId]));
    setPendingChanges(true);
  };

  const fetchFileData = async (fileId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/view/${fileId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error viewing file:", error);
      toast({
        title: "Error",
        description: "Failed to view file",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleApplyChanges = async () => {
    setIsUploading(true);
    try {
      // Handle uploads
      for (const file of pendingUploads) {
        const formData = new FormData();
        formData.append("file", file);
        await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData);
      }

      // Handle deletions
      for (const fileId of deletedFiles) {
        await axios.get(`${import.meta.env.VITE_API_URL}/delete/${fileId}`);
      }

      toast({
        title: "Success",
        description: "Changes applied successfully",
      });
      setDeletedFiles(new Set());
      setPendingUploads(new Set());
      setPendingChanges(false);
      setShowApplyDialog(false);
      fetchFiles();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error applying changes: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openVisibilityModal = async (fileId) => {
    try {
      const data = await fetchFileData(fileId);
      if (data) {
        setCurrentFileSheets(
          data.sheetVisibility ||
            data.sheetNames.map((name) => ({
              sheetName: name,
              isVisible: true,
            }))
        );
        setSelectedFileId(fileId);
        setIsVisibilityModalOpen(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sheet visibility settings",
        variant: "destructive",
      });
    }
  };

  const handleVisibilityChange = async () => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/update-sheet-visibility/${selectedFileId}`,
        {
          sheetVisibility: currentFileSheets,
        }
      );

      setFiles((prevFiles) =>
        prevFiles.map((file) => {
          if (file.file === selectedFileId) {
            return {
              ...file,
              sheetVisibility: currentFileSheets,
            };
          }
          return file;
        })
      );

      setLocalFiles((prevFiles) =>
        prevFiles.map((file) => {
          if (file.file === selectedFileId) {
            return {
              ...file,
              sheetVisibility: currentFileSheets,
            };
          }
          return file;
        })
      );

      toast({
        title: "Success",
        description: "Sheet visibility updated successfully",
      });

      setIsVisibilityModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sheet visibility",
        variant: "destructive",
      });
    }
  };

  const viewFile = async (fileId) => {
    const data = await fetchFileData(fileId);
    if (data) {
      setFileData(data);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFileData(null);
  };

  const cancelChanges = () => {
    setDeletedFiles(new Set());
    setPendingUploads(new Set());
    setPendingChanges(false);
    setLocalFiles(files);
    toast({
      description: "Changes cancelled",
    });
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
    toast({
      description: "Logged out successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <div className="flex gap-4">
            {pendingChanges && (
              <>
                <Button variant="outline" onClick={cancelChanges}>
                  Cancel Changes
                </Button>
                <Button
                  variant="default"
                  onClick={() => setShowApplyDialog(true)}
                  disabled={isUploading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isUploading ? "Applying Changes..." : "Apply Changes"}
                </Button>
              </>
            )}
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <FileUploadCard
            onUpload={(file) => {
              setPendingUploads((prev) => new Set([...prev, file]));
              setPendingChanges(true);
            }}
            isUploading={isUploading}
          />

          <FileListCard
            files={localFiles}
            onView={viewFile}
            onDelete={handleDelete}
            onManageSheets={openVisibilityModal}
          />
        </div>

        <AlertDialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply Changes</AlertDialogTitle>
              <AlertDialogDescription>
                This will apply {pendingUploads.size} pending upload(s) and{" "}
                {deletedFiles.size} deletion(s). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleApplyChanges}>
                Apply Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <SheetVisibilityDialog
          isOpen={isVisibilityModalOpen}
          onClose={() => setIsVisibilityModalOpen(false)}
          sheets={currentFileSheets}
          onSave={handleVisibilityChange}
          onCancel={() => {
            const previousVisibility = sheetVisibilityMap[selectedFileId];
            setCurrentFileSheets(
              previousVisibility ||
                currentFileSheets.map((sheet) => ({
                  ...sheet,
                  isVisible: true,
                }))
            );
            setIsVisibilityModalOpen(false);
          }}
          onSheetChange={(index, checked) => {
            const updatedSheets = [...currentFileSheets];
            updatedSheets[index] = {
              ...currentFileSheets[index],
              isVisible: checked,
            };
            setCurrentFileSheets(updatedSheets);
          }}
        />

        {fileData && (
          <FileViewModal
            isOpen={isModalOpen}
            onClose={closeModal}
            allFiles={files}
            initialFileData={fileData}
            fetchFileData={fetchFileData}
            sheetVisibility={sheetVisibilityMap[selectedFileId]}
          />
        )}
        <Toaster />
      </div>
    </div>
  );
}
