/*
    Slutprojekt Backend Databaser (FE23 Grit Academy)
    Kristoffer Bengtsson

    routes-client.js
    Modules containing routes and logic for serving the API administration client pages
    and their form submission target routes. 
*/
import { Router } from 'express';
import db from "./db.js";
import {
    validateNewStudent,
    validateAddCourseStudentPOST,
    validateEditStudent,
    validateRemoveCourseStudentPOST,
    validateNewCourse,
    validateEditCourse,
    handleValidationErrorPage
} from "./validation.js";

const clientRoutes = Router();


////////////////////////////////////////////////////////////////////////////////
// PAGE: front page (API doc)
clientRoutes.get("/", async (req, res) => {
    const pageTitle = "API endpoints";
    res.render("index", { pageTitle });
});


////////////////////////////////////////////////////////////////////////////////
// PAGE: Manage students
clientRoutes.get("/students", async (req, res) => {
    try {
        // Allow sorting student table by column in ascending or descending order (by clicking table header)
        const sortOptions = ['firstname', 'lastname', 'city'];
        const sortBy = (req.query.sortby && sortOptions.includes(req.query.sortby) ? req.query.sortby : "lastname");
        const sortOrder = (req.query.sortorder && req.query.sortorder == 'desc' ? "DESC" : "ASC");

        const pageTitle = "Students";

        // Fetch all students along with a list of their courses (if any). 
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
    }
    catch (error) {
        res.render("errors", { errorMessage: error });
    }
});


////////////////////////////////////////////////////////////////////////////////
// PAGE: Manage courses
clientRoutes.get("/courses", async (req, res) => {
    try {
        const pageTitle = "Courses";

        // Display the couse with the ID in the id url parameter, if it is set. 
        const courseId = Number(!req.query.id || isNaN(req.query.id) || (req.query.id < 1) ? 0 : req.query.id);

        // Get list of students who are NOT part of the displayed course. 
        const [studentList] = await db.query(`
            SELECT 
                id, 
                firstname, 
                lastname 
            FROM 
                students 
            WHERE 
                id NOT IN (SELECT ss.id FROM students ss JOIN students_courses sc ON (ss.id = sc.student_id) WHERE sc.course_id = ?)`,
            [courseId]
        );

        // Fetch info about courses (and and object with the id and name+city of its students)
        const [coursesList] = await db.query(`
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                JSON_REMOVE(
                    JSON_OBJECTAGG(
                        IFNULL(s.id, "null"), 
                        CONCAT(s.firstname, " ", s.lastname, " (", IFNULL(s.city, "No city"), ")")
                    ), 
                    "$.null"
                ) AS students 
            FROM 
                courses c 
                LEFT JOIN students_courses sc ON (c.id = sc.course_id) 
                LEFT JOIN students s ON (s.id = sc.student_id) 
            GROUP BY c.name 
            ORDER BY c.name ASC
        `);

        // If an ID url parameter was provided, set the course with that ID as the displayed course. 
        let currentCourse = { id: 0, name: '- no course -', description: '', students: {} };
        if (req.query.id && (req.query.id > 0)) {
            const selectedCourse = coursesList.find((course) => course.id == req.query.id);
            if (selectedCourse) {
                currentCourse = selectedCourse;
            }
        }

        res.render("courses", { pageTitle, coursesList, studentList, currentCourse });
    }
    catch (error) {
        res.render("errors", { errorMessage: error });
    }
});


////////////////////////////////////////////////////////////////////////////////
// FORM SUBMIT: Add new student
clientRoutes.post("/student/add", validateNewStudent, handleValidationErrorPage, async (req, res) => {
    try {
        if (req.body.firstname && req.body.lastname) {
            const [result] = await db.execute(
                `INSERT INTO students (firstname, lastname, city) VALUES (?, ?, ?)`,
                [req.body.firstname, req.body.lastname, req.body.city]
            );
        }
        res.redirect(`/students`);
    }
    catch (error) {
        res.render("errors", { errorMessage: error });
    }
});


////////////////////////////////////////////////////////////////////////////////
// FORM SUBMIT: Edit student
clientRoutes.post("/student/edit", validateEditStudent, handleValidationErrorPage, async (req, res) => {
    try {
        if (req.body.id && (req.body.id > 0)) {
            const [result] = await db.execute(
                `UPDATE students SET firstname = ?, lastname = ?, city = ? WHERE id = ?`,
                [req.body.firstname, req.body.lastname, req.body.city, req.body.id]
            );
        }
        res.redirect(`/students`);
    }
    catch (error) {
        res.render("errors", { errorMessage: error });
    }
});


////////////////////////////////////////////////////////////////////////////////
// FORM SUBMIT: Add student to course
clientRoutes.post("/course/student/add", validateAddCourseStudentPOST, handleValidationErrorPage, async (req, res) => {
    try {
        if (req.body.student_id && req.body.course_id) {
            try {
                await db.execute(`INSERT INTO students_courses (student_id, course_id) VALUES (?, ?)`, [req.body.student_id, req.body.course_id]);
                res.redirect(`/courses?id=${req.body.course_id}`);
            }
            catch (error) {
                response.json({ error: "Error adding student to course!", status: error });
            }
        }
    }
    catch (error) {
        res.render("errors", { errorMessage: error });
    }
});


////////////////////////////////////////////////////////////////////////////////
// FORM SUBMIT: Remove student from course.
clientRoutes.post("/course/student/remove", validateRemoveCourseStudentPOST, handleValidationErrorPage, async (req, res) => {
    try {
        if (req.body.student_id && req.body.course_id) {
            try {
                await db.execute(`DELETE FROM students_courses WHERE student_id = ? AND course_id = ?`, [req.body.student_id, req.body.course_id]);
                res.redirect(`/courses?id=${req.body.course_id}`);
            }
            catch (error) {
                response.json({ error: "Error removing student from course!", status: error });
            }
        }
    }
    catch (error) {
        res.render("errors", { errorMessage: error });
    }
});


////////////////////////////////////////////////////////////////////////////////
// FORM SUBMIT: Create new course.
clientRoutes.post("/course/add", validateNewCourse, handleValidationErrorPage, async (req, res) => {
    try {
        if (req.body.name && (req.body.name.length > 0)) {
            const [result] = await db.execute(`INSERT INTO courses (name, description) VALUES (?, ?)`, [req.body.name, req.body.description]);
            res.redirect(`/courses?id=${result.insertId}`);
        }
    }
    catch (error) {
        res.render("errors", { errorMessage: error });
    }
});

////////////////////////////////////////////////////////////////////////////////
// FORM SUBMIT: Edit student
clientRoutes.post("/course/edit", validateEditCourse, handleValidationErrorPage, async (req, res) => {
    try {
        if (req.body.id && (req.body.id > 0) && req.body.name && req.body.name.length) {
            const [result] = await db.execute(
                `UPDATE courses SET name = ?, description = ? WHERE id = ?`,
                [req.body.name, req.body.description, req.body.id]
            );
        }
        res.redirect(`/courses?id=${req.body.id}`);
    }
    catch (error) {
        console.log("Error: ", error);
        res.render("errors", { errorMessage: error });
    }
});

export default clientRoutes;