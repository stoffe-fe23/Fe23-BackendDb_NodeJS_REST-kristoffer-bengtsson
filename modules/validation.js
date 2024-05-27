/*
    Slutprojekt Backend Databaser (FE23 Grit Academy)
    Kristoffer Bengtsson

    validation.js
    Modules with express-validator validation chains to check that user submitted data
    is in the correct format and that involved IDs are in the expected state (e.g. relation does not
    already exist and the specified student and course ID do exist, when adding a student-couse link).
    )
*/
import db from "./db.js";
import { body, param, check, validationResult } from "express-validator";


/////////////////////////////////////////////////////////////////////////////////////////////
// Check for validation errors. Stop if any are found and send back error response to client. 
export function handleValidationErrorAPI(req, res, next) {
    try {
        const errorList = validationResult(req);
        if (!errorList.isEmpty()) {
            res.status(400);
            res.json({ error: 'Validation error', data: errorList.array() });
        }
        else {
            next();
        }
    }
    catch (error) {
        res.status(400);
        res.json({ error: 'Validation error', data: [{ msg: error.message }] });
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////
// Check for validation errors. Stop if any are found and display error message page.  
export function handleValidationErrorPage(req, res, next) {
    try {
        const errorList = validationResult(req);
        if (!errorList.isEmpty()) {
            console.log('Validation error', errorList.array());
            res.render("errors", { errorMessage: errorList.array() });
        }
        else {
            next();
        }
    }
    catch (error) {
        res.render("errors", { errorMessage: [{ msg: error.message }] });
    }
}

/*************************************************************************************
 * Validation chains
 *************************************************************************************/

/////////////////////////////////////////////////////////////////////////////////////////////
// Validate new student data
// req.body.firstname, req.body.lastname, req.body.city
export const validateNewStudent = [
    body("firstname")
        .exists().withMessage('The first name must be specified.').bail()
        .trim().notEmpty().withMessage('The first name must be set.').bail()
        .isString().withMessage('The first name must be a text string.').bail()
        .isLength({ min: 2, max: 30 }).withMessage('The first name must be between 2-30 characters in length.').bail(),
    body("lastname")
        .exists().withMessage('The last name must be specified.').bail()
        .trim().notEmpty().withMessage('The last name must be set.').bail()
        .isString().withMessage('The last name must be a text string.').bail()
        .isLength({ min: 2, max: 30 }).withMessage('The last name must be between 2-30 characters in length.').bail(),
    body("city")
        .optional({ checkFalsy: true })
        .isString().withMessage('The city must be a text string.').bail()
        .isLength({ min: 0, max: 40 }).withMessage('City must be at most 40 characters in length.').bail()
];


/////////////////////////////////////////////////////////////////////////////////////////////
// Validate new course data
// req.body.name, req.body.description
export const validateNewCourse = [
    body("name")
        .exists().withMessage('The course name must be specified.').bail()
        .trim().notEmpty().withMessage('The course name must be set.').bail()
        .isString().withMessage('The course name must be a text string.').bail()
        .isLength({ min: 2, max: 50 }).withMessage('The course name must be between 2-50 characters in length.').bail(),
    body("description")
        .optional({ checkFalsy: true })
        .isString().withMessage('The description must be a text string.').bail()
        .isLength({ min: 0, max: 2000 }).withMessage('The course description can be at most 2000 characters in length.').bail()
];


/////////////////////////////////////////////////////////////////////////////////////////////
// Validate adding a student to a course
// req.params.student, req.params.course
export const validateAddCourseStudent = [
    param("student")
        .exists().withMessage('The student ID must be specified.').bail()
        .trim().notEmpty().withMessage('The student ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The student ID must be a number greater than 0.').bail()
        .custom(validateStudentIdExists).withMessage('The specified student ID does not exist.').bail(),
    param("course")
        .exists().withMessage('The course ID must be specified.').bail()
        .trim().notEmpty().withMessage('The course ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The course ID must be a number greater than 0.').bail()
        .custom(validateCourseIdExists).withMessage('The specified course ID does not exist.').bail()
        .custom(validateStudentNotInCourse).withMessage('The specified student is already in that course.').bail()
];

export const validateAddCourseStudentPOST = [
    body("student_id")
        .exists().withMessage('The student ID must be specified.').bail()
        .trim().notEmpty().withMessage('The student ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The student ID must be a number greater than 0.').bail()
        .custom(validateStudentIdExists).withMessage('The specified student ID does not exist.').bail(),
    body("course_id")
        .exists().withMessage('The course ID must be specified.').bail()
        .trim().notEmpty().withMessage('The course ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The course ID must be a number greater than 0.').bail()
        .custom(validateCourseIdExists).withMessage('The specified course ID does not exist.').bail()
        .custom(validateStudentNotInCourse).withMessage('The specified student is already in that course.').bail()
];


/////////////////////////////////////////////////////////////////////////////////////////////
// Validate deleting a student
// req.params.id
export const validateDeleteStudent = [
    param("id")
        .exists().withMessage('The student ID must be specified.').bail()
        .trim().notEmpty().withMessage('The student ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The student ID must be a number greater than 0.').bail()
        .custom(validateStudentIdExists).withMessage('The specified student ID does not exist.').bail()
];


/////////////////////////////////////////////////////////////////////////////////////////////
// Validate deleting a course
// req.params.id
export const validateDeleteCourse = [
    param("id")
        .exists().withMessage('The course ID must be specified.').bail()
        .trim().notEmpty().withMessage('The course ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The course ID must be a number greater than 0.').bail()
        .custom(validateCourseIdExists).withMessage('The specified course ID does not exist.').bail()
];


/////////////////////////////////////////////////////////////////////////////////////////////
// Validate removing a student from a course
// req.params.course_id, req.params.student_id
export const validateRemoveCourseStudent = [
    param("student_id")
        .exists().withMessage('The student ID must be specified.').bail()
        .trim().notEmpty().withMessage('The student ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The student ID must be a number greater than 0.').bail()
        .custom(validateStudentIdExists).withMessage('The specified student ID does not exist.').bail(),
    param("course_id")
        .exists().withMessage('The course ID must be specified.').bail()
        .trim().notEmpty().withMessage('The course ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The course ID must be a number greater than 0.').bail()
        .custom(validateCourseIdExists).withMessage('The specified course ID does not exist.').bail()
];

// req.body.student_id, req.body.course_id
export const validateRemoveCourseStudentPOST = [
    body("student_id")
        .exists().withMessage('The student ID must be specified.').bail()
        .trim().notEmpty().withMessage('The student ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The student ID must be a number greater than 0.').bail(),
    body("course_id")
        .exists().withMessage('The course ID must be specified.').bail()
        .trim().notEmpty().withMessage('The course ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The course ID must be a number greater than 0.').bail()
];


/////////////////////////////////////////////////////////////////////////////////////////////
// Validate that student ID parameter is a number
export const validateStudentId = [
    param("id")
        .exists().withMessage('A student ID must be specified.').bail()
        .trim().notEmpty().withMessage('A student ID must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The student ID must be a number greater than 0.').bail()
];


/////////////////////////////////////////////////////////////////////////////////////////////
// Validate post data when editing a student
// req.body.firstname, req.body.lastname, req.body.city, req.body.id
export const validateEditStudent = [
    body("id")
        .exists().withMessage('The ID of the student to edit must be specified.').bail()
        .trim().notEmpty().withMessage('A student ID to edit must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The student ID must be a number greater than 0.').bail()
        .custom(validateStudentIdExists).withMessage('The specified student ID does not exist.').bail(),
    body("firstname")
        .exists().withMessage('The first name must be specified.').bail()
        .trim().notEmpty().withMessage('The first name must be set.').bail()
        .isString().withMessage('The first name must be a text string.').bail()
        .isLength({ min: 2, max: 30 }).withMessage('The first name must be between 2-30 characters in length.').bail(),
    body("lastname")
        .exists().withMessage('The last name must be specified.').bail()
        .trim().notEmpty().withMessage('The last name must be set.').bail()
        .isString().withMessage('The last name must be a text string.').bail()
        .isLength({ min: 2, max: 30 }).withMessage('The last name must be between 2-30 characters in length.').bail(),
    body("city")
        .optional({ checkFalsy: true })
        .isString().withMessage('The city must be a text string.').bail()
        .isLength({ min: 0, max: 40 }).withMessage('City must be at most 40 characters in length.').bail()
];


/////////////////////////////////////////////////////////////////////////////////////////////
// Validate post data when editing a course
// req.body.name, req.body.description, req.body.id
export const validateEditCourse = [
    body("id")
        .exists().withMessage('The ID of the course to edit must be specified.').bail()
        .trim().notEmpty().withMessage('A course ID to edit must be set.').bail()
        .isInt({ gt: 0 }).withMessage('The course ID must be a number greater than 0.').bail(),
    body("name")
        .exists().withMessage('The course name must be specified.').bail()
        .trim().notEmpty().withMessage('The course name must be set.').bail()
        .isString().withMessage('The course name must be a text string.').bail()
        .isLength({ min: 2, max: 50 }).withMessage('The course name must be between 2-50 characters in length.').bail(),
    body("description")
        .optional({ checkFalsy: true })
        .isString().withMessage('The description must be a text string.').bail()
        .isLength({ min: 0, max: 2000 }).withMessage('The course description can be at most 2000 characters in length.').bail()
];

/*************************************************************************************
 * Custom validation functions
 *************************************************************************************/


// Check if a student with the specified ID exists in the database.
async function validateStudentIdExists(value) {
    return new Promise(async (resolve, reject) => {
        try {
            const [student] = await db.execute(`SELECT COUNT(id) AS matches FROM students WHERE id = ?`, [value]);
            if (student && student[0] && student[0].matches && (student[0].matches == 1)) {
                resolve();
            }
            else {
                reject("The specified student ID does not exist. ");
            }
        }
        catch (error) {
            console.log("Error: ", error);
            reject(error.message);
        }
    });
}

// Check if a course with the specified ID exists in the database.
async function validateCourseIdExists(value) {
    return new Promise(async (resolve, reject) => {
        try {
            const [course] = await db.execute(`SELECT COUNT(id) AS matches FROM courses WHERE id = ?`, [value]);
            if (course && course[0] && course[0].matches && (course[0].matches == 1)) {
                resolve();
            }
            else {
                reject("The specified course ID does not exist. ");
            }
        }
        catch (error) {
            console.log("Error: ", error);
            reject(error.message);
        }
    });
}

// Check that a course/student connection does not already exist
async function validateStudentNotInCourse(value, { req }) {
    return new Promise(async (resolve, reject) => {
        try {
            const [course] = await db.execute(`SELECT COUNT(*) AS matches FROM students_courses WHERE course_id = ? AND student_id = ?`, [value, req.params.student ?? req.body.student_id]);
            if (course && course[0] && course[0].matches && (course[0].matches == 1)) {
                reject("The student is already assigned to that course.");
            }
            else {
                resolve();
            }
        }
        catch (error) {
            console.log("Error: ", error);
            reject(error.message);
        }
    });
}