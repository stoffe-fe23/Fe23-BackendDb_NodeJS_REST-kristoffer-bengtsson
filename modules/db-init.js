/*
    Slutprojekt Backend Databaser (FE23 Grit Academy)
    Kristoffer Bengtsson

    db-init.js
    Module containing function for initial setup of the database,
    creating the needed tables if they do not already exist. 
*/
import db from "./db.js";

const databaseInit = async () => {
    try {
        const createStudents = `CREATE TABLE IF NOT EXISTS students (
            id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            firstname VARCHAR(30) NOT NULL,
            lastname VARCHAR(30) NOT NULL,
            city VARCHAR(40)
        ) ENGINE=INNODB CHARACTER SET utf8mb4 COLLATE utf8mb4_swedish_ci`;

        const createCourses = `CREATE TABLE IF NOT EXISTS courses (
            id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(50) NOT NULL,
            description TEXT DEFAULT ''
        ) ENGINE=INNODB CHARACTER SET utf8mb4 COLLATE utf8mb4_swedish_ci`;

        const createStudentsCourses = `CREATE TABLE IF NOT EXISTS students_courses (
            id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            student_id INT UNSIGNED NOT NULL,
            course_id INT UNSIGNED NOT NULL,
            FOREIGN KEY (student_id) REFERENCES students(id),
            FOREIGN KEY (course_id) REFERENCES courses(id)
        ) ENGINE=INNODB CHARACTER SET utf8mb4 COLLATE utf8mb4_swedish_ci`;

        await db.query(createStudents);
        await db.query(createCourses);
        await db.query(createStudentsCourses);
    }
    catch (error) {
        console.log("Database init error: ", error);
    }
}

export default databaseInit;