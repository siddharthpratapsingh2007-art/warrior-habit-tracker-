 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/script.js b/script.js
index d6f26656829141809d699609f7260fbf9c4dff47..3ec33a57b1ccb722ca600dfa6bb7d31f68b3f979 100644
--- a/script.js
+++ b/script.js
@@ -1,110 +1,213 @@
-const habits = [
-  "Wake Before 6:30",
-  "Basketball",
-  "Taekwondo",
-  "Study 8 Hours",
-  "No Phone Waste",
-  "Daily Review"
+const STORAGE_KEY = "salesHabitTrackerData";
+
+const defaultHabits = [
+  "Prospect 20 new leads",
+  "Make 10 outbound calls",
+  "Send 15 follow-up messages",
+  "Book 2 discovery calls",
+  "Log all activities in CRM",
+  "Ask for 1 referral"
 ];
 
-const daysToTrack = 7;
-
-const table = document.getElementById("habit-table");
+const tableBody = document.getElementById("habit-table");
+const tableHeadRow = document.getElementById("table-head-row");
 const scoreDisplay = document.getElementById("score");
 const streakDisplay = document.getElementById("streak");
+const completionDisplay = document.getElementById("completion");
 const progressBar = document.getElementById("progress-bar");
+const habitInput = document.getElementById("habit-input");
+const addHabitBtn = document.getElementById("add-habit-btn");
+const resetWeekBtn = document.getElementById("reset-week-btn");
+
+function getStartOfWeek(date = new Date()) {
+  const weekDate = new Date(date);
+  const day = weekDate.getDay();
+  const sundayOffset = -day;
+  weekDate.setDate(weekDate.getDate() + sundayOffset);
+  weekDate.setHours(0, 0, 0, 0);
+  return weekDate;
+}
 
-let today = new Date().toISOString().split("T")[0];
-
-let data = JSON.parse(localStorage.getItem("habitData")) || {};
-let streak = parseInt(localStorage.getItem("streak")) || 0;
+function formatDateKey(date) {
+  return date.toISOString().split("T")[0];
+}
 
-if (!data[today]) {
-  data[today] = {};
-  habits.forEach(h => data[today][h] = false);
+function getWeekDates() {
+  const start = getStartOfWeek();
+  return Array.from({ length: 7 }, (_, i) => {
+    const date = new Date(start);
+    date.setDate(start.getDate() + i);
+    return date;
+  });
 }
 
-function saveData() {
-  localStorage.setItem("habitData", JSON.stringify(data));
-  localStorage.setItem("streak", streak);
+function loadState() {
+  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
+  return {
+    habits: saved?.habits?.length ? saved.habits : [...defaultHabits],
+    records: saved?.records ?? {}
+  };
 }
 
-function calculateWeeklyScore() {
-  let total = 0;
+const state = loadState();
 
-  for (let date in data) {
-    if (isWithinLast7Days(date)) {
-      habits.forEach(habit => {
-        if (data[date][habit]) total++;
-      });
+function ensureDateRecords(dates) {
+  dates.forEach((date) => {
+    const dateKey = formatDateKey(date);
+    if (!state.records[dateKey]) {
+      state.records[dateKey] = {};
     }
-  }
 
-  return total;
+    state.habits.forEach((habit) => {
+      if (typeof state.records[dateKey][habit] !== "boolean") {
+        state.records[dateKey][habit] = false;
+      }
+    });
+
+    Object.keys(state.records[dateKey]).forEach((habitName) => {
+      if (!state.habits.includes(habitName)) {
+        delete state.records[dateKey][habitName];
+      }
+    });
+  });
 }
 
-function isWithinLast7Days(date) {
-  let d = new Date(date);
-  let now = new Date();
-  let diff = (now - d) / (1000 * 60 * 60 * 24);
-  return diff >= 0 && diff < 7;
+function saveState() {
+  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
 }
 
-function updateStreak() {
-  let yesterday = new Date();
-  yesterday.setDate(yesterday.getDate() - 1);
-  let yDate = yesterday.toISOString().split("T")[0];
+function getPerfectDayStreak(today = new Date()) {
+  const dateCursor = new Date(today);
+  dateCursor.setHours(0, 0, 0, 0);
+  let streak = 0;
 
-  let allDoneToday = habits.every(h => data[today][h]);
+  while (true) {
+    const key = formatDateKey(dateCursor);
+    const dayRecord = state.records[key];
 
-  if (allDoneToday) {
-    if (data[yDate] && habits.every(h => data[yDate][h])) {
-      streak++;
-    } else {
-      streak = 1;
+    if (!dayRecord || !state.habits.every((habit) => dayRecord[habit])) {
+      break;
     }
-  } else {
-    streak = 0;
+
+    streak += 1;
+    dateCursor.setDate(dateCursor.getDate() - 1);
   }
+
+  return streak;
 }
 
-function createTable() {
-  habits.forEach(habit => {
-    let row = document.createElement("tr");
+function buildTableHead(weekDates) {
+  tableHeadRow.innerHTML = "<th>Habit</th>";
+  weekDates.forEach((date) => {
+    const th = document.createElement("th");
+    const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
+    const monthDay = date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
+    th.textContent = `${weekday} ${monthDay}`;
+    tableHeadRow.appendChild(th);
+  });
+}
 
-    let cell = document.createElement("td");
-    cell.innerText = habit;
-    row.appendChild(cell);
+function buildTableBody(weekDates) {
+  tableBody.innerHTML = "";
 
-    let checkbox = document.createElement("input");
-    checkbox.type = "checkbox";
-    checkbox.checked = data[today][habit];
+  state.habits.forEach((habit) => {
+    const row = document.createElement("tr");
 
-    checkbox.addEventListener("change", () => {
-      data[today][habit] = checkbox.checked;
-      saveData();
-      refreshStats();
-    });
+    const labelCell = document.createElement("td");
+    labelCell.className = "habit-name";
+    labelCell.textContent = habit;
+    row.appendChild(labelCell);
+
+    weekDates.forEach((date) => {
+      const dateKey = formatDateKey(date);
+      const cell = document.createElement("td");
+      const checkbox = document.createElement("input");
+
+      checkbox.type = "checkbox";
+      checkbox.checked = Boolean(state.records[dateKey]?.[habit]);
+      checkbox.setAttribute("aria-label", `${habit} on ${dateKey}`);
 
-    let td = document.createElement("td");
-    td.appendChild(checkbox);
-    row.appendChild(td);
+      checkbox.addEventListener("change", () => {
+        state.records[dateKey][habit] = checkbox.checked;
+        saveState();
+        refreshStats();
+      });
+
+      cell.appendChild(checkbox);
+      row.appendChild(cell);
+    });
 
-    table.appendChild(row);
+    tableBody.appendChild(row);
   });
 }
 
 function refreshStats() {
-  let weeklyScore = calculateWeeklyScore();
-  scoreDisplay.innerText = "Weekly Score: " + weeklyScore + " / 42";
+  const weekDates = getWeekDates();
+  ensureDateRecords(weekDates);
+
+  const possible = state.habits.length * weekDates.length;
+  let completed = 0;
+
+  weekDates.forEach((date) => {
+    const dateKey = formatDateKey(date);
+    state.habits.forEach((habit) => {
+      if (state.records[dateKey][habit]) {
+        completed += 1;
+      }
+    });
+  });
 
-  progressBar.style.width = (weeklyScore / 42) * 100 + "%";
+  const percent = possible ? Math.round((completed / possible) * 100) : 0;
+  scoreDisplay.textContent = `Weekly Score: ${completed} / ${possible}`;
+  completionDisplay.textContent = `Completion: ${percent}%`;
+  progressBar.style.width = `${percent}%`;
 
-  updateStreak();
-  streakDisplay.innerText = "🔥 Streak: " + streak + " days";
+  const streak = getPerfectDayStreak();
+  streakDisplay.textContent = `🔥 Perfect-Day Streak: ${streak}`;
 
-  saveData();
+  saveState();
 }
 
-createTable();
-refreshStats();
+function render() {
+  const weekDates = getWeekDates();
+  ensureDateRecords(weekDates);
+  buildTableHead(weekDates);
+  buildTableBody(weekDates);
+  refreshStats();
+}
+
+addHabitBtn.addEventListener("click", () => {
+  const newHabit = habitInput.value.trim();
+  if (!newHabit || state.habits.includes(newHabit)) {
+    return;
+  }
+
+  state.habits.push(newHabit);
+
+  Object.keys(state.records).forEach((dateKey) => {
+    state.records[dateKey][newHabit] = false;
+  });
+
+  habitInput.value = "";
+  render();
+});
+
+habitInput.addEventListener("keydown", (event) => {
+  if (event.key === "Enter") {
+    addHabitBtn.click();
+  }
+});
+
+resetWeekBtn.addEventListener("click", () => {
+  const weekDates = getWeekDates();
+  weekDates.forEach((date) => {
+    const dateKey = formatDateKey(date);
+    state.habits.forEach((habit) => {
+      state.records[dateKey][habit] = false;
+    });
+  });
+
+  render();
+});
+
+render();
 
EOF
)
