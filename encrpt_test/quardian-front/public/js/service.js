const sidebar = document.querySelector('.sidebar-gutter');
let isScrolling = false;

function throttleScroll() {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      handleScroll();
      isScrolling = false;
    });
  }
  isScrolling = true;
}

function handleScroll() {
  const scrollPos = window.pageYOffset || document.documentElement.scrollTop;

  sidebar.style.transform = `translateY(${scrollPos}px)`;
}

window.addEventListener('scroll', throttleScroll);