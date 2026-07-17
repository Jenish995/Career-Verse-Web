const request = require("supertest");
const app = require("../app");
const pool = require("../database/db");


const JOB_ID = "fce92cd1-3f42-434e-b90c-e451a8cd0d3e";
const CANDIDATE_ID = "60bc8efa-3dc7-4450-af6a-0aeabc9c7f64";


describe("Application API Tests", () => {

    test("Candidate should apply for a job successfully", async () => {

        const response = await request(app)
            .post("/api/applications")
            .send({
                jobId: JOB_ID,
                candidateId: CANDIDATE_ID,
                resumeUrl: "resume.pdf",
                coverLetter: "I am interested in this position"
            });


        expect(response.statusCode)
            .toBe(201);

        expect(response.body.message)
            .toBe("Application submitted successfully");

        expect(response.body)
            .toHaveProperty("application");

    });


    afterAll(async () => {

        await pool.query(
            `DELETE FROM job_applications
             WHERE job_id = $1
             AND candidate_id = $2`,
            [
                JOB_ID,
                CANDIDATE_ID
            ]
        );

        await pool.end();

    });

});