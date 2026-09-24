const themeToggle=document.getElementById("themeToggle");
themeToggle.addEventListener("click",function(){
    document.body.classList.toggle("light-mode");
    if(document.body.classList.contains("light-mode")){
        themeToggle.textContent="Dark Mode";
    }else{
        themeToggle.textContent="Light Mode";
    }
});
