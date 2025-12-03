const router = require("express").Router();
const admin = require("../controllers/admin.controller");
const { requireAdmin } = require("../middlewares/auth");

router.use(requireAdmin);

router.get("/dashboard", admin.adminBookingsPage);

router.get("/add-experience", admin.addExperiencePage);
router.post("/add-experience", admin.createExperience);

router.get("/edit-experience/:id", admin.editExperiencePage);
router.post("/edit-experience/:id", admin.updateExperience);

router.post("/delete-experience/:id", admin.deleteExperience);

module.exports = router;
