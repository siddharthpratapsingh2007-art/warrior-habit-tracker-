const habits = [
"Wake Before 6:30",
"Basketball",
"Taekwondo",
"Study 8 Hours",
"No Phone Waste",
"Daily Review"
];

const days = 7;

const table = document.getElementById("habit-table");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const progressBar = document.getElementById("progress-bar");

let data = JSON.parse(localStorage.getItem("habitData")) || {};
let streak = parseInt(localStorage.getItem("streak")) || 0;

function saveData(){
localStorage.setItem("habitData", JSON.stringify(data));
localStorage.setItem("streak", streak);
}

function updateStats(){

let total = 0;
let completedDays = 0;

habits.forEach((habit, i)=>{
for(let d=0; d<days; d++){
if(data[habit] && data[habit][d]){
total++;
}
}
});

scoreDisplay.innerText = "Weekly Score: " + total + " / 42";

let progress = (total / 42) * 100;
progressBar.style.width = progress + "%";

if(total === 42){
streak++;
}else{
streak = 0;
}

streakDisplay.innerText = "🔥 Streak: " + streak + " days";

saveData();
}

function createTable(){

habits.forEach(habit=>{

let row = document.createElement("tr");

let cell = document.createElement("td");
cell.innerText = habit;
row.appendChild(cell);

if(!data[habit]){
data[habit] = Array(days).fill(false);
}

for(let d=0; d<days; d++){
let checkbox = document.createElement("input");
checkbox.type = "checkbox";
checkbox.checked = data[habit][d];

checkbox.addEventListener("change", ()=>{
data[habit][d] = checkbox.checked;
updateStats();
});

let td = document.createElement("td");
td.appendChild(checkbox);
row.appendChild(td);
}

table.appendChild(row);
});

updateStats();
}

createTable();
