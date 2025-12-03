function calculateRevenue() {
  let total = 0;
  document.querySelectorAll(".booking-card").forEach(card => {
    if (card.style.display !== "none") {
      const amount = Number(card.dataset.amount);
      if (!isNaN(amount)) total += amount;
    }
  });
  document.getElementById("revenueTotal").innerText = total;
}

let activeFilter = "all";

function filterStatus(type) {
  activeFilter = type;

  document.querySelectorAll(".filter-btn").forEach(b =>
    b.classList.remove("active")
  );
  event.target.classList.add("active");

  applyFilters();
}

function applyFilters() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  document.querySelectorAll(".booking-card").forEach(card => {
    const pay = card.dataset.payment;
    const status = card.dataset.status;

    const filterMatch =
      activeFilter === "all" ||
      (activeFilter === "paid" && pay === "paid") ||
      (activeFilter === "pending" && pay === "pending") ||
      (activeFilter === "cancelled" && status === "cancelled");

    const searchMatch =
      card.dataset.email.includes(q) ||
      card.dataset.title.includes(q);

    card.style.display = filterMatch && searchMatch ? "flex" : "none";
  });

  calculateRevenue();
}

function applySearch() {
  const q = document.getElementById("searchInput").value.toLowerCase();

  document.querySelectorAll(".booking-card").forEach(card => {
    const email = card.dataset.email;
    const title = card.dataset.title;
    const matches = email.includes(q) || title.includes(q);

    card.style.display = matches ? "flex" : "none";
  });

  calculateRevenue();
}

 function exportCSV() {
  const rows = [
    ["Experience", "Email", "Date", "Time", "Qty", "Payment", "Status", "Amount"]
  ];

  document.querySelectorAll(".booking-card").forEach(card => {
    if (card.style.display !== "none") {
      rows.push([
        card.dataset.title,
        card.dataset.email,
        card.dataset.date,
        card.dataset.time,
        card.dataset.qty,
        card.dataset.payment,
        card.dataset.status,
        card.dataset.amount
      ]);
    }
  });

  const csv = rows.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "bookings.csv";
  a.click();
}

  calculateRevenue();

  const slotsContainer = document.getElementById("slotsContainer");
  const availabilityInput = document.getElementById("availabilityInput");

  let slots = <%- JSON.stringify(experience?.availability?.slots || []) %>;

  function renderSlots() {
    slotsContainer.innerHTML = "";

    slots.forEach((slot, index) => {
      slotsContainer.innerHTML += `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-100 p-3 rounded-lg">
          <input type="date" value="${slot.date || ""}" onchange="updateSlot(${index}, 'date', this.value)" class="input">
          <input type="time" value="${slot.start || ""}" onchange="updateSlot(${index}, 'start', this.value)" class="input">
          <input type="time" value="${slot.end || ""}" onchange="updateSlot(${index}, 'end', this.value)" class="input">
          <button type="button" onclick="removeSlot(${index})" class="bg-red-500 text-white rounded-lg font-bold">
            ✕
          </button>
        </div>
      `;
    });

    availabilityInput.value = JSON.stringify(
  slots.reduce((acc, s) => {
    if (!s.date) return acc;
    acc[s.date] ??= [];
    acc[s.date].push({ time: `${s.start}-${s.end}`, slots: 10 });
    return acc;
  }, {})
);

  }

  function addSlot() {
    slots.push({ date: "", start: "", end: "" });
    renderSlots();
  }

  function updateSlot(index, field, value) {
    slots[index][field] = value;
    availabilityInput.value = JSON.stringify({ slots });
  }

  function removeSlot(index) {
    slots.splice(index, 1);
    renderSlots();
  }

  renderSlots();