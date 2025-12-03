const router = require("express").Router();
const auth = require("../controllers/auth.controller");

router.get("/login", (req, res) => res.redirect("/"));
router.get("/", auth.getHome);
router.post("/register", auth.register);
router.post("/login", auth.login);
router.post("/logout", auth.logout);

module.exports = router;
