const express = require("express");
const bcrypt = require("bcryptjs"); // For password hashing and comparison
const multer = require("multer"); // For image uploads
const Employee = require("../models/Employee"); // Import the Employee model

const router = express.Router();

// Multer configuration for handling image uploads
const storage = multer.memoryStorage(); // Store image as Buffer
const upload = multer({ storage: storage });

/**
 * POST: Create a new employee with profile image
 */
router.post("/", upload.single("profileImage"), async (req, res) => {
  const { name, designation, empId, favTools, password } = req.body;

  console.log("Received data:", req.body);

  try {
    const newEmployee = new Employee({
      name,
      designation,
      empId,
      favTools: favTools.split(","), // Convert CSV string to an array
      password, // Password will be hashed automatically using pre-save middleware
      profileImage: req.file
        ? {
            data: req.file.buffer,
            contentType: req.file.mimetype,
          }
        : null, // Save profile image if uploaded
    });

    const savedEmployee = await newEmployee.save();
    console.log("Employee saved:", savedEmployee);

    res
      .status(201)
      .json({
        message: "Employee details saved successfully!",
        employee: savedEmployee,
      });
  } catch (error) {
    console.error("Error saving employee:", error);
    res
      .status(500)
      .json({ message: "Error saving employee details", error: error.message });
  }
});

/**
 * POST: Authenticate employee login
 */
router.post("/login", async (req, res) => {
  const { empId, password } = req.body;

  try {
    const employee = await Employee.findOne({ empId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Compare password with hash
    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Respond with employee details if login is successful
    res.status(200).json({
      name: employee.name,
      empId: employee.empId,
      designation: employee.designation,
      favTools: employee.favTools,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
});

/**
 * GET: Fetch all employees
 */
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().select("-password"); // Exclude password field
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res
      .status(500)
      .json({
        message: "Error fetching employee details",
        error: error.message,
      });
  }
});

/**
 * GET: Fetch employee profile image by empId
 */
router.get("/:empId/image", async (req, res) => {
  try {
    const { empId } = req.params;
    const employee = await Employee.findOne({ empId });

    if (!employee || !employee.profileImage) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.set("Content-Type", employee.profileImage.contentType);
    res.send(employee.profileImage.data); // Send image binary data
  } catch (error) {
    console.error("Error fetching profile image:", error);
    res
      .status(500)
      .json({ message: "Error fetching profile image", error: error.message });
  }
});

module.exports = router;
