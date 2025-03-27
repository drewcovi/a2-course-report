//This file is intended to work in node.js, which is server-side JavaScript, rather than a script you can load from a browser.

let fs = require('fs');
let { parse } = require('node-html-parser');

root = parse(fs.readFileSync('in4matx_sp2025.html', 'utf-8'));

let courseHeader = [
    "Code",
    "Type",
    "Sec",
    "Units",
    "Instructor",
    "Modality",
    "Time",
    "Place",
    "Final",
    "Max",
    "Enr",
    "WL",
    "Req",
    "Nor",
    "Rstr",
    "Textbooks",
    "Web",
    "Status"
];

let coursesToIgnore = ["H198", "199", "290", "298", "299"];

courseList = parseCourses(root, false);
fullCourses = parseCourses(root, true);

let courseListStr = 'let courses = ' + JSON.stringify(courseList, null, 2);
let fullCoursesStr = 'let courses_full = ' + JSON.stringify(fullCourses, null, 2);
fs.writeFileSync('../static_courses.js', courseListStr);
fs.writeFileSync('../static_courses_full.js', fullCoursesStr);

function parseCourses(root, addAllActivities=true) {
    let courses = [];
    let courseRows = [];
    let courseTableRows = root.querySelectorAll("div.course-list table tbody tr");
    for(let row of courseTableRows) {
        let addCourse = true;
        if(row.classList.contains("blue-bar")) {
            //Add the previous accordion item
            //Check ahead, is this a course?
            //Are there comments?
            let course = {};
            let title = courseRows[0].querySelector(".CourseTitle");
            if(title) {
                let titleText = title.innerText.replace('(Prerequisites)', '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s\s+/g, ' ').trim().toUpperCase();
                let titleRegex = /(.+) ([a-zA-z]?\d+[a-zA-z]?) (.*)/gm;
                let titleArray = titleRegex.exec(titleText);
                course['department'] = titleArray[1];
                course['fullCourseNumber'] = titleArray[2];
                if(coursesToIgnore.includes(course['fullCourseNumber'])) {
                    console.log('Ignoring ' + course['fullCourseNumber']);
                    addCourse = false;
                }
                course['courseNumber'] = Number(titleArray[2].replace(/[a-zA-Z]/g, ''));
                course['courseTitle'] = titleArray[3];
                course['fullCourseTitle'] = titleText;
            }
            classActivities = [];
            for(let i = 2; i < courseRows.length; i++) {
                if(courseRows[i].querySelector('.Comments')) {
                    continue;
                }
                let cells = courseRows[i].querySelectorAll('td');
                let classDict = {};
                for(let j = 0; j < courseHeader.length && j < cells.length; j++) {
                    if(cells[j].childNodes.length <= 1) {
                        let value = cells[j].innerText.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s\s+/g, ' ').trim();
                        if(['Code', 'Enr', 'Max', 'Nor', 'WL', 'Req', 'Units'].includes(courseHeader[j])) {
                            if(value == 'n/a') {
                                value = 0;
                            } else if(value.includes('/')) { //a cross-listed class, pick the denominator
                                value = Number(value.split('/')[1]);
                            } else if(value.includes('-')) { //a variable-credit class, just assume the maximum
                                value = Number(value.split('-')[1]);
                            } else {
                                value = Number(value);
                            }
                        }
                        classDict[courseHeader[j]] = value;
                    } else {
                        //This one only applies to the instructor field, where there may be multiple rows
                        classDict[courseHeader[j]] = [];
                        for(let child of cells[j].childNodes) {
                            if(child.textContent) {
                                classDict[courseHeader[j]].push(child.textContent);
                            }
                        }
                        classDict[courseHeader[j]] = classDict[courseHeader[j]].join('\n');
                    }
                }
                if(Object.keys(classDict).length != 0) {
                    classActivities.push(classDict);
                }
            }
            //Either there's only one class activity, or the primary activity is lecture-based
            if(classActivities.length == 1 || classActivities[0]['Type'] == 'Lec') {
                let allLectures = classActivities.filter(activity => activity['Type'] == 'Lec');
                course['seminarCourse'] = false;
                if(allLectures.length <= 1) {
                    //The first thing might not be a lecture, but if there's only one activity we can assume it has unit etc. info
                    let lecture = classActivities[0];
                    course['units'] = lecture['Units'];
                    course['studentsEnrolled'] = lecture['Enr'];
                    course['maxEnrollment'] = lecture['Max'];
                    course['studentsWaitlisted'] = lecture['WL'];
                    //\n is used to include TAs, etc. Just grab the first instructor.
                    course['primaryInstructor'] = lecture['Instructor'].split('\n')[0];
                } else {
                    //This accounts for cases where more than one lecture of the same course is offered. Typically by different instructors, or one instructor multiple times
                    course['units'] = allLectures[0]['Units'];
                    course['studentsEnrolled'] = allLectures.reduce((acc, cur) => acc + cur['Enr'], 0);
                    course['maxEnrollment'] = allLectures.reduce((acc, cur) => acc + cur['Max'], 0);
                    course['studentsWaitlisted'] = allLectures.reduce((acc, cur) => acc + cur['WL'], 0);
                    course['primaryInstructor'] = allLectures.map(lec => lec['Instructor']).join(' & ');
                }
            } else {
                course['seminarCourse'] = true;
            }

            if(addAllActivities) {
                course['allClassActivities'] = classActivities;
            }
            if(addCourse) {
                courses.push(course);
            }
            courseRows = [];
        }
        else if(!['num-range-comment', 'college-title', 'college-comment', 'white-bar', 'dept-title', 'dept-comment', 'white-bar-thick'].some(className => row.classList.contains(className))) {
            courseRows.push(row);
        }
    }
    return courses;
}