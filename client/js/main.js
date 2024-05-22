/*
    Slutprojekt Backend Databaser (FE23 Grit Academy)
    Kristoffer Bengtsson

    main.js
    Client-side javascript for the administration pages. Handle edit/delete form actions and dialog boxes. 
*/
const BASE_URL = "http://localhost:3000/";
let BEARER_TOKEN = "";

getApiToken();

//////////////////////////////////////////////////////////////////////////////
// Submit handler for the Edit and Delete student buttons
const studentAdminButtons = document.querySelector("#student-admin-form");
if (studentAdminButtons) {
    studentAdminButtons.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Edit student button clicked
        if (event.submitter.name == "edit") {
            // Get info about student and fill in the edit student form fields, then show the edit dialog. 
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
                // Delete student using API endpoint. 
                const url = new URL(`${BASE_URL}api/student/delete/${event.submitter.value}`);
                const response = await fetch(url, {
                    method: "DELETE",
                    headers: { 'Authorization': 'Bearer ' + BEARER_TOKEN }
                });
                const result = await response.json();
                if (result.status.deleted == 1) {
                    window.location.href = "/students";
                }
            }
        }
    });
}


//////////////////////////////////////////////////////////////////////////////
// Handler for the Cancel button in the Edit Student dialog - close the dialog box
// without submitting the form.   
const cancelEditStudentButton = document.querySelector("#student-edit-cancel");
if (cancelEditStudentButton) {
    cancelEditStudentButton.addEventListener("click", (event) => {
        document.querySelector("#student-edit-dialog").close();
    })
}


//////////////////////////////////////////////////////////////////////////////
// Handler for button to show create new course dialog containing the form.
const newCourseButton = document.querySelector("#create-course-button");
if (newCourseButton) {
    newCourseButton.addEventListener("click", (event) => {
        document.querySelector("#create-course-dialog").showModal();
    });
}


//////////////////////////////////////////////////////////////////////////////
// Handler for button to cancel creating a new course, closing the dialog box
// without submitting the form. 
const newCourseCancelButton = document.querySelector("#create-cource-cancel-button");
if (newCourseCancelButton) {
    newCourseCancelButton.addEventListener("click", (event) => {
        document.querySelector("#create-course-dialog").close();
    });
}


//////////////////////////////////////////////////////////////////////////////
// Handler for the delete course button.
const deleteCourseButton = document.querySelector("#delete-course-button");
if (deleteCourseButton) {
    deleteCourseButton.addEventListener("click", async (event) => {
        if (confirm("Are you sure you wish to delete this course?")) {
            // Delete course using API endpoint. 
            const url = new URL(`${BASE_URL}api/course/delete/${event.currentTarget.value}`);
            const response = await fetch(url, {
                method: "DELETE",
                headers: { 'Authorization': 'Bearer ' + BEARER_TOKEN }
            });
            const result = await response.json();
            if (result.status.deleted == 1) {
                window.location.href = "/courses";
            }
        }
    });
}


//////////////////////////////////////////////////////////////////////////////
// Controls for editing the name and description of existing courses.
const editCourseName = document.querySelector("#course-info-name");
if (editCourseName) {
    const editCourseDesc = document.querySelector("#course-info-desc");
    const saveNameButton = document.querySelector("#course-info-name-save");
    const saveDescButton = document.querySelector("#course-info-desc-save");
    const cancelNameButton = document.querySelector("#course-info-name-cancel");
    const cancelDescButton = document.querySelector("#course-info-desc-cancel");
    const undoValues = { name: editCourseName.innerText, description: editCourseDesc.innerText };

    // Cancel button for name field. Stop editing and restore original content.
    cancelNameButton.addEventListener("click", (event) => {
        editCourseName.innerText = undoValues.name;
        setCourseEditorState(saveNameButton, editCourseName, true);
        cancelNameButton.classList.add("hide");
    });

    // Cancel button for description field, stop editing and restore original content.
    cancelDescButton.addEventListener("click", (event) => {
        editCourseDesc.innerText = undoValues.description;
        setCourseEditorState(saveDescButton, editCourseDesc, true);
        cancelDescButton.classList.add("hide");
    });

    // Handlers for edit/save buttons. Edit button enables editing and changes over to
    // being a save button, which will stop editing and submit the current values to the server. 
    saveNameButton.addEventListener("click", (event) => {
        if (event.currentTarget.value == "save") {
            saveCourseInfo(editCourseName.innerText, editCourseDesc.innerText);
            setCourseEditorState(saveNameButton, editCourseName, true);
            cancelNameButton.classList.add("hide");
        }
        else if (event.currentTarget.value == "edit") {
            setCourseEditorState(saveNameButton, editCourseName, false);
            cancelNameButton.classList.remove("hide");
        }
    });

    saveDescButton.addEventListener("click", (event) => {
        if (event.currentTarget.value == "save") {
            saveCourseInfo(editCourseName.innerText, editCourseDesc.innerText);
            setCourseEditorState(saveDescButton, editCourseDesc, true);
            cancelDescButton.classList.add("hide");
        }
        else if (event.currentTarget.value == "edit") {
            setCourseEditorState(saveDescButton, editCourseDesc, false);
            cancelDescButton.classList.remove("hide");
        }
    });
}

// Support function for toggling the function of the edit/save button
// and editing of the name and description fields on the courses page. 
function setCourseEditorState(buttonElement, dataElement, isEditButton) {
    if (isEditButton) {
        buttonElement.value = "edit";
        buttonElement.innerText = "Edit";
        buttonElement.classList.remove("editing");
        dataElement.setAttribute("contenteditable", "false");
        dataElement.blur();
    }
    else {
        buttonElement.value = "save";
        buttonElement.innerText = "Save";
        buttonElement.classList.add("editing");
        dataElement.setAttribute("contenteditable", "true");
        dataElement.focus();
    }
}


//////////////////////////////////////////////////////////////////////////////
// Submit post data to server to update the currently displayed course.
async function saveCourseInfo(name, description) {
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('id')) {
            const url = new URL(`${BASE_URL}course/edit`);
            const formData = {
                id: params.get('id'),
                name: name,
                description: description
            }

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (response.url) {
                window.location.href = response.url;
            }
        }
    }
    catch (error) {
        console.log("Error: ", error);
    }
}


//////////////////////////////////////////////////////////////////////////////
// Authenticate with API and get a bearer token
async function getApiToken(name = "Admin", pass = "Test") {
    try {
        const loginData = { username: name, password: pass };
        const url = new URL(`${BASE_URL}api/get-auth-token`);

        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();
        if (result.accessToken && result.accessToken.length > 0) {
            BEARER_TOKEN = result.accessToken;
        }
    }
    catch (error) {
        console.log("Error getting bearer token: ", error);
    }
}
