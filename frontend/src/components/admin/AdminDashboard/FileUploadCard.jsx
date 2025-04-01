// src/components/admin/FileUploadCard.jsx
import { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export default function FileUploadCard({ onUpload, isUploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (file && allowedTypes.includes(file.type)) {
      setSelectedFile(file);
      setMessage("");
    } else {
      setSelectedFile(null);
      setMessage("Please select a valid Excel or CSV file");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage("Please select a file");
      return;
    }
    onUpload(selectedFile);
    setSelectedFile(null);
    e.target.reset();
    setMessage("File added to pending changes");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Excel/CSV File</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
          <Button type="submit" disabled={!selectedFile || isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            Add File
          </Button>
        </form>
        {message && (
          <Alert
            variant={message.includes("Error") ? "destructive" : "default"}
            className="mt-4"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
