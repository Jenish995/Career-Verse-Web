const request = require("supertest");
const app = require("../app");
const pool = require("../database/db");


describe("Authentication API Tests", () => {


    test("Candidate should register successfully", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "testcandidate@gmail.com",
                password: "123456",
                role: "candidate",
                fullName: "Test Candidate"
            });


        expect(response.statusCode).toBe(201);

        expect(response.body.message)
            .toBe("Registration successful");

        expect(response.body)
            .toHaveProperty("token");

    });



    test("Recruiter should register successfully", async () => {

        const response = await request(app)
            .post("/api/auth/register")
            .send({
                email: "testrecruiter@gmail.com",
                password: "123456",
                role: "recruiter",
                fullName: "Test Recruiter",
                companyName: "Test Company",
                companyLocation: "Kathmandu"
            });


        expect(response.statusCode).toBe(201);

        expect(response.body.message)
            .toBe("Registration successful");

        expect(response.body.user.role)
            .toBe("recruiter");

        expect(response.body)
            .toHaveProperty("token");

    });



    test("Candidate should login successfully", async () => {

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "testcandidate@gmail.com",
                password: "123456"
            });


        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe("Login successful");

        expect(response.body.user.role)
            .toBe("candidate");

        expect(response.body)
            .toHaveProperty("token");

    });



    test("Recruiter should login successfully", async () => {

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "testrecruiter@gmail.com",
                password: "123456"
            });


        expect(response.statusCode).toBe(200);

        expect(response.body.message)
            .toBe("Login successful");

        expect(response.body.user.role)
            .toBe("recruiter");

        expect(response.body)
            .toHaveProperty("token");

    });



    test("Login should fail with incorrect password", async () => {

        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: "testcandidate@gmail.com",
                password: "wrongpassword"
            });


        expect(response.statusCode)
            .toBe(401);

        expect(response.body.message)
            .toBe("Invalid credentials");

    });


});


// Clean test data after all tests finish
afterAll(async () => {

    await pool.query(
        `DELETE FROM users 
         WHERE email IN ($1, $2)`,
        [
            "testcandidate@gmail.com",
            "testrecruiter@gmail.com"
        ]
    );

    await pool.end();

});