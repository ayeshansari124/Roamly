const router = require("express").Router();
const booking = require("../controllers/booking.controller");
const { requireLogin } = require("../middlewares/auth");

router.post("/book", requireLogin, booking.bookExperience);
router.get("/my-bookings", requireLogin, booking.myBookings);

// ✅ ADD THIS LINE
router.get("/checkout/:bookingId", requireLogin, booking.checkoutPage);

router.post("/booking/:id/cancel", requireLogin, booking.cancelBooking);

module.exports = router;
