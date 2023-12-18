/** Routes for jobs. */

const jsonschema = require("jsonschema");
const jobNewSchema = require("../schemas/jobNew.json")
const jobSearchSchema = require("../schemas/jobSearch.json")

const express = require("express");
const {
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Job = require("../models/job");
const { createToken } = require("../helpers/tokens");

const router = express.Router();

/** POST / { job } =>  { job }
 *
 * company should be { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login
 */
router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    let q = req.body;
    console.log(q)
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /  =>
 *   { results: [ { title, salary, equity, company_handle }, ...] }
 *
 * Can filter on provided search filters:
 * - title
 * - minSalary
 * - hasEquity
 *
 * Authorization required: none
 */
router.get("/", async function(req, res, next) {
  try {
    let results;
    console.log(req.query)
    if (Object.keys(req.query).length == 0) {
      results = await Job.findAll();
    } else {
      let q = req.query
      if (!q.title) q.title = ("%");
      (!q.minSalary) ? q.minSalary = Number(0) : q.minSalary = Number(q.minSalary);
      (!q.hasEquity) ? q.hasEquity = Boolean(false) : q.hasEquity = Boolean(true); 
      
      const validator = jsonschema.validate(q, jobSearchSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }
      results = await Job.findFilter(q.title, q.minSalary, q.hasEquity)
    }
    return res.json({results});
  } catch (e) {
    next(e)
  }
})

/** GET /[id]  =>  { job }
 *
 *  Company is { title, salary, equity, company_handle }
 *   where jobs is [{ title, salary, equity, company_handle }, ...]
 *
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { ...values } => { updatedJob }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity, company_handle }
 *
 * Returns { title, salary, equity, company_handle }
 *
 * Authorization required: login
 */
router.patch("/:id", async function (req, res, next){
  try{
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch(e){
    next(e);
  }
})

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: login
 */
router.delete("/:id", async function (req, res, next) {
  try{
    await Job.remove(req.params.id);
    return res.json({ deleted: req.params.id });
  } catch(e){
    next(e)
  }
})

module.exports = router;
