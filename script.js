//Array of headers for each table, in the same order as in the tables
let headerNames = ['Code', 'Type', 'Sec', 'Units', 'Instructor', 'Modality', 'Time', 'Place', 'Final', 'Max', 'Enr', 'WL', 'Req', 'Nor', 'Restr', 'Textbooks', 'Web', 'Status'];

//This function gets called when the page loads. No need to modify.
function execute() {
    addKeybindListener();
    populateCourseAccordion(courses_full);
    makeSummary();
    makeResponsive();
    makeFilter();
}

//TODO: Update this helper function to indicate whether the passed-in course is an Undergraduate Lower Division Course, based on the course number.
function isUgradLowerDiv(courseNumber) {
    return courseNumber < 100;
}

//TODO: Update this helper function to indicate whether the passed-in course is an Undergraduate Lower Division Course, based on the course number.
function isUgradUpperDiv(courseNumber) {
    return courseNumber < 200 && courseNumber >100;
}

//TODO: Update this helper function to indicate whether the passed-in course is an MHCID Course, based on the course number.
function isMHCID(courseNumber) {
    return courseNumber < 290 && courseNumber > 280;
}

//TODO: Update this helper function to indicate whether the passed-in course is a PhD Course, based on the course number.
function isPhD(courseNumber) {
    return courseNumber < 280 && courseNumber > 200;
}

//TODO: Populate the Department Summary table with the number of courses and students in each course category.
function makeSummary() {
    //Initialize variables to keep track of course and enrollment counts in each category
    let lowerDivCount = 0;
    let upperDivCount = 0;
    let mhcidCount = 0;
    let phdCount = 0;
    let lowerDivEnroll = 0;
    let upperDivEnroll = 0;
    let mhcidEnroll = 0;
    let phdEnroll = 0;
    //TODO: Loop over each course, count up the number of courses in each category
    for(let course of courses) {
        // TODO: Use if statements to check which category (lower-division, 
        // MHCID, etc.) the course falls into, add to the couse count and
        // enrollment totals
        isUgradLowerDiv(course.courseNumber) ?
                (lowerDivCount++, lowerDivEnroll+=course.studentsEnrolled)
            : isUgradUpperDiv(course.courseNumber) ?
                (upperDivCount++, upperDivEnroll+=course.studentsEnrolled)
            : isPhD(course.courseNumber) ?
                (phdCount++, phdEnroll+=course.studentsEnrolled)
            : isMHCID(course.courseNumber) ?
                (mhcidCount++, mhcidEnroll+=course.studentsEnrolled)
            : null;
    }
    //Sets the text content of each ID to the associated enrollment variables
    document.getElementById("lowerDivisionCount").textContent = lowerDivCount;
    document.getElementById("upperDivisionCount").textContent = upperDivCount;
    document.getElementById("mhcidCount").textContent = mhcidCount;
    document.getElementById("phdCount").textContent = phdCount;
    document.getElementById("lowerDivisionEnrollment").textContent = lowerDivEnroll;
    document.getElementById("upperDivisionEnrollment").textContent = upperDivEnroll;
    document.getElementById("mhcidEnrollment").textContent = mhcidEnroll;
    document.getElementById("phdEnrollment").textContent = phdEnroll;
    document.getElementById("totalCount").textContent = lowerDivCount + upperDivCount + mhcidCount + phdCount;
    document.getElementById("totalEnrollment").textContent = lowerDivEnroll + upperDivEnroll + mhcidEnroll + phdEnroll;
}

