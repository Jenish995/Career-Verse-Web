const request = require("supertest");
const app = require("../app");


describe("Job API Tests", () => {


    test("Recruiter should create a job successfully", async () => {

        const response = await request(app)
            .post("/api/jobs")
            .send({
                companyId: "759f5c41-942b-458a-a9ef-b892dc8d0e4e",
                title: "Frontend Developer",
                category: "Software Development",
                location: "Kathmandu",
                jobType: "Full Time",
                workMode: "Remote",
                experienceLevel: "Junior",
                description: "Looking for a React developer with JavaScript experience",
                salaryMin: 30000,
                salaryMax: 50000,
                openings: 2,
                skills: [
                    "React",
                    "JavaScript"
                ],
                benefits: [
                    "Remote work",
                    "Flexible hours"
                ],
                recruiterName: "Test Recruiter",
                recruiterRole: "HR"
            });


        expect(response.statusCode)
            .toBe(201);


        expect(response.body.message)
            .toBe("Job created successfully");


        expect(response.body)
            .toHaveProperty("job");


        expect(response.body.job)
            .toHaveProperty("title");


    });



    test("Should get all jobs successfully", async () => {


        const response = await request(app)
            .get("/api/jobs");


        expect(response.statusCode)
            .toBe(200);


        expect(response.body)
            .toHaveProperty("jobs");


        expect(Array.isArray(response.body.jobs))
            .toBe(true);


    });


});