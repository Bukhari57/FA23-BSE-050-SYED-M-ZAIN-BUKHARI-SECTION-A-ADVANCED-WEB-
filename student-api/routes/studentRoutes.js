const express = require("express");
const router = express.Router();
const validateInput = require("../middleware/validate");

// In-memory student data
let students = [
    { id: 1, name: "Ali", email: "ali@email.com", department: "CS" },
    { id: 2, name: "Sara", email: "sara@email.com", department: "IT" }
];

// GET all students
router.get("/", (req, res) => {
    res.json(students);
});

// GET student by ID
router.get("/:id", (req, res) => {
    const student = students.find(s => s.id == req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
});

// POST new student
router.post("/", validateInput, (req, res) => {
    const { name, email, department } = req.body;
    const newStudent = { id: students.length + 1, name, email, department };
    students.push(newStudent);
    res.status(201).json(newStudent);
});

// PUT update student
router.put("/:id", validateInput, (req, res) => {
    const student = students.find(s => s.id == req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.name = req.body.name;
    student.email = req.body.email;
    student.department = req.body.department;
    res.json(student);
});

// DELETE student
router.delete("/:id", (req, res) => {
    const index = students.findIndex(s => s.id == req.params.id);
    if (index === -1) return res.status(404).json({ message: "Student not found" });

    students.splice(index, 1);
    res.json({ message: "Student deleted successfully" });
});

module.exports = router;