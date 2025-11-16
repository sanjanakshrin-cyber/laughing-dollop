// --- Bus Routes Data (Demo dataset with sample first/last trip timings)
let routes = [
  {
    routeNumber: "101",
    distance: 12,
    duration: 30,
    stops: [
      "Central Bus Stand",
      "Market Junction",
      "University Gate",
      "Airport Road",
    ],
    firstTrip: "06:00",
    lastTrip: "22:30",
  },
  {
    routeNumber: "102",
    distance: 18,
    duration: 45,
    stops: [
      "Central Bus Stand",
      "City Mall",
      "University Gate",
      "Airport Road",
    ],
    firstTrip: "05:30",
    lastTrip: "23:00",
  },
  {
    routeNumber: "103",
    distance: 15,
    duration: 40,
    stops: [
      "City Mall",
      "Market Junction",
      "University Gate",
      "Old Town",
    ],
    firstTrip: "06:15",
    lastTrip: "22:00",
  },
];

// Section switching
const navBtns = Array.from(document.querySelectorAll(".nav-btn"));
const mainSections = [
  document.getElementById("view-bus-routes"),
  document.getElementById("track-bus-routes"),
  document.getElementById("admin-dashboard-section")
];
const loginSection = document.getElementById("login-section");

navBtns.forEach((btn, i) => {
  btn.addEventListener("click", () => {
    if (btn.id === "adminNav" && !window.loggedIn) {
      mainSections.forEach(s => s.style.display = "none");
      loginSection.style.display = "";
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      return;
    }
    loginSection.style.display = "none";
    navBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    mainSections.forEach((sec,j) => sec.style.display = (i===j) ? "" : "none");
  });
});

// --- View Bus Routes
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsList = document.getElementById("resultsList");
const routeDetailsPopup = document.getElementById("route-details-popup");
const closeDetailsBtn = document.getElementById("closeDetailsBtn");
const routeNumberElem = document.getElementById("routeNumber");
const routeDistanceElem = document.getElementById("routeDistance");
const routeDurationElem = document.getElementById("routeDuration");
const stopsListElem = document.getElementById("stopsList");

/** Search routes by route number or stop name */
function searchRoutes(query) {
  const lowerQuery = query.toLowerCase();
  return routes.filter(route =>
    route.routeNumber.toLowerCase().includes(lowerQuery)
    || route.stops.some(stop => stop.toLowerCase().includes(lowerQuery))
  );
}

/** Render filtered routes */
function renderResults(results) {
  resultsList.innerHTML = "";
  if (!results.length) { resultsList.innerHTML = "<li>No routes found.</li>"; return; }
  results.forEach(route => {
    const li = document.createElement("li");
    li.textContent = `Route ${route.routeNumber} | Distance: ${route.distance} km | Duration: ${route.duration} mins`;
    li.addEventListener("click", () => showRouteDetails(route));
    resultsList.appendChild(li);
  });
}

/** Show details in popup */
function showRouteDetails(route) {
  routeDetailsPopup.style.display = "flex";
  routeNumberElem.textContent = route.routeNumber;
  routeDistanceElem.textContent = route.distance;
  routeDurationElem.textContent = route.duration;
  stopsListElem.innerHTML = "";
  route.stops.forEach(stop => {
    const li = document.createElement("li");
    li.textContent = stop;
    stopsListElem.appendChild(li);
  });
}

closeDetailsBtn.addEventListener("click", () => {
  routeDetailsPopup.style.display = "none";
});
searchBtn.addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (!query) {
    alert("Please enter a route number or stop name.");
    return;
  }
  renderResults(searchRoutes(query));
});
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchBtn.click();
  }
});

// --- Admin Login
const adminLoginForm = document.getElementById("adminLoginForm");
const loginError = document.getElementById("loginError");
const adminCreds = { username: "admin", password: "admin123" };
window.loggedIn = false;

adminLoginForm.addEventListener("submit", e => {
  e.preventDefault();
  const username = document.getElementById("adminUsername").value.trim();
  const password = document.getElementById("adminPassword").value.trim();
  if (username === adminCreds.username && password === adminCreds.password) {
    loginError.style.display = "none";
    loginSection.style.display = "none";
    document.getElementById("admin-dashboard-section").style.display = "";
    window.loggedIn = true;
    navBtns.forEach(btn => btn.classList.remove("active"));
    navBtns.find(btn => btn.id === "adminNav").classList.add("active");
    updateDashboardStats();
    renderRoutesTable();
    renderFeedback();
  } else {
    loginError.textContent = "Invalid username or password.";
    loginError.style.display = "block";
  }
});
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
adminLogoutBtn.addEventListener("click", () => {
  window.loggedIn = false;
  document.getElementById("admin-dashboard-section").style.display = "none";
  navBtns.forEach(btn => btn.classList.remove("active"));
  navBtns.find(btn => btn.id === "viewRoutesNav").classList.add("active");
  document.getElementById("view-bus-routes").style.display = "";
});

