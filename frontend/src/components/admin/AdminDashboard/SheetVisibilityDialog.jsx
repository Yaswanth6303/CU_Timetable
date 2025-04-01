// src/components/admin/SheetVisibilityDialog.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Label } from "../../ui/label";

export default function SheetVisibilityDialog({
  isOpen,
  onClose,
  sheets,
  onSave,
  onCancel,
  onSheetChange,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Sheet Visibility</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            {sheets.map((sheet, index) => (
              <div
                key={sheet.sheetName}
                className="flex items-center space-x-2"
              >
                <Checkbox
                  id={`sheet-${index}`}
                  checked={sheet.isVisible}
                  onCheckedChange={(checked) => onSheetChange(index, checked)}
                />
                <Label htmlFor={`sheet-${index}`}>{sheet.sheetName}</Label>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
