const fs = require("fs");
const csvParser = require("csv-parser");
const XLSX = require("xlsx");
const CSV = require("../models/csv");
const path = require("path");

function parseExcelFile(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheets = {};

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (data.length > 0) {
      const headers = data[0];
      const rows = data.slice(1).filter((row) => row.length > 0);

      sheets[sheetName] = {
        headers: headers,
        data: rows.map((row) => {
          let rowData = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });
          return rowData;
        }),
      };
    }
  });

  return {
    sheets: sheets,
    sheetNames: Object.keys(sheets),
  };
}

async function getExistingSheetVisibility(fileName) {
  try {
    const existingFile = await CSV.findOne({ fileName });
    return existingFile?.sheetVisibility || null;
  } catch (error) {
    console.error("Error getting existing sheet visibility:", error);
    return null;
  }
}

module.exports.upload = async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No files were uploaded." });
    }

    const validMimeTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!validMimeTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ error: "Please select CSV or Excel files only." });
    }

    const existingSheetVisibility = await getExistingSheetVisibility(
      req.file.originalname
    );
    let sheetVisibility = [];

    if (req.file.mimetype !== "text/csv") {
      const excelData = parseExcelFile(req.file.path);

      if (excelData.sheetNames.length === 0) {
        fs.unlinkSync(req.file.path);
        return res
          .status(400)
          .json({ error: "Excel file contains no valid data sheets." });
      }

      if (existingSheetVisibility) {
        const existingSheets = new Set(
          existingSheetVisibility.map((s) => s.sheetName)
        );
        sheetVisibility = [...existingSheetVisibility];

        excelData.sheetNames.forEach((sheetName) => {
          if (!existingSheets.has(sheetName)) {
            sheetVisibility.push({
              sheetName,
              isVisible: true,
            });
          }
        });
      } else {
        sheetVisibility = excelData.sheetNames.map((sheetName) => ({
          sheetName,
          isVisible: true,
        }));
      }
    } else {
      // For CSV files
      sheetVisibility = existingSheetVisibility || [
        {
          sheetName: "Sheet1",
          isVisible: true,
        },
      ];
    }

    const existingFile = await CSV.findOne({ fileName: req.file.originalname });
    let file;

    if (existingFile) {
      if (fs.existsSync(existingFile.filePath)) {
        fs.unlinkSync(existingFile.filePath);
      }

      file = await CSV.findOneAndUpdate(
        { fileName: req.file.originalname },
        {
          filePath: req.file.path,
          file: req.file.filename,
          fileType: req.file.mimetype,
          sheetVisibility,
          updatedAt: new Date(),
        },
        { new: true }
      );
    } else {
      file = await CSV.create({
        fileName: req.file.originalname,
        filePath: req.file.path,
        file: req.file.filename,
        fileType: req.file.mimetype,
        sheetVisibility,
      });
    }

    return res.status(200).json({
      message: "File uploaded successfully",
      file: file,
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.log("Error in fileController/upload", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.view = async function (req, res) {
  try {
    let file = await CSV.findOne({ file: req.params.id });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (!fs.existsSync(file.filePath)) {
      await CSV.deleteOne({ file: req.params.id });
      return res.status(404).json({ error: "File not found on server" });
    }

    if (file.fileType !== "text/csv") {
      try {
        const excelData = parseExcelFile(file.filePath);
        const visibilityMap = new Map(
          file.sheetVisibility.map((sheet) => [
            sheet.sheetName,
            sheet.isVisible,
          ])
        );

        const visibleSheets = {};
        const visibleSheetNames = [];

        excelData.sheetNames.forEach((sheetName) => {
          if (visibilityMap.get(sheetName) !== false) {
            visibleSheets[sheetName] = excelData.sheets[sheetName];
            visibleSheetNames.push(sheetName);
          }
        });

        return res.status(200).json({
          fileName: file.fileName,
          fileType: file.fileType,
          sheetNames: visibleSheetNames,
          sheets: visibleSheets,
          sheetVisibility: file.sheetVisibility,
        });
      } catch (error) {
        console.error("Excel parsing error:", error);
        return res.status(500).json({ error: "Error reading Excel file" });
      }
    }

    const results = [];
    const header = [];
    const stream = fs
      .createReadStream(file.filePath)
      .pipe(csvParser())
      .on("headers", (headers) => {
        headers.forEach((head) => header.push(head));
      })
      .on("data", (data) => results.push(data))
      .on("end", () => {
        res.status(200).json({
          fileName: file.fileName,
          fileType: file.fileType,
          sheetNames: ["Sheet1"],
          sheets: {
            Sheet1: {
              headers: header,
              data: results,
            },
          },
          sheetVisibility: file.sheetVisibility,
        });
      });

    stream.on("error", (error) => {
      console.error("Stream error:", error);
      res.status(500).json({ error: "Error reading file" });
    });
  } catch (error) {
    console.log("Error in fileController/view", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.delete = async function (req, res) {
  try {
    let file = await CSV.findOne({ file: req.params.id });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await CSV.deleteOne({ file: req.params.id });

    return res.status(200).json({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.log("Error in fileController/delete", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.markForDeletion = async function (req, res) {
  try {
    let file = await CSV.findOne({ file: req.params.id });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    await CSV.findOneAndUpdate(
      { file: req.params.id },
      { isMarkedForDeletion: true }
    );

    return res.status(200).json({
      message: "File marked for deletion",
    });
  } catch (error) {
    console.log("Error in fileController/markForDeletion", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.applyChanges = async function (req, res) {
  try {
    const filesToDelete = await CSV.find({ isMarkedForDeletion: true });

    const errors = [];
    const successfulDeletions = [];

    for (const file of filesToDelete) {
      try {
        if (fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }

        await CSV.deleteOne({ _id: file._id });

        successfulDeletions.push(file.file);
      } catch (error) {
        errors.push(`Error deleting file ${file.fileName}: ${error.message}`);
      }
    }

    if (errors.length === 0) {
      return res.status(200).json({
        message: "All changes applied successfully",
        deletedFiles: successfulDeletions,
      });
    } else {
      if (successfulDeletions.length > 0) {
        return res.status(207).json({
          message: "Some changes applied with errors",
          deletedFiles: successfulDeletions,
          errors: errors,
        });
      } else {
        return res.status(500).json({
          message: "Failed to apply changes",
          errors: errors,
        });
      }
    }
  } catch (error) {
    console.log("Error in fileController/applyChanges:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
};

module.exports.updateSheetVisibility = async function (req, res) {
  try {
    const fileId = req.params.id;
    const { sheetVisibility } = req.body;

    if (!Array.isArray(sheetVisibility)) {
      return res.status(400).json({ error: "Invalid sheet visibility data" });
    }

    const file = await CSV.findOne({ file: fileId });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    file.sheetVisibility = sheetVisibility;
    await file.save();

    return res.status(200).json({
      message: "Sheet visibility updated successfully",
      sheetVisibility: file.sheetVisibility,
    });
  } catch (error) {
    console.log("Error in fileController/updateSheetVisibility:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