// Admin Dashboard - Routes Management
const addEditRouteForm = document.getElementById("addEditRouteForm");
const routesTableBody = document.querySelector("#routesTable tbody");
const editRouteNumber = document.getElementById("editRouteNumber");
const editRouteNumberInput = document.getElementById("editRouteNumberInput");
const editDistanceInput = document.getElementById("editDistanceInput");
const editDurationInput = document.getElementById("editDurationInput");
const editStopsInput = document.getElementById("editStopsInput");
const editFirstTripInput = document.getElementById("editFirstTripInput");
const editLastTripInput = document.getElementById("editLastTripInput");

// Stats and feedback
const totalRoutesCount = document.getElementById("totalRoutesCount");
const mostSearchedRoutesElem = document.getElementById("mostSearchedRoutes");
const feedbackCountElem = document.getElementById("feedbackCount");
const feedbackList = document.getElementById("feedbackList");
const searchCounts = {};
const feedbacks = [
  { route: "101", message: "Good coverage of stops!" },
  { route: "102", message: "Timings could be better." }
];

function updateDashboardStats() {
  totalRoutesCount.textContent = routes.length;
  const sorted = Object.entries(searchCounts).sort((a,b) => b[1] - a[1]).slice(0,3);
  mostSearchedRoutesElem.textContent = sorted.length ? sorted.map(e => `${e[0]} (${e[1]})`).join(", ") : "None Yet";
  feedbackCountElem.textContent = feedbacks.length;
}
function renderFeedback() {
  if (!feedbacks.length) {
    feedbackList.innerHTML = "<li>No feedback submitted yet.</li>";
    return;
  }
  feedbackList.innerHTML = feedbacks.map(fb =>
    `<li><strong>Route ${fb.route}:</strong> ${fb.message}</li>`
  ).join("");
}
function renderRoutesTable() {
  routesTableBody.innerHTML = "";
  routes.forEach(route => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${route.routeNumber}</td>
      <td>${route.distance}</td>
      <td>${route.duration}</td>
      <td>${route.stops.join(", ")}</td>
      <td>${route.firstTrip || "N/A"}</td>
      <td>${route.lastTrip || "N/A"}</td>
      <td>
        <button class="action-btn edit-btn">Edit</button>
        <button class="action-btn delete-btn">Delete</button>
      </td>
    `;
    tr.querySelector(".edit-btn").addEventListener("click", () => startEditRoute(route));
    tr.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm(`Delete route ${route.routeNumber}?`)) {
        routes = routes.filter(r => r.routeNumber !== route.routeNumber);
        updateDashboardStats();
        renderRoutesTable();
        alert(`Route ${route.routeNumber} deleted.`);
      }
    });
    routesTableBody.appendChild(tr);
  });
}
function startEditRoute(route) {
  editRouteNumber.value = route.routeNumber;
  editRouteNumberInput.value = route.routeNumber;
  editDistanceInput.value = route.distance;
  editDurationInput.value = route.duration;
  editStopsInput.value = route.stops.join(", ");
  editFirstTripInput.value = route.firstTrip || "";
  editLastTripInput.value = route.lastTrip || "";
  addEditRouteForm.scrollIntoView({behavior: "smooth"});
  editRouteNumberInput.focus();
}
addEditRouteForm.addEventListener("submit", e => {
  e.preventDefault();
  const origNumber = editRouteNumber.value;
  const newRouteNumber = editRouteNumberInput.value.trim();
  const newDistance = parseFloat(editDistanceInput.value);
  const newDuration = parseInt(editDurationInput.value);
  const newStops = editStopsInput.value.split(",").map(s => s.trim()).filter(s => s);
  const firstTripTime = editFirstTripInput.value;
  const lastTripTime = editLastTripInput.value;

  if (!newRouteNumber || newStops.length < 2 || isNaN(newDistance) || isNaN(newDuration)) {
    alert("Fill all fields correctly with at least two stops.");
    return;
  }
  if (newRouteNumber !== origNumber && routes.some(r => r.routeNumber === newRouteNumber)) {
    alert("Route number already exists.");
    return;
  }

  if (origNumber) {
    // Update existing
    const route = routes.find(r => r.routeNumber === origNumber);
    route.routeNumber = newRouteNumber;
    route.distance = newDistance;
    route.duration = newDuration;
    route.stops = newStops;
    route.firstTrip = firstTripTime;
    route.lastTrip = lastTripTime;
  } else {
    // Add new route
    routes.push({
      routeNumber: newRouteNumber,
      distance: newDistance,
      duration: newDuration,
      stops: newStops,
      firstTrip: firstTripTime,
      lastTrip: lastTripTime
    });
  }
  alert(`Route ${newRouteNumber} saved!`);
  clearRouteForm();
  updateDashboardStats();
  renderRoutesTable();
});
document.getElementById("cancelEditBtn").addEventListener("click", e => {
  clearRouteForm();
});
function clearRouteForm() {
  editRouteNumber.value = "";
  addEditRouteForm.reset();
}

// --- Track Bus Routes
const trackOptions = Array.from(document.querySelectorAll(".track-option"));
const trackFormCity = document.getElementById("track-form-city");
const trackResults = document.getElementById("track-results");
const trackSearchBtn = document.getElementById("trackSearchBtn");

trackOptions.forEach(opt => {
  opt.addEventListener("click", () => {
    trackOptions.forEach(o => o.classList.remove("active"));
    opt.classList.add("active");
    trackFormCity.style.display = opt.dataset.option === "city" ? "flex" : "none";
    trackResults.innerHTML = "";
  });
});

trackSearchBtn.addEventListener("click", () => {
  const from = document.getElementById("fromCity").value.trim();
  const to = document.getElementById("toCity").value.trim();
  if (!from || !to) {
    trackResults.innerHTML = "<p style='color:red;'>Please enter both locations.</p>";
    return;
  }
  const foundRoutes = routes.filter(r =>
    r.stops.some(s => s.toLowerCase().includes(from.toLowerCase())) &&
    r.stops.some(s => s.toLowerCase().includes(to.toLowerCase()))
  );
  if (!foundRoutes.length) {
    trackResults.innerHTML = "<p>No matching routes found.</p>";
    return;
  }
  trackResults.innerHTML = foundRoutes.map(rt =>
    `<div style="margin:1rem 0;padding:1rem;border-radius:12px;background:#e6f6f2;">
      <strong>Route ${rt.routeNumber}</strong><br>
      From <em>${from}</em> to <em>${to}</em><br>
      Distance: ${rt.distance} km | Duration: ${rt.duration} mins<br>
      Stops: ${rt.stops.join(", ")}<br>
      First Trip: ${rt.firstTrip || 'N/A'} | Last Trip: ${rt.lastTrip || 'N/A'}
    </div>`
  ).join("");
});

// --- Chatbot FAB and Widget
const chatbotFab = document.getElementById("chatbot-fab");
const chatbot = document.getElementById("chatbot");
const chatbotHeader = document.getElementById("chatbot-header");
const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotMessages = document.getElementById("chatbot-messages");
const chatbotInput = document.getElementById("chatbot-user-input");
const chatbotSendBtn = document.getElementById("chatbot-send");

// Animate and show/hide chatbot
chatbotFab.addEventListener("click", () => {
  chatbot.style.display = "flex";
  chatbotFab.style.display = "none";
  chatbotInput.focus();
});
chatbotToggle.addEventListener("click", () => {
  chatbot.style.display = "none";
  chatbotFab.style.display = "flex";
});
chatbotHeader.addEventListener("click", (e) => {
  if (e.target === chatbotToggle) return;
  chatbot.style.display = "flex";
  chatbotFab.style.display = "none";
  chatbotInput.focus();
});

// Chatbot knowledge base
const botKnowledge = [
  { questions: ["what is this system","bus route information system","about"], answer: "This is a Bus Route Information System to help you search, view, and track bus routes, stops, timings, and distances. Admins can add or edit routes." },
  { questions: ["how to search","search"], answer: "Use the search bar to enter a route number or stop name and click 'Search' to view matching routes." },
  { questions: ["how to add routes","add routes","admin add route"], answer: "Admins can add new bus routes from the Admin Panel by providing route number, distance, duration, and stops." },
  { questions: ["stops in route 101","route 101 stops"], answer: "Route 101 includes: Central Bus Stand, Market Junction, University Gate, and Airport Road." },
  { questions: ["duration of route 102","route 102 duration"], answer: "Route 102 duration is about 45 minutes." },
  { questions: ["who can use","user roles","roles"], answer: "Passengers search/view routes; Admins manage routes, stops, timings." }
];
function addMessage(text, sender = "bot") {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("chatbot-message", sender);
  const contentDiv = document.createElement("div");
  contentDiv.classList.add("message-content");
  contentDiv.textContent = text;
  messageDiv.appendChild(contentDiv);
  chatbotMessages.appendChild(messageDiv);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}
function getBotResponse(userText) {
  const text = userText.toLowerCase().trim();
  for (const item of botKnowledge) {
    for (const question of item.questions) {
      if (text.includes(question)) return item.answer;
    }
  }
  return "Sorry, I didn't understand that. You can ask about searching routes, adding routes, or system features.";
}
function sendChatMessage() {
  const userText = chatbotInput.value.trim();
  if (!userText) return;
  addMessage(userText, "user");
  chatbotInput.value = "";
  setTimeout(() => {
    const botReply = getBotResponse(userText);
    addMessage(botReply, "bot");
  }, 600);
}
chatbotSendBtn.addEventListener("click", sendChatMessage);
chatbotInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendChatMessage();
  }
});
