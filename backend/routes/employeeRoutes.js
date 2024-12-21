const express = require("express");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const Employee = require("../models/Employee");

const router = express.Router();

// Configure multer for file upload with size limit and file type check
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // Accept image files
    } else {
      cb(new Error("Only image files are allowed"), false); // Reject non-image files
    }
  },
});

// Create employee with profile image
router.post("/", upload.single("profileImage"), async (req, res) => {
  const { name, designation, empId, favTools, password } = req.body;

  // Log the incoming request for debugging
  console.log("Request Body:", req.body);
  console.log("File Data:", req.file);

  try {
    const newEmployee = new Employee({
      name,
      designation,
      empId,
      favTools: Array.isArray(favTools) ? favTools : favTools.split(","),
      password,
      profileImage: req.file
        ? { data: req.file.buffer, contentType: req.file.mimetype }
        : null,
    });

    const savedEmployee = await newEmployee.save();
    res.status(201).json({
      message: "Employee created successfully!",
      employee: savedEmployee,
    });
  } catch (error) {
    console.error("Error saving employee:", error);
    res
      .status(500)
      .json({ message: "Error saving employee", error: error.message });
  }
});

// Employee login
router.post("/login", async (req, res) => {
  const { empId, password } = req.body;

  try {
    const employee = await Employee.findOne({ empId });
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    res.status(200).json({
      name: employee.name,
      empId: employee.empId,
      designation: employee.designation,
      favTools: employee.favTools,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
});

// Fetch all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");
    res.status(200).json(employees);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching employees", error: error.message });
  }
});

// Fetch profile image
router.get("/:empId/image", async (req, res) => {
  try {
    const { empId } = req.params;
    const employee = await Employee.findOne({ empId });

    if (!employee || !employee.profileImage) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.set({
      "Content-Type": employee.profileImage.contentType,
      "Content-Length": employee.profileImage.data.length,
    });
    res.send(employee.profileImage.data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching profile image", error: error.message });
  }
});

module.exports = router;
