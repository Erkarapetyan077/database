POST http://localhost:3000/api/auth/register

input : {
"fullName": "Test Student 2",
"email": "teststudent2@example.com",
"password": "Password123!"
}

output: {
"message": "User registered successfully",
"user": {
"id": 43,
"fullName": "Test Student 2",
"email": "teststudent2@example.com",
"role": "student"
}
}

POST http://localhost:3000/api/auth/login

input: {
"email": "student@example.com",
"password": "Password123!"
}

output: {
"message": "Login successful",
"result": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3OTIwMDEzMDgsImV4cCI6MTc5MjA4NzcwOH0.jIO1xU6pB2hwyqewmeXqPxbIIKetLv0lsFGPr2mEPSs",
"user": {
"id": 9,
"fullName": "Test Student",
"email": "student@example.com",
"role": "student"
}
}

GET http://localhost:3000/api/auth/me

input : BEARER eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3OTIwMDEzMDgsImV4cCI6MTc5MjA4NzcwOH0.jIO1xU6pB2hwyqewmeXqPxbIIKetLv0lsFGPr2mEPSs

output: {
"success": true,
"user": {
"id": 9,
"fullName": "Test Student",
"email": "student@example.com",
"role": "student"
}
}

POST http://localhost:3000/api/auth/login

input: {
"email": "student@example.com",
"password": "WrongPassword123!"
}

output: {
"success": false,
"statusCode": 401,
"message": "Invalid email or password"
}

POST http://localhost:3000/api/auth/register

input: {
"fullName": "Another Student",
"email": "student@example.com",
"password": "Password123!"
}

output: {
"success": false,
"statusCode": 409,
"message": "Email already exists"
}

POST http://localhost:3000/api/auth/register

input: {
"fullName": "Test Student",
"email": "missingpass@example.com"
}

output: {
"success": false,
"statusCode": 500,
"message": "Illegal arguments: undefined, number"
}

GET http://localhost:3000/api/courses

output: {
"success": true,
"data": [
{
"id": 1,
"title": "JavaScript Basics",
"description": "Learn JavaScript from the beginning",
"category": "Programming",
"level": "beginner",
"price": "50.00",
"isPublished": true,
"instructorId": 1,
"createdAt": "2026-10-07T14:49:32.108Z",
"updatedAt": "2026-10-07T14:49:32.108Z",
"lessonCount": "0",
"instructor": {
"id": 1,
"fullName": "Erik",
"email": "erik@gmail.com"
}
},
{
"id": 4,
"title": "Node.js Backend Basics",
"description": "Learn Node.js and Express from the beginning",
"category": "Backend",
"level": "beginner",
"price": "80.00",
"isPublished": true,
"instructorId": 8,
"createdAt": "2026-10-14T16:51:19.931Z",
"updatedAt": "2026-10-14T16:51:19.931Z",
"lessonCount": "2",
"instructor": {
"id": 8,
"fullName": "Course Instructor",
"email": "instructor@example.com"
}
},
{
"id": 2,
"title": "Node.js Backend",
"description": "Learn Node.js and Express from zero",
"category": "Backend",
"level": "beginner",
"price": "80.00",
"isPublished": true,
"instructorId": 5,
"createdAt": "2026-10-07T15:08:08.866Z",
"updatedAt": "2026-10-07T15:08:08.866Z",
"lessonCount": "0",
"instructor": {
"id": 5,
"fullName": "Instructor Erik",
"email": "instructor@gmail.com"
}
}
]
}

GET http://localhost:3000/api/course

output: 404 NOT FOUND

GET http://localhost:3000/api/courses/my

output: 401 Unauthorized

GET http://localhost:3000/api/courses/my

output: 403 Forbidden

GET http://localhost:3000/api/courses/1/students

input: BEARER eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3OTIwMDEzMDgsImV4cCI6MTc5MjA4NzcwOH0.jIO1xU6pB2hwyqewmeXqPxbIIKetLv0lsFGPr2mEPSs

output: 403 Forbidden

GET http://localhost:3000/api/courses/1/students

output: 401 Unauthorized

GET http://localhost:3000/api/lessons/1/lessons

output: {
"success": false,
"statusCode": 403,
"message": "You do not have permission to access this lesson"
}

GET http://localhost:3000/api/lessons/99999/lessons

output: {
"success": false,
"statusCode": 404,
"message": "Lesson not found"
}

GET http://localhost:3000/api/enrollments/me

input: BEARER eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3OTIwMDEzMDgsImV4cCI6MTc5MjA4NzcwOH0.jIO1xU6pB2hwyqewmeXqPxbIIKetLv0lsFGPr2mEPSs

output: {
"success": true,
"data": []
}

200 OK

GET http://localhost:3000/api/enrollments/me

output: 401 Unauthorized

POST http://localhost:3000/api/enrollments/1

output: {
"success": true,
"data": {
"enrolledAt": "2026-10-14T18:44:06.302Z",
"id": 2,
"userId": 9,
"courseId": 1,
"status": "active",
"progress": 0,
"updatedAt": "2026-10-14T18:44:06.303Z",
"createdAt": "2026-10-14T18:44:06.303Z"
}
}

POST http://localhost:3000/api/enrollments/99999

output: 404 NOT FOUND
