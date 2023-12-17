const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * Throws BadRequestError if job-company_handle already in database.
   * */
  static async create({ title, salary, equity, company_handle }) {
    const duplicateCheck = await db.query(
      `SELECT title, company_handle
            FROM jobs
            WHERE title = $1
            AND company_handle = $2`,
      [title, company_handle]
    );
    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate job: ${title} - ${company_handle}`);

    const result = await db.query(
      `INSERT INTO jobs
            (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING title, salary, equity, company_handle`,
      [title, salary, equity, company_handle]
    );
    const job = result.rows[0];
    return job;
  }

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */
  static async findAll() {
    const results = await db.query(
      `SELECT title, salary, equity, company_handle
      FROM jobs`
    );
    const jobs = results.rows;
    return jobs;
  }

  /** Given a job id, return data about job.
   *
   * Returns { title, salary, equity, company_handle }
   *   where jobs is [{ title, salary, equity, company_handle }, ...]
   *
   * Throws NotFoundError if not found.
   **/
  static async get(id) {
    const result = await db.query(
      `SELECT title,
                  salary,
                  equity,
                  company_handle
           FROM jobs
           WHERE id = $1`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      salary: "salary",
      equity: "equity",
      company_handle: "company_handle",
    });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                    SET ${setCols} 
                    WHERE id = ${handleVarIdx} 
                    RETURNING title, 
                              salary, 
                              equity, 
                              company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${handle}`);

    return job;
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE
         FROM jobs
         WHERE id = $1
         RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No company: ${id}`);
  }
}

module.exports = Job;
