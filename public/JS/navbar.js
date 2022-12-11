// for the navbar
let mobMenu = document.querySelector(".mobile--menu")
let mobItems = document.querySelector("#dropdown")
mobMenu.addEventListener("click", () => {
    mobMenu.children[0].classList.toggle('top');
    mobMenu.children[1].classList.toggle('mid');
    mobMenu.children[2].classList.toggle('bottom');
    console.log("yes")

    if (mobItems.classList.contains("mobmenu--items--hidden")) {
        mobItems.classList.replace('mobmenu--items--hidden', 'mobmenu--items')
    } else {

        mobItems.classList.replace('mobmenu--items', 'mobmenu--items--hidden')
    }

})

//changing for navbar font color
let navbar = document.getElementById("navbar")
let deskul = document.getElementsByClassName("desk--ul")
let burg = document.getElementsByClassName("burger")
console.log(deskul)
window.addEventListener("scroll", navfun)
window.addEventListener("touchmove", navfun)

function navfun(e) {
    let top = window.scrollX || document.documentElement.scrollTop;
    let left = window.scrollY || document.documentElement.scrollLeft;

    let screenWidth = window.innerWidth
    // console.log(screenWidth)
    // console.log(top, left)
    if ((top >= 810 && left >= 810)) {
        // console.log(top, left)
        for (let i = 0; i < deskul.length; i++) {
            deskul[i].style.color = "#000"
        }
        for (let i = 0; i < burg.length; i++) {
            burg[i].style.backgroundColor = "#000"
        }

    }

    if (screenWidth < 940 && top >= 0 && left >= 0) {
        // console.log(top, left)
        for (let i = 0; i < deskul.length; i++) {
            deskul[i].style.color = "#000"
        }
        for (let i = 0; i < burg.length; i++) {
            burg[i].style.backgroundColor = "#000"
        }
    }
    else {

        for (let i = 0; i < deskul.length; i++) {
            deskul[i].style.color = "#fff"
        }
        for (let i = 0; i < burg.length; i++) {
            burg[i].style.backgroundColor = "#fff"
        }
    }
}
