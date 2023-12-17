/** Routes for jobs. */

const jsonschema = require("jsonschema");
const jobNewSchema = require("../schemas/jobNew.json")

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

/** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * */
router.get("/", async function(req, res, next) {
  try {
    const results = await Job.findAll();
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
