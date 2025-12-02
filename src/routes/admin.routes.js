const router = require("express").Router();
const admin = require("../controllers/admin.controller");
const { requireAdmin } = require("../middlewares/auth");

router.get("/dashboard", requireAdmin, admin.adminBookingsPage);
router.get("/add-experience", requireAdmin, admin.addExperiencePage);
router.post("/add-experience", requireAdmin, admin.addExperience);

module.exports = router;
