const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  test("works for users: create job post", async function () {
    const jobData = {
      title: "cashier",
      salary: 40000,
      equity: 0,
      company_handle: "c1",
    };

    const resp = await request(app).post("/jobs").send(jobData);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body.job.title).toEqual(jobData.title);
    expect(resp.body.job.salary).toEqual(jobData.salary);
    expect(Number(resp.body.job.equity)).toEqual(jobData.equity);
    expect(resp.body.job.company_handle).toEqual(jobData.company_handle);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("works for users: get jobs", async function () {
    const resp = await request(app).get("/jobs");

    expect(resp.body.results[0].title).toEqual("job1");
    expect(resp.body.results[0].salary).toEqual(100000);
    expect(Number(resp.body.results[0].equity)).toEqual(0.5);
    expect(resp.body.results[0].company_handle).toEqual("c1");

    expect(resp.body.results[1].title).toEqual("job2");
    expect(resp.body.results[1].salary).toEqual(50000);
    expect(Number(resp.body.results[1].equity)).toEqual(0);
    expect(resp.body.results[1].company_handle).toEqual("c2");
  });

  test("works for users: get job by id", async function () {
    const jobData = [
      {
        title: "cashier",
        salary: 40000,
        equity: 0,
        company_handle: "c1",
      },
      {
        title: "manager",
        salary: 50000,
        equity: 0,
        company_handle: "c1",
      },
    ];

    const data = await request(app).post("/jobs").send(jobData);

    const id = 1;
    const resp = await request(app).get(`/jobs/${id}`);
    console.log(resp.body);
    expect(resp.body.job.title).toEqual("cashier");
    expect(resp.body.job.salary).toEqual(40000);
    expect(resp.body.job.equity).toEqual("0");
    expect(resp.body.job.company_handle).toEqual("c1");
  });
});

describe("GET /jobs?", function () {
  test("works for users: filter jobs shown", async function () {
    const resp = await request(app).get("/jobs?title=job1");
    expect(resp.body).toEqual({
      results: [
        {
          title: "job1",
          salary: 100000,
          equity: "0.5",
          company_handle: "c1",
        },
      ],
    });
  });
  test("works for users: filter jobs shown", async function () {
    const resp = await request(app).get(
      "/jobs?title=job1&minSalary=50000&equity=true"
    );
    expect(resp.body).toEqual({
      results: [
        {
          title: "job1",
          salary: 100000,
          equity: "0.5",
          company_handle: "c1",
        },
      ],
    });
  });
});

/************************************** PATCH /jobs */

describe("PATCH /jobs", function () {
  test("works for users: update job", async function () {
    const testId = 1;
    const job = await request(app).patch(`/jobs/${testId}`).send({
      title: "newJob1",
      salary: 100000,
      equity: "0.5",
      company_handle: "c1",
    });
    console.log(job.body);
    expect(job.body.title).toEqual("newJob1");
  });
});

/************************************** DELETE /jobs */

describe("Delete /job", function () {
  test("works for users: delete job", async function () {
    const testId = 1;
    const resp = await request(app).delete(`/jobs/${testId}`);

    expect(resp.body).toEqual({ deleted: testId });
  });
});
