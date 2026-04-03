const box = document.getElementById("box");
const animateBtn = document.getElementById("animateBtn");

animateBtn.addEventListener("click", () => {
  gsap.to(box, {
    x: 500,
    duration: 1.5,
    rotation: 360,
    ease: "power2.inOut"
  });
});