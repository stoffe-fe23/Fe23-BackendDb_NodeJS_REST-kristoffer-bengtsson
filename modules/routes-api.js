/*
    Slutprojekt Backend Databaser (FE23 Grit Academy)
    Kristoffer Bengtsson

    routes-api.js
    Modules containing routes and logic for the API endpoints. 
*/
import { Router } from 'express';
import db from "./db.js";
import {
    handleValidationErrorAPI,
    validateNewStudent,
    validateNewCourse,
    validateAddCourseStudent,
    validateDeleteStudent,
    validateDeleteCourse,
    validateRemoveCourseStudent,
    validateStudentId
} from './validation.js';

const apiRoutes = Router();


/*************************************************************************************
 * ENDPOINTS FOR FETCHING DATA
 *************************************************************************************/

/////////////////////////////////////////////////////////////////////////////////////////
// Get a list of all students
apiRoutes.get("/students", async (req, res) => {
    try {
        const [studentList] = await db.query('SELECT * FROM `students` ORDER BY firstname ASC');
        res.json(studentList);
    }
    catch (error) {
        res.status(400);
        res.json({ error: "Error fetching student info.", status: error });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////
// Get a list of all courses.
apiRoutes.get("/courses", async (req, res) => {
    try {
        const [courseList] = await db.query('SELECT * FROM `courses` ORDER BY name ASC');
        res.json(courseList);
    }
    catch (error) {
        res.status(400);
        res.json({ error: "Error fetching student info.", status: error });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////
// Get a list of all courses and their assigned students.
apiRoutes.get("/courses/students", async (req, res) => {
    try {
        const [coursesList] = await db.query(`
        SELECT 
            c.id, 
            c.name AS course, 
            c.description, 
            JSON_REMOVE(JSON_OBJECTAGG(IFNULL(s.id, "null"), CONCAT(s.firstname, " ", s.lastname)), "$.null") AS students 
        FROM 
            courses c 
            LEFT JOIN students_courses sc ON (c.id = sc.course_id) 
            LEFT JOIN students s ON (s.id = sc.student_id) 
        GROUP BY c.name 
        ORDER BY c.name ASC`
        );
        res.json(coursesList);
    }
    catch (error) {
        res.status(400);
        res.json({ error: "Error fetching student info.", status: error });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////
// Get info about a specific student by ID, including their assigned courses. 
apiRoutes.get("/student/get/:id", validateStudentId, handleValidationErrorAPI, async (req, res) => {
    if (req.params.id) {
        try {
            const [studentInfo] = await db.execute(`
                SELECT 
                    s.*, 
                    JSON_REMOVE(JSON_OBJECTAGG(IFNULL(c.id, "null"), c.name), "$.null") AS courses 
                FROM 
                    students s 
                    LEFT JOIN students_courses sc ON (s.id = sc.student_id) 
                    LEFT JOIN courses c ON (c.id = sc.course_id) WHERE s.id = ? 
                GROUP BY s.id`,
                [req.params.id]
            );
            res.json(studentInfo);
        }
        catch (error) {
            res.status(400);
            res.json({ error: "Error fetching student info.", status: error });
        }
    }
    else {
        res.status(400);
        res.json({ error: "You must specify the ID of the student to display." });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////
// Get filtered list of students (and their courses)
// Filter params: fistname (optional), lastname (optional), city (optional)
apiRoutes.get("/students/list", async (req, res) => {
    try {
        let sql = `
            SELECT 
                s.*, 
                JSON_REMOVE(JSON_OBJECTAGG(IFNULL(c.id, "null"), c.name), "$.null") AS courses 
            FROM 
                students s 
                LEFT JOIN students_courses sc ON (s.id = sc.student_id) 
                LEFT JOIN courses c ON (c.id = sc.course_id)`;
        const values = [];

        // Apply filters if set
        if (req.query.firstname) {
            sql += (values.length ? " AND " : " WHERE ") + `s.firstname = ?`;
            values.push(req.query.firstname);
        }

        if (req.query.lastname) {
            sql += (values.length ? " AND " : " WHERE ") + `s.lastname = ?`;
            values.push(req.query.lastname);
        }

        if (req.query.city) {
            sql += (values.length ? " AND " : " WHERE ") + `s.city LIKE ?`;
            values.push(`%${req.query.city}%`);
        }

        sql += ` GROUP BY s.id`;


        const [studentsInfo] = await db.execute(sql, values);
        res.json(studentsInfo);
    }
    catch (error) {
        res.status(400);
        res.json({ error: "Error fetching student list.", status: error });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////
// Info about specific course by ID or Name (full or wildcard) or description (wildcard), with student list
// Filter types: id, name, name_contains, desc_contains
// filter: string depending on FilterType
apiRoutes.get("/courses/filtered/:filterType", async (req, res) => {
    const filterTypes = ['id', 'name', 'name_contains', 'desc_contains'];
    if (req.params.filterType && filterTypes.includes(req.params.filterType)) {
        try {
            let sql = `
            SELECT 
                c.*, 
                JSON_REMOVE(JSON_OBJECTAGG(IFNULL(s.id, "null"), CONCAT(s.firstname, " ", s.lastname)), "$.null") AS students 
            FROM 
                courses c 
                LEFT JOIN students_courses sc ON (c.id = sc.course_id) 
                LEFT JOIN students s ON (s.id = sc.student_id)`;
            const values = [];

            // If filter querystring parameter is set, apply to query, otherwise show all. 
            if (req.query.filter) {
                sql += ` WHERE `;
                switch (req.params.filterType) {
                    case 'id':
                        sql += `c.id = ?`;
                        values.push(req.query.filter);
                        break;
                    case 'name':
                        sql += `c.name = ?`;
                        values.push(req.query.filter);
                        break;
                    case 'name_contains':
                        sql += `c.name LIKE ?`;
                        values.push(`%${req.query.filter}%`);
                        break;
                    case 'desc_contains':
                        sql += `c.description LIKE ?`;
                        values.push(`%${req.query.filter}%`);
                        break;
                }
            }

            sql += ` GROUP BY c.id`;


            const [coursesInfo] = await db.execute(sql, values);
            res.json(coursesInfo);
        }
        catch (error) {
            res.status(400);
            res.json({ error: "Error fetching filtered course list.", status: error });
        }
    }
    else {
        res.status(400);
        res.json({ error: "The course filter type must be one of: " + filterTypes.join(", ") });
    }
});


/*************************************************************************************
 * ENDPOINTS FOR ADDING / MODIFYING DATA
 *************************************************************************************/

/////////////////////////////////////////////////////////////////////////////////////////
// Add a new student to the database. 
// Params: firstname, lastname, city (optional)
apiRoutes.post("/student/add", validateNewStudent, handleValidationErrorAPI, async (req, res) => {
    if (req.body.firstname && req.body.lastname) {
        try {
            const [result] = await db.execute(
                `INSERT INTO students (firstname, lastname, city) VALUES (?, ?, ?)`,
                [req.body.firstname, req.body.lastname, req.body.city ?? '']
            );
            console.log("Add new student: ", req.body.firstname, req.body.lastname, req.body.city);
            res.json({ message: "Create new student.", status: result });
        }
        catch (error) {
            res.status(400);
            res.json({ error: "Error adding new student.", status: error });
        }
    }
    else {
        res.status(400);
        res.json({ error: "Both firstname and lastname of the new student must be specified." });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////
// Add a new course to the database. 
// Params: name, description (optional)
apiRoutes.post("/course/add", validateNewCourse, handleValidationErrorAPI, async (req, res) => {
    if (req.body.name) {
        try {
            const [result] = await db.execute(
                `INSERT INTO courses (name, description) VALUES (?, ?)`,
                [req.body.name, req.body.description ?? '']
            );
            console.log("Add new course: ", req.body.name, req.body.description);
            res.json({ message: "Create new course.", status: result });
        }
        catch (error) {
            res.status(400);
            res.json({ error: "Error adding new course.", status: error });
        }
    }
    else {
        res.status(400);
        res.json({ error: "A name must be specified for the new course." });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////
// Add a course to a student. 
// Params: course id, student id
apiRoutes.get("/course/student/add/:course/:student", validateAddCourseStudent, handleValidationErrorAPI, async (req, res) => {
    if (req.params.student && req.params.course) {
        try {
            const [result] = await db.execute(
                `INSERT INTO students_courses (student_id, course_id) VALUES (?, ?)`,
                [req.params.student, req.params.course]
            );
            console.log("Add student to course: ", req.params.student, req.params.course);
            res.json({ message: "Add student to course.", status: result });
        }
        catch (error) {
            res.status(400);
            res.json({ error: "Error adding student to course.", status: error });
        }
    }
    else {
        res.status(400);
        res.json({ error: "The ID of a course and student must be specified." });
    }
});


/////////////////////////////////////////////////////////////////////////////////////////
// Remove a student from the database
apiRoutes.delete("/student/delete/:id", validateDeleteStudent, handleValidationErrorAPI, async (req, res) => {
    if (req.params.id && (req.params.id > 0)) {
        try {
            const [linkResult] = await db.execute(`DELETE FROM students_courses WHERE student_id = ?`, [req.params.id]);
            const [studentResult] = await db.execute(`DELETE FROM students WHERE id = ?`, [req.params.id]);

            console.log("Removing student: ", req.params.id);
            res.json({ message: `Delete student ID ${req.params.id}.`, status: { fromCourses: linkResult.affectedRows, deleted: studentResult.affectedRows } });
        }
        catch (error) {
            res.status(400);
            res.json({ error: "Error deleting student.", status: error });
        }

    }
    else {
        res.status(400);
        res.json({ error: "The ID of the student to delete must be specified." });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////
// Remove a course from the database
apiRoutes.delete("/course/delete/:id", validateDeleteCourse, handleValidationErrorAPI, async (req, res) => {
    if (req.params.id && (req.params.id > 0)) {
        try {
            const [linkResult] = await db.execute(`DELETE FROM students_courses WHERE course_id = ?`, [req.params.id]);
            const [courseResult] = await db.execute(`DELETE FROM courses WHERE id = ?`, [req.params.id]);

            console.log("Removing course: ", req.params.id);
            res.json({ message: `Delete course ID ${req.params.id}.`, status: { numStudents: linkResult.affectedRows, deleted: courseResult.affectedRows } });
        }
        catch (error) {
            res.status(400);
            res.json({ error: "Error deleting course.", status: error });
        }

    }
    else {
        res.status(400);
        res.json({ error: "The ID of the course to delete must be specified." });
    }
});

/////////////////////////////////////////////////////////////////////////////////////////
// Remove a student from a course
apiRoutes.delete("/course/student/delete/:course_id/:student_id", validateRemoveCourseStudent, handleValidationErrorAPI, async (req, res) => {
    if (req.params.course_id && req.params.student_id && (req.params.course_id > 0) && (req.params.student_id > 0)) {
        try {
            const [linkResult] = await db.execute(`DELETE FROM students_courses WHERE course_id = ? AND student_id = ?`, [req.params.course_id, req.params.student_id]);

            console.log("Removing student from course: ", req.params.student_id, req.params.course_id);
            res.json({ message: `Remove student ID ${req.params.student_id} from course ID ${req.params.course_id}.`, status: linkResult.affectedRows });
        }
        catch (error) {
            res.status(400);
            res.json({ error: "Error removing student from course.", status: error });
        }

    }
    else {
        res.status(400);
        res.json({ error: "The ID of the course and student must be specified." });
    }
});



export default apiRoutes;