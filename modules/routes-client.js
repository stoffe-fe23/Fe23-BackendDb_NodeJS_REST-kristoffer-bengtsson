/*
    Slutprojekt Backend Databaser (FE23 Grit Academy)
    Kristoffer Bengtsson

    routes-client.js
    Modules containing routes and logic for serving the API administration client pages
    and their form submission target routes. 
*/
import { Router } from 'express';
import db from "./db.js";

const clientRoutes = Router();

// Build home page
clientRoutes.get("/", async (req, res) => {
    const pageTitle = "Grit Academy";
    res.render("index", { pageTitle });
});


// Build page for managing students
clientRoutes.get("/students", async (req, res) => {
    const sortOptions = ['firstname', 'lastname', 'city'];
    const sortBy = (req.query.sortby && sortOptions.includes(req.query.sortby) ? req.query.sortby : "lastname");
    const sortOrder = (req.query.sortorder && req.query.sortorder == 'desc' ? "DESC" : "ASC");
    const pageTitle = "Students";

    const values = [];
    let sql = (`
        SELECT 
            s.id, 
            s.firstname, 
            s.lastname,
            COALESCE(s.city, " - ") AS city, 
            GROUP_CONCAT(c.name ORDER BY c.name ASC) AS courses
        FROM 
            students s 
            LEFT JOIN students_courses sc ON (s.id = sc.student_id) 
            LEFT JOIN courses c ON (c.id = sc.course_id)
        GROUP BY s.id
        ORDER BY s.${sortBy} ${sortOrder}
    `);

    const [studentRows] = await db.query(sql);
    res.render("students", { pageTitle, studentRows, sortBy, sortOrder });
});


// Submit target for edit student form. 
clientRoutes.post("/student/edit", async (req, res) => {
    if (req.body.id && (req.body.id > 0)) {
        const [result] = await db.execute(
            `UPDATE students SET firstname = ?, lastname = ?, city = ? WHERE id = ?`,
            [req.body.firstname, req.body.lastname, req.body.city, req.body.id]
        );
        console.log("Edit student: ", req.body.id, result.affectedRows);
    }
    res.redirect(`/students`);
});


// Submit target for form adding a new student.
clientRoutes.post("/student/add", async (req, res) => {
    if (req.body.firstname && req.body.lastname) {
        const [result] = await db.execute(
            `INSERT INTO students (firstname, lastname, city) VALUES (?, ?, ?)`,
            [req.body.firstname, req.body.lastname, req.body.city]
        );
        console.log("Add student: ", result.insertId, result.affectedRows);
    }
    res.redirect(`/students`);
});


// Build page for managing courses. 
clientRoutes.get("/courses", async (req, res) => {
    const pageTitle = "Courses";
    const courseId = req.query.id ?? 0;

    const [studentList] = await db.query(`SELECT id, firstname, lastname FROM students WHERE id NOT IN (SELECT ss.id FROM students ss JOIN students_courses sc ON (ss.id = sc.student_id) WHERE sc.course_id = ?)`, [courseId]);
    const [coursesList] = await db.query(`
        SELECT 
            c.id, 
            c.name, 
            c.description, 
            JSON_REMOVE(JSON_OBJECTAGG(IFNULL(s.id, "null"), CONCAT(s.firstname, " ", s.lastname, " (", IFNULL(s.city, "No city"), ")")), "$.null") AS students 
        FROM 
            courses c 
            LEFT JOIN students_courses sc ON (c.id = sc.course_id) 
            LEFT JOIN students s ON (s.id = sc.student_id) 
        GROUP BY c.name 
        ORDER BY c.name ASC
    `);

    let currentCourse = { id: 0, name: '- no course -', description: '', students: {} };
    if (req.query.id && (req.query.id > 0)) {
        const selectedCourse = coursesList.find((course) => course.id == req.query.id);
        if (selectedCourse) {
            currentCourse = selectedCourse;
        }
    }

    res.render("courses", { pageTitle, coursesList, studentList, currentCourse });
});


// Submit destination for form adding a student to a course.
clientRoutes.post("/course/student/add", async (req, res) => {
    if (req.body.student_id && req.body.course_id) {
        try {
            await db.execute(`INSERT INTO students_courses (student_id, course_id) VALUES (?, ?)`, [req.body.student_id, req.body.course_id]);
            res.redirect(`/courses?id=${req.body.course_id}`);
        }
        catch (error) {
            response.json({ error: "Error adding student to course!", status: error });
        }
    }
});


// Submit destination for form removing a student from a course.
clientRoutes.post("/course/student/remove", async (req, res) => {
    if (req.body.student_id && req.body.course_id) {
        try {
            await db.execute(`DELETE FROM students_courses WHERE student_id = ? AND course_id = ?`, [req.body.student_id, req.body.course_id]);
            res.redirect(`/courses?id=${req.body.course_id}`);
        }
        catch (error) {
            response.json({ error: "Error removing student from course!", status: error });
        }
    }
});


// Submit destination for form creating a new course.
clientRoutes.post("/course/add", async (req, res) => {
    if (req.body.name && (req.body.name.length > 0)) {
        const [result] = await db.execute(`INSERT INTO courses (name, description) VALUES (?, ?)`, [req.body.name, req.body.description]);
        res.redirect(`/courses?id=${result.insertId}`);
    }
});

export default clientRoutes;