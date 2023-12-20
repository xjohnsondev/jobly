const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const app = require("../app");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

beforeEach(async () => {
  await Job.create({
    title: "job1",
    salary: 100000,
    equity: 0.5,
    company_handle: "c1",
  }),
    await Job.create({
      title: "job2",
      salary: 50000,
      equity: 0,
      company_handle: "c2",
    });
});

describe("POST create job", function () {
  const job = {
    title: "T1",
    salary: 100,
    equity: 0,
    company_handle: "c1",
  };

  test("works", async function () {
    let resp = await Job.create(job);
    console.log(resp);
    expect(resp).toEqual({
      title: "T1",
      salary: 100,
      equity: "0",
      company_handle: "c1",
    });
  });
});

describe("GET all jobs", function () {
  test("gets all jobs", async function () {
    const resp = await Job.findAll();
    console.log(resp);
    expect(resp).toEqual([
      {
        title: "job1",
        salary: 100000,
        equity: "0.5",
        company_handle: "c1",
      },
      {
        title: "job2",
        salary: 50000,
        equity: "0",
        company_handle: "c2",
      },
    ]);
  });
});

describe("PATCH job", function () {
  test("update a job", async function () {
    const newData = {
      title: "newjob",
      salary: 50,
      equity: 0,
      company_handle: "c1",
    };
    let job = await Job.update(1, newData);
    expect(job).toEqual({
      title: "newjob",
      salary: 50,
      equity: 0,
      company_handle: "c1",
    });
  });
});

describe("DELETE job", function () {
  test("delete job", async function () {
    await Job.remove(1);
    let resp = await Job.findAll();
    expect(resp).toEqual({
      title: "job2",
      salary: 50000,
      equity: 0,
      company_handle: "c2",
    });
  });
});
