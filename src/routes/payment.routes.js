const router = require("express").Router();
const payment = require("../controllers/payment.controller");
const { requireLoginApi } = require("../middlewares/auth");

router.post("/payment/create-order", requireLoginApi, payment.createOrder);
router.post("/payment/verify", requireLoginApi, payment.verifyPayment);

module.exports = router;
