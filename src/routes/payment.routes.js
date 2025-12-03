const router = require("express").Router();
const payment = require("../controllers/payment.controller");
const { requireLoginApi } = require("../middlewares/auth");

router.use(requireLoginApi);

router.post("/payment/create-order", payment.createOrder);
router.post("/payment/verify", payment.verifyPayment);

module.exports = router;
