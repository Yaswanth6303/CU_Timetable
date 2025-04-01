// src/components/admin/FileListCard.jsx
import { FileText, Eye, Layers, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";

export default function FileListCard({
  files,
  onView,
  onDelete,
  onManageSheets,
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Files</CardTitle>
        <Badge variant="secondary" className="text-sm">
          {files.length} Files
        </Badge>
      </CardHeader>
      <CardContent>
        {files.length > 0 ? (
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-4">
              {files.map((file) => (
                <div
                  key={file._id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{file.fileName}</span>
                        {file.isPending && (
                          <Badge variant="secondary">Pending Upload</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {file.isPending
                          ? "Pending"
                          : `Uploaded on: ${new Date(
                              file.createdAt
                            ).toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!file.isPending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(file.file)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onManageSheets(file.file)}
                        >
                          <Layers className="mr-2 h-4 w-4" />
                          Sheets
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(file.file)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete file</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No files uploaded yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
