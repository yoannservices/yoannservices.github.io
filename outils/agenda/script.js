const STORAGE_KEY = "agenda_ab_events_v1";
const DAY_ORDER = {
  Lundi: 1,
  Mardi: 2,
  Mercredi: 3,
  Jeudi: 4,
  Vendredi: 5,
  Samedi: 6,
  Dimanche: 7,
};

const form = document.getElementById("event-form");
const eventTableBody = document.getElementById("event-table-body");
const emptyState = document.getElementById("empty-state");
const feedback = document.getElementById("form-feedback");
const filterButtons = document.querySelectorAll(".filter-btn");

let selectedFilter = "A";
let events = loadEvents();

renderEvents();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  feedback.classList.remove("error");

  const formData = new FormData(form);
  const newEvent = {
    id: self.crypto.randomUUID(),
    title: String(formData.get("title") || "").trim(),
    weekTarget: String(formData.get("weekTarget") || "A"),
    day: String(formData.get("day") || "Lundi"),
    startTime: String(formData.get("startTime") || ""),
    endTime: String(formData.get("endTime") || ""),
    location: String(formData.get("location") || "").trim(),
    description: String(formData.get("description") || "").trim(),
  };

  if (!isEventValid(newEvent)) {
    feedback.textContent = "Merci de verifier les champs (nom, heures, ordre des horaires).";
    feedback.classList.add("error");
    return;
  }

  events.push(newEvent);
  saveEvents();
  renderEvents();

  form.reset();
  feedback.textContent = "Evenement ajoute.";
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedFilter = button.dataset.filter || "A";
    filterButtons.forEach((btn) => {
      const active = btn === button;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });
    renderEvents();
  });
});

eventTableBody.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.matches(".delete-btn")) {
    const itemId = target.getAttribute("data-id");
    if (!itemId) {
      return;
    }
    events = events.filter((item) => item.id !== itemId);
    saveEvents();
    renderEvents();
  }
});

function isEventValid(item) {
  if (!item.title || !item.startTime || !item.endTime) {
    return false;
  }
  return item.endTime > item.startTime;
}

function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

function renderEvents() {
  const visibleEvents = events
    .filter((item) => {
      if (selectedFilter === "ALL") {
        return true;
      }
      if (item.weekTarget === "AB") {
        return true;
      }
      return item.weekTarget === selectedFilter;
    })
    .sort((a, b) => {
      const byDay = (DAY_ORDER[a.day] || 99) - (DAY_ORDER[b.day] || 99);
      if (byDay !== 0) {
        return byDay;
      }
      return a.startTime.localeCompare(b.startTime);
    });

  eventTableBody.innerHTML = "";

  if (visibleEvents.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  visibleEvents.forEach((item) => {
    const row = document.createElement("tr");

    const label =
      item.weekTarget === "AB" ? "A+B" : item.weekTarget === "A" ? "A" : "B";

    row.innerHTML = `
      <td>${escapeHtml(item.day)}</td>
      <td>${escapeHtml(item.startTime)} - ${escapeHtml(item.endTime)}</td>
      <td><span class="event-title">${escapeHtml(item.title)}</span></td>
      <td><span class="tag tag-${item.weekTarget.toLowerCase()}">${label}</span></td>
      <td class="muted-cell">${item.location ? escapeHtml(item.location) : "-"}</td>
      <td>${item.description ? escapeHtml(item.description) : "-"}</td>
      <td>
        <button type="button" class="delete-btn" data-id="${item.id}">Supprimer</button>
      </td>
    `;

    eventTableBody.appendChild(row);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
