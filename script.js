const habits = [
  "Wake Before 6:30",
  "Basketball",
  "Taekwondo",
  "Study 8 Hours",
  "No Phone Waste",
  "Daily Review"
];

const daysToTrack = 7;

const table = document.getElementById("habit-table");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const progressBar = document.getElementById("progress-bar");

let today = new Date().toISOString().split("T")[0];

let data = JSON.parse(localStorage.getItem("habitData")) || {};
let streak = parseInt(localStorage.getItem("streak")) || 0;

if (!data[today]) {
  data[today] = {};
  habits.forEach(h => data[today][h] = false);
}

function saveData() {
  localStorage.setItem("habitData", JSON.stringify(data));
  localStorage.setItem("streak", streak);
}

function calculateWeeklyScore() {
  let total = 0;

  for (let date in data) {
    if (isWithinLast7Days(date)) {
      habits.forEach(habit => {
        if (data[date][habit]) total++;
      });
    }
  }

  return total;
}

function isWithinLast7Days(date) {
  let d = new Date(date);
  let now = new Date();
  let diff = (now - d) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < 7;
}

function updateStreak() {
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  let yDate = yesterday.toISOString().split("T")[0];

  let allDoneToday = habits.every(h => data[today][h]);

  if (allDoneToday) {
    if (data[yDate] && habits.every(h => data[yDate][h])) {
      streak++;
    } else {
      streak = 1;
    }
  } else {
    streak = 0;
  }
}

function createTable() {
  habits.forEach(habit => {
    let row = document.createElement("tr");

    let cell = document.createElement("td");
    cell.innerText = habit;
    row.appendChild(cell);

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = data[today][habit];

    checkbox.addEventListener("change", () => {
      data[today][habit] = checkbox.checked;
      saveData();
      refreshStats();
    });

    let td = document.createElement("td");
    td.appendChild(checkbox);
    row.appendChild(td);

    table.appendChild(row);
  });
}

function refreshStats() {
  let weeklyScore = calculateWeeklyScore();
  scoreDisplay.innerText = "Weekly Score: " + weeklyScore + " / 42";

  progressBar.style.width = (weeklyScore / 42) * 100 + "%";

  updateStreak();
  streakDisplay.innerText = "🔥 Streak: " + streak + " days";

  saveData();
}

createTable();
refreshStats();
