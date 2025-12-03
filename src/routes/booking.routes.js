const router = require("express").Router();
const booking = require("../controllers/booking.controller");
const { requireLogin } = require("../middlewares/auth");

router.use(requireLogin);

router.post("/book", booking.bookExperience);
router.get("/my-bookings", booking.myBookings);
router.get("/checkout/:bookingId", booking.checkoutPage);
router.post("/booking/:id/cancel", booking.cancelBooking);

module.exports = router;