//TODO: Make the tables in each accordion responsive by hiding progressively more columns as screen size shrinks.
// It is up to you exactly which columns to hide at what breakpoint. Instructor, Time, Place, and Enr must always be visible.
function makeResponsive() {
    //TODO: Loop over each course, get the table containing course time, instructor information, etc.
    //The table may not exist for every course, especially after you implement filtering!

    let smCols = [];
    let mdCols = [];
    let lgCols = [];

    // We will use the keys of our first activity object if it exists
    if(courses_full.length && courses_full[0].allClassActivities.length){

        let keys = Object.keys(courses_full[0].allClassActivities[0]);

        //get sm indexes and build query selector
        smCols = [
            'Instructor',
            'Time',
            'Place',
            'Enr'
        ].map( (col)=>{
            //determine child index
            return keys.indexOf(col);
        }).map( (col)=>{
            return `th:nth-child(${col+1}), td:nth-child(${col+1})`;
        }).join(', ');

        //get md indexes and build query selector
        mdCols = [
            'Instructor',
            'Time',
            'Place',
            'Enr',
            'Code',
            'Type',
            'Sec',
            'Units'
        ].map( (col)=>{
            //determine child index
            return keys.indexOf(col);
        }).map( (col)=>{
            return `th:nth-child(${col+1}), td:nth-child(${col+1})`;
        }).join(', ');

        //get lg indexes and build query selector
        lgCols = [
            'Instructor',
            'Time',
            'Place',
            'Enr',
            'Code',
            'Type',
            'Sec',
            'Units',
            'Final',
            'Modality'
        ].map( (col)=>{
            //determine child index
            return keys.indexOf(col);
        }).map( (col)=>{
            return `th:nth-child(${col+1}), td:nth-child(${col+1})`;
        }).join(', ');
    }

    for(let course of courses) {
        let tableId = course.department + course.fullCourseNumber + '_table';
        let courseTable = document.getElementById(tableId);
        if(courseTable) {
            //TODO: For the header row and all of the rows in the body of the table, add CSS classes to hide some of the columns on smaller screens
            //Use "display" properties, using "d-none" to hide on small screens and the appropriate syntax to show on larger screens
            //See https://getbootstrap.com/docs/5.3/utilities/display/

            courseTable
                .querySelectorAll('th, td')
                .forEach( el => el.classList.add('d-none','d-xl-block'));

            courseTable
                .querySelectorAll(smCols)
                .forEach( (el)=>{
                    el.classList.remove('d-none')
                    el.classList.add('d-sm-block')
                });

            courseTable
                .querySelectorAll(mdCols)
                .forEach( (el)=>{
                    el.classList.add('d-md-block')
                });
            
            courseTable
                .querySelectorAll(lgCols)
                .forEach( (el)=>{
                    el.classList.add('d-lg-block')
                });

        }
    }

}

//TODO: Filter the list of courses 
function makeFilter() {
    //Gets whether each checkbox is checked.
    let ugradLowerChecked = document.getElementById('ugradLowerCheckbox').checked;
    let ugradUpperChecked = document.getElementById('ugradUpperCheckbox').checked;
    let mhcidChecked = document.getElementById('mhcidCheckbox').checked;
    let phdChecked = document.getElementById('phdCheckbox').checked;
    //Instructor names are written in all-caps, so this makes your search case-insensitive.
    let searchText = document.getElementById('search').value.toUpperCase();
    let coursesToSearch = [];
    for(let course of courses_full) {
        //TODO: Use your helper functions to only add a course in each category (lower-division, etc.) if the corresponding checkbox was checked
        coursesToSearch = courses_full.filter( (course)=>{
        //    if(course.primaryInstructor)
            let isChecked =
                (isUgradLowerDiv(course.courseNumber) && ugradLowerChecked) ||
                (isUgradUpperDiv(course.courseNumber) && ugradUpperChecked) ||
                (isMHCID(course.courseNumber) && mhcidChecked) ||
                (isPhD(course.courseNumber) && phdChecked) ||
                (!phdChecked && !mhcidChecked && !ugradLowerChecked && !ugradUpperChecked);
            //TODO: Check that the instructor's name contains the searched text. The "includes" function might help
            //See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes#examples
            let isInstructor = course.primaryInstructor.toLowerCase().indexOf(searchText.toLowerCase())>=0;
            return isInstructor && isChecked;
        });
    }
    //TODO: remove this line after implementing the for loop above
    // coursesToSearch = courses_full;
    //TODO: Use document.getElementById to update the span tag with the number of courses
    document.getElementById('numberCourses').textContent = coursesToSearch.length;
    //Re-populates the course accordion with the courses to search for, and make your tables responsive again. No need to modify
    populateCourseAccordion(coursesToSearch);
    makeResponsive();
}

