const router = require("express").Router();
const admin = require("../controllers/admin.controller");
const { requireAdmin } = require("../middlewares/auth");

// DASHBOARD
router.get("/dashboard", requireAdmin, admin.adminBookingsPage);

// ADD / CREATE
router.get("/add-experience", requireAdmin, admin.addExperiencePage);
router.post("/add-experience", requireAdmin, admin.createExperience);
// EDIT
router.get("/edit-experience/:id", requireAdmin, admin.editExperiencePage);
router.post("/edit-experience/:id", requireAdmin, admin.updateExperience);

// DELETE
router.post("/delete-experience/:id", requireAdmin, admin.deleteExperience);

module.exports = router;
