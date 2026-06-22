// Chart animation utilities
document.addEventListener("DOMContentLoaded", () => {
  const bars = document.querySelectorAll(".bar-fill");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        const targetWidth = el.style.width;
        el.style.width = "0%";
        requestAnimationFrame(() => {
          el.style.width = targetWidth;
        });
      }
    });
  }, { threshold: 0.2 });
  bars.forEach(bar => observer.observe(bar));
});