////-----From here down are some helper functions we have written to create the course accordions.-----
////-----You will need to call these functions, but you do not need to modify them!--------------------

//Adds an EventListener to the search text box on key up (release a pressed key), calls the makeFilter button.
function addKeybindListener() {
    let searchInput = document.getElementById('search');
    searchInput.addEventListener('keyup', makeFilter);
}

//Populates the accordion of courses with accordion items for each course.
function populateCourseAccordion(courses_to_populate) {
    let accordion = document.getElementById("courseAccordion");
    //Clear all current elements in the accordion. Allows for updates when checkbox or search is changed
    accordion.replaceChildren();
    //Loop over all courses to add, create and add accordion item for each one
    for(let course of courses_to_populate) {
        let accordionItem = createAccordionItem(course);
        accordion.appendChild(accordionItem);
    }
}

//Creates an accordion item for the course passed in.
function createAccordionItem(course) {
    //Create an accordion item for the course
    let courseId = course.department + course.fullCourseNumber;
    let accordionItem = document.createElement('div');
    accordionItem.className = 'accordion-item';
    //Create a header element for the course
    let accordionHeader = document.createElement('h2');
    accordionItem.appendChild(accordionHeader);
    accordionHeader.className = 'accordion-header';
    //Create an accordion button and give it attributes
    let accordionButton = document.createElement('button');
    accordionHeader.appendChild(accordionButton);
    accordionButton.className = 'accordion-button collapsed';
    accordionButton.setAttribute('type', 'button');
    accordionButton.setAttribute('data-bs-toggle', 'collapse');
    accordionButton.setAttribute('data-bs-target', '#' + courseId);
    accordionButton.setAttribute('aria-expanded', 'true');
    accordionButton.setAttribute('aria-controls', courseId);
    accordionButton.textContent = course.fullCourseTitle;
    //create the collapsed content in the accordion
    let courseDiv = document.createElement('div');
    accordionItem.appendChild(courseDiv);
    courseDiv.setAttribute('id', courseId);
    courseDiv.className = 'accordion-collapse collapse';
    courseDiv.setAttribute('data-bs-parent', 'courseAccordion');
    //create the body of the accordion
    let courseBody = document.createElement('div');
    courseDiv.appendChild(courseBody);
    courseBody.className = 'accordion-body';
    //create the table with instructors, etc. for the course
    let courseTable = createCourseTable(course);
    courseBody.appendChild(courseTable);
    return accordionItem;
}

//Creates the table within each course that lists information like enrollment level, course time, and instructor(s).
//The table is a Boostrap container ("container-fluid"), with each row and column having the appropriate "row" and "col" attributes.
function createCourseTable(course) {
    //create the course table
    let courseTable = document.createElement('table');
    courseTable.className = 'table table-striped container-fluid';
    courseTable.setAttribute('id', course.department + course.fullCourseNumber + '_table');
    //creater the header row
    let thead = document.createElement('thead');
    courseTable.appendChild(thead);
    let headerRow = document.createElement('tr');
    headerRow.className = 'row';
    thead.appendChild(headerRow);
    //add each header column to the header row
    for(let header of headerNames) {
        let headerElement = document.createElement('th');
        headerElement.className = 'col';
        headerElement.textContent = header;
        headerRow.appendChild(headerElement);
    }
    //create the table body
    let tbody = document.createElement('tbody');
    courseTable.appendChild(tbody);
    //add each class activity as its own row in the table
    for(let classActivity of course.allClassActivities) {
        let row = document.createElement('tr');
        row.className = 'row';
        //for each header, create a new table cell with that class activity
        for(let header of headerNames) {
            let tableElement = document.createElement('td');
            tableElement.className = 'col';
            tableElement.textContent = classActivity[header];
            row.appendChild(tableElement);
        }
        tbody.appendChild(row);
    }
    return courseTable;
}