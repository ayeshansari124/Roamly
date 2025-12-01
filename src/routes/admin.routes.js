const router = require("express").Router();
const admin = require("../controllers/admin.controller");
const { requireAdmin } = require("../middlewares/auth");

router.get("/admin", requireAdmin, admin.addExperiencePage);
router.get("/admin/dashboard", requireAdmin, admin.dashboard);
router.post("/admin/trips", requireAdmin, admin.addExperience);

module.exports = router;
