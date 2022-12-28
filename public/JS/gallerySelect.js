let imgSelect = document.querySelectorAll(".swipe--img")
let mainSelect = document.getElementById("main")
mainSelect.setAttribute('src', imgSelect[1].getAttribute('src'))
imgSelect.forEach(ele => {
    // ele.addEventListener(on)
    ele.addEventListener('click', () => {
        var ind = ele.dataset.index
        let source = imgSelect[ind - 1].getAttribute('src')

        mainSelect.setAttribute('src', source)


    })

});
