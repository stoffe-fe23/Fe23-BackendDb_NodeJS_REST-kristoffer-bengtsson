/*
    Slutprojekt Backend Databaser (FE23 Grit Academy)
    Kristoffer Bengtsson

    main.js
    Client-side javascript for the administration pages. Handle edit/delete form actions and dialog boxes. 
*/
const BASE_URL = "http://localhost:3000/";

// Submit handler for the Edit and Delete student buttons
const studentAdminButtons = document.querySelector("#student-admin-form");
if (studentAdminButtons) {
    studentAdminButtons.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Edit student button clicked
        if (event.submitter.name == "edit") {
            const url = new URL(`${BASE_URL}api/student/get/${event.submitter.value}`);
            const response = await fetch(url);
            const [result] = await response.json();

            document.querySelector("#student-edit-fname").value = result.firstname;
            document.querySelector("#student-edit-lname").value = result.lastname;
            document.querySelector("#student-edit-city").value = result.city;
            document.querySelector("#student-edit-id").value = result.id;
            document.querySelector("#student-edit-dialog").showModal();
        }
        // Delete student button clicked
        else if (event.submitter.name == "delete") {
            if (confirm("Are you sure you wish to remove this student?")) {
                const url = new URL(`${BASE_URL}api/student/delete/${event.submitter.value}`);
                const response = await fetch(url, { method: "DELETE" });
                const result = await response.json();
                if (result.status.deleted == 1) {
                    window.location.href = "/students";
                }
            }
        }
    });
}

// Handler for the Cancel button in the Edit Student dialog - close the dialog box.  
const cancelEditStudentButton = document.querySelector("#student-edit-cancel");
if (cancelEditStudentButton) {
    cancelEditStudentButton.addEventListener("click", (event) => {
        document.querySelector("#student-edit-dialog").close();
    })
}

// Handler for button to show create new course dialog.
const newCourseButton = document.querySelector("#create-course-button");
if (newCourseButton) {
    newCourseButton.addEventListener("click", (event) => {
        document.querySelector("#create-course-dialog").showModal();
    });
}

// Handler for button to cancel creating a new course, closing the dialog box.
const newCourseCancelButton = document.querySelector("#create-cource-cancel-button");
if (newCourseCancelButton) {
    newCourseCancelButton.addEventListener("click", (event) => {
        document.querySelector("#create-course-dialog").close();
    });
}

// Handler for the delete course button.
const deleteCourseButton = document.querySelector("#delete-course-button");
if (deleteCourseButton) {
    deleteCourseButton.addEventListener("click", async (event) => {
        if (confirm("Are you sure you wish to delete this course?")) {
            const url = new URL(`${BASE_URL}api/course/delete/${event.currentTarget.value}`);
            const response = await fetch(url, { method: "DELETE" });
            const result = await response.json();
            if (result.status.deleted == 1) {
                window.location.href = "/courses";
            }
        }
    });
}