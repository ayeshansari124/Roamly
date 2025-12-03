document.addEventListener("DOMContentLoaded", () => {
  const cards = [...document.querySelectorAll(".booking-card")];
  const revenueEl = document.getElementById("revenueTotal");
  const searchInput = document.getElementById("searchInput");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const exportBtn = document.getElementById("exportBtn");

  let activeFilter = "all";

  function calculateRevenue() {
    let total = 0;
    cards.forEach(c => {
      if (c.style.display !== "none") {
        total += Number(c.dataset.amount || 0);
      }
    });
    revenueEl.textContent = total;
  }

  function applyFilters() {
    const q = searchInput.value.toLowerCase();

    cards.forEach(card => {
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

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      applyFilters();
    };
  });

  searchInput.oninput = applyFilters;

  exportBtn.onclick = () => {
    const rows = [["Experience", "Email", "Amount"]];

    cards.forEach(c => {
      if (c.style.display !== "none") {
        rows.push([
          c.dataset.title,
          c.dataset.email,
          c.dataset.amount
        ]);
      }
    });

    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], {
      type: "text/csv"
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bookings.csv";
    a.click();
  };

  calculateRevenue();
});
