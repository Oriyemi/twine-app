const wrapper = document.getElementById("marquee-wrapper");
const content = document.getElementById("marquee-content");

if (wrapper && content) {
    const clone = content.cloneNode(true);
    wrapper.appendChild(clone);

    let xPos = 0;
    const speed = 0.5;

    function scroll() {
        xPos -= speed;

        if (Math.abs(xPos) >= content.offsetWidth) {
            xPos = 0;
        }

        content.style.transform = `translateX(${xPos}px)`;
        clone.style.transform = `translateX(${xPos}px)`;

        requestAnimationFrame(scroll);
    }

    scroll();
}