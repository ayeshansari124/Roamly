document.addEventListener("DOMContentLoaded", () => {
  const slotsContainer = document.getElementById("slotsContainer");
  const availabilityInput = document.getElementById("availabilityInput");
  const addSlotBtn = document.getElementById("addSlotBtn");

  if (!slotsContainer || !availabilityInput || !addSlotBtn) return;

  let slots = [];

  function syncAvailability() {
    const availability = {};

    slots.forEach((s) => {
      if (!s.date || !s.time || !s.slots) return;

      if (!availability[s.date]) {
        availability[s.date] = [];
      }

      availability[s.date].push({
        time: s.time,
        slots: Number(s.slots),
      });
    });

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
        <input type="text" placeholder="10:00-11:00" class="input" value="${
          slot.time || ""
        }">
        <input type="number" min="1" placeholder="Slots" class="input" value="${
          slot.slots || ""
        }">
        <button type="button" class="bg-red-500 text-white rounded-lg font-bold">
          ✕
        </button>
      `;

      const [dateInput, timeInput, slotsInput, removeBtn] = wrapper.children;

      dateInput.addEventListener("input", (e) => {
        slots[index].date = e.target.value;
        syncAvailability();
      });

      timeInput.addEventListener("input", (e) => {
        slots[index].time = e.target.value;
        syncAvailability();
      });

      slotsInput.addEventListener("input", (e) => {
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

const csvInput = document.getElementById("csvInput");

if (csvInput) {
  csvInput.addEventListener("change", () => {
    const file = csvInput.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const [header, row] = e.target.result.trim().split("\n");
      const values = row.split(",");

      const [
        title,
        location,
        price,
        duration,
        image,
        description,
        highlights,
        availabilityRaw,
      ] = values.map((v) => v.replace(/^"|"$/g, ""));

      // ✅ Fill basic inputs
      document.querySelector("[name='title']").value = title;
      document.querySelector("[name='location']").value = location;
      document.querySelector("[name='price']").value = price;
      document.querySelector("[name='duration']").value = duration;
      document.querySelector("[name='image']").value = image;
      document.querySelector("[name='description']").value = description;
      document.querySelector("[name='highlights']").value = highlights;

      // Parse availability
      const availability = {};
      availabilityRaw.split(";").forEach((entry) => {
        const [date, time, slots] = entry.split("|");
        if (!availability[date]) availability[date] = [];
        availability[date].push({
          time,
          slots: Number(slots),
        });
      });

      document.getElementById("availabilityInput").value =
        JSON.stringify(availability);

      alert(" CSV imported. Please review before saving!");
    };

    reader.readAsText(file);
  });
}
