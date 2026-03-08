const boxes = document.querySelectorAll("input");
const score = document.getElementById("score");

boxes.forEach(box=>{
box.addEventListener("change",()=>{
let count=0;

boxes.forEach(b=>{
if(b.checked){
count++;
}
});

score.innerText="Score: "+count;
});
});
