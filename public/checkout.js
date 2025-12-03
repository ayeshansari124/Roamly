const nameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const agreeTerms = document.getElementById("agreeTerms");
const payBtn = document.getElementById("payBtn");

function validateCheckout() {
  const nameValid = nameInput.value.trim().length > 0;
  const emailValid = emailInput.value.trim().length > 0;
  const termsAccepted = agreeTerms.checked;

  if (nameValid && emailValid && termsAccepted) {
    payBtn.disabled = false;
    payBtn.className =
      "w-full mt-4 bg-yellow-400 hover:bg-yellow-500 py-4 rounded-lg font-bold";
  } else {
    payBtn.disabled = true;
    payBtn.className =
      "w-full mt-4 bg-gray-300 text-gray-500 py-4 rounded-lg font-bold cursor-not-allowed";
  }
}

[nameInput, emailInput].forEach((input) =>
  input.addEventListener("input", validateCheckout)
);

agreeTerms.addEventListener("change", validateCheckout);

document.addEventListener("DOMContentLoaded", () => {
  const root = document.querySelector("[data-booking-id]");
  if (!root) return;

  const bookingId = root.dataset.bookingId;
  const razorpayKey = root.dataset.razorpayKey;
  const title = root.dataset.title;
  const amount = Number(root.dataset.amount);

  const payBtn = document.getElementById("payBtn");

  payBtn.onclick = async () => {
    try {
      const res = await fetch("/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookingId }),
      });

      if (!res.ok) {
        if (res.status === 401) return (window.location.href = "/");
        const err = await res.json().catch(() => ({}));
        return alert(err.error || "Failed to create payment order");
      }

      const { orderId } = await res.json();
      if (!orderId) return alert("Payment setup failed");

      const rzp = new Razorpay({
        key: razorpayKey,
        amount: amount * 100,
        currency: "INR",
        name: "Roamly",
        description: title,
        order_id: orderId,
        handler: async () => {
          const vr = await fetch("/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ bookingId }),
          });

          const vd = await vr.json().catch(() => ({}));
          if (!vr.ok || !vd.success) return alert(vd.error || "Payment failed");

          window.location.href = "/my-bookings";
        },
      });

      rzp.open();
    } catch {
      alert("Unexpected error starting payment");
    }
  };
});
