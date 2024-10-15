// Animate on scroll

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-shown');
    }
  });
});

const hiddenElements = document.querySelectorAll('.animate-hidden');
hiddenElements.forEach((element) => {
  observer.observe(element);
});

//