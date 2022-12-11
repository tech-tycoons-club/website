particlesJS("bg-js", {
    particles: {
        number: { value: 120, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: {
            type: "circle",
            stroke: { width: 0, color: "#000000" },
            polygon: { nb_sides: 5 },
            image: { src: "img/github.svg", width: 100, height: 100 }
        },
        opacity: {
            value: 1,
            random: true,
            anim: { enable: true, speed: 1, opacity_min: 0, sync: false }
        },
        size: {
            value: 3,
            random: true,
            anim: { enable: false, speed: 4, size_min: 0.3, sync: false }
        },
        line_linked: {
            enable: true,
            distance: 112.16870172739809,
            color: "#ffffff",
            opacity: 0.2243374034547962,
            width: 0.9614460148062693
        },
        move: {
            enable: true,
            speed: 1,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
            attract: { enable: false, rotateX: 600, rotateY: 600 }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "grab" },
            onclick: { enable: false, mode: "repulse" },
            resize: true
        },
        modes: {
            grab: { distance: 60.86427267194161, line_linked: { opacity: 1 } },
            bubble: { distance: 250, size: 0, duration: 2, opacity: 0, speed: 3 },
            repulse: { distance: 400, duration: 0.4 },
            push: { particles_nb: 4 },
            remove: { particles_nb: 2 }
        }
    },
    retina_detect: true
});


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
window.addEventListener("scroll", () => {
    let top = window.scrollX || document.documentElement.scrollTop;
    let left = window.scrollY || document.documentElement.scrollLeft;

    if (top >= 810 && left >= 810) {
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
})
