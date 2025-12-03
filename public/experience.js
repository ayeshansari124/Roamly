document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("experienceRoot");
  if (!root) return;

  const availability = JSON.parse(root.dataset.availability);
  const price = Number(root.dataset.price);
  const experienceId = root.dataset.id;

  let qty = 1;
  let selectedDate = null;
  let selectedTime = null;

  const summaryDate = document.getElementById("summaryDate");
  const summaryTime = document.getElementById("summaryTime");
  const confirmBtn = document.getElementById("confirmBtn");
  const timeSlots = document.getElementById("timeSlots");

  document.getElementById("qtyPlus").onclick = () => updateQty(1);
  document.getElementById("qtyMinus").onclick = () => updateQty(-1);

  document.getElementById("dateChips").onclick = e => {
    if (!e.target.dataset.date) return;
    selectDate(e.target.dataset.date, e.target);
  };

  function selectDate(date, btn) {
    selectedDate = date;
    selectedTime = null;
    summaryDate.textContent = date;
    summaryTime.textContent = "—";

    document.querySelectorAll(".date-chip")
      .forEach(b => b.classList.remove("bg-yellow-400"));

    btn.classList.add("bg-yellow-400");

    timeSlots.innerHTML = "";

    availability[date].forEach(t => {
      const b = document.createElement("button");
      b.className = "px-4 py-2 border rounded-md text-sm";

      if (!t.slots) {
        b.textContent = `${t.time} • Sold out`;
        b.disabled = true;
        b.classList.add("bg-gray-200", "text-gray-400");
      } else {
        b.innerHTML =
          t.slots <= 3
            ? `${t.time} <span class="text-red-500 ml-1">(${t.slots} left)</span>`
            : `${t.time} <span class="text-gray-500 ml-1">(${t.slots})</span>`;

        b.onclick = () => selectTime(t.time, b);
      }

      timeSlots.appendChild(b);
    });

    disableConfirm();
  }

  function selectTime(time, btn) {
    selectedTime = time;
    summaryTime.textContent = time;

    document.querySelectorAll("#timeSlots button")
      .forEach(b => b.classList.remove("bg-yellow-300"));

    btn.classList.add("bg-yellow-300");
    enableConfirm();
  }

  function updateQty(delta) {
    qty = Math.max(1, qty + delta);
    document.getElementById("qty").textContent = qty;
    document.getElementById("subTotal").textContent = price * qty;
    document.getElementById("total").textContent = price * qty + 59;
  }

  function enableConfirm() {
    confirmBtn.disabled = false;
    confirmBtn.className =
      "w-full bg-yellow-400 hover:bg-yellow-500 py-3 rounded-lg font-medium";
  }

  function disableConfirm() {
    confirmBtn.disabled = true;
    confirmBtn.className =
      "w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed";
  }

  confirmBtn.onclick = () => {
    if (!selectedDate || !selectedTime) return;

    fetch("/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ experienceId, date: selectedDate, time: selectedTime, qty })
    })
      .then(r => r.json())
      .then(d => {
        if (!d.success) alert(d.message);
        else window.location.href = `/checkout/${d.bookingId}`;
      });
  };
});
