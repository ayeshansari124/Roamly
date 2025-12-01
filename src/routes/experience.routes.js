const router = require("express").Router();
const exp = require("../controllers/experience.controller");

router.get("/explore", exp.explore);
router.get("/experience/:id", exp.viewExperience);

module.exports = router;
