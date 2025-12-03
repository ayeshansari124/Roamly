document.addEventListener("DOMContentLoaded", () => {
  const slotsContainer = document.getElementById("slotsContainer");
  const availabilityInput = document.getElementById("availabilityInput");
  const addSlotBtn = document.getElementById("addSlotBtn");

  if (!slotsContainer || !availabilityInput || !addSlotBtn) return;

  /*
    Each slot object shape:
    {
      date: "2025-01-10",
      time: "10:00-11:00",
      slots: 10
    }
  */
  let slots = [];

  function syncAvailability() {
    const availability = {};

    slots.forEach(s => {
      if (!s.date || !s.time || !s.slots) return;

      if (!availability[s.date]) {
        availability[s.date] = [];
      }

      availability[s.date].push({
        time: s.time,
        slots: Number(s.slots)
      });
    });

    // ✅ THIS MUST BE PURE JSON — NOTHING ELSE
    availabilityInput.value = JSON.stringify(availability);
  }

  function renderSlots() {
    slotsContainer.innerHTML = "";

    slots.forEach((slot, index) => {
      const wrapper = document.createElement("div");
      wrapper.className =
        "grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-100 p-3 rounded-lg";

      wrapper.innerHTML = `
        <input type="date" class="input" value="${slot.date || ""}">
        <input type="text" placeholder="10:00-11:00" class="input" value="${slot.time || ""}">
        <input type="number" min="1" placeholder="Slots" class="input" value="${slot.slots || ""}">
        <button type="button" class="bg-red-500 text-white rounded-lg font-bold">
          ✕
        </button>
      `;

      const [dateInput, timeInput, slotsInput, removeBtn] = wrapper.children;

      dateInput.addEventListener("input", e => {
        slots[index].date = e.target.value;
        syncAvailability();
      });

      timeInput.addEventListener("input", e => {
        slots[index].time = e.target.value;
        syncAvailability();
      });

      slotsInput.addEventListener("input", e => {
        slots[index].slots = e.target.value;
        syncAvailability();
      });

      removeBtn.addEventListener("click", () => {
        slots.splice(index, 1);
        renderSlots();
        syncAvailability();
      });

      slotsContainer.appendChild(wrapper);
    });
  }

  addSlotBtn.addEventListener("click", () => {
    slots.push({ date: "", time: "", slots: "" });
    renderSlots();
    syncAvailability();
  });
});
