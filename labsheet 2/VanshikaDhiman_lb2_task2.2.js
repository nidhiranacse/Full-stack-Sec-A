// let clickCount=0;
// image.addEventListener("click",function(){
//     clickCount++;
//     if(clickCount===2){
//         image.classList.add("enlarged");
//     }
// });
const images=document.querySelectorAll(".photo img")
images.forEach(function(image){
    let clickCount=0;
    image.addEventListener("click",function(){
        clickCount++;
        if (clickCount ===2){
            image.classList.add("enlarged");
        }
    });
});