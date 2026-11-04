const initThemeToggle = () => {
  const themeButton = document.querySelector('.nav-icon');
  const themes = ['blue', 'light', 'dark'];
  const themeLabels = {
    blue: 'Light blue',
    light: 'Light',
    dark: 'Dark',
  };

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle('theme-light', theme === 'light');
    document.documentElement.classList.toggle('theme-dark', theme === 'dark');
    if (themeButton) {
      const currentIndex = themes.indexOf(theme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      const label = `Current theme: ${themeLabels[theme]}. Switch to ${themeLabels[nextTheme].toLowerCase()} theme`;
      themeButton.setAttribute('aria-label', label);
      themeButton.title = label;
      themeButton.dataset.theme = theme;
    }
  };

  const savedTheme = document.documentElement.dataset.theme;
  applyTheme(themes.includes(savedTheme) ? savedTheme : 'blue');

  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const currentTheme = document.documentElement.dataset.theme;
      const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
      applyTheme(nextTheme);
      try {
        localStorage.setItem('theme-mode', nextTheme);
      } catch (error) {
        console.warn('Theme preference could not be saved.', error);
      }
    });
  }

  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) {
    const updateThemeColor = (theme) => {
      themeColor.content = theme === 'light' ? '#ecf3ff' : theme === 'dark' ? '#050608' : '#0b2239';
    };
    updateThemeColor(document.documentElement.dataset.theme);
    if (themeButton) {
      themeButton.addEventListener('click', () => updateThemeColor(document.documentElement.dataset.theme));
    }
  }
};

const initHeroLottie = () => {
  const heroContainer = document.querySelector('.hero-image');
  if (!heroContainer || !window.lottie) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isVisible = false;
  const animation = window.lottie.loadAnimation({
    container: heroContainer,
    renderer: 'svg',
    loop: true,
    autoplay: false,
    path: 'hero-pos.json',
  });

  const updatePlayback = () => {
    if (reducedMotion.matches || !isVisible) {
      animation.pause();
    } else {
      animation.play();
    }
  };

  if ('IntersectionObserver' in window) {
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      updatePlayback();
    });
    visibilityObserver.observe(heroContainer);
  } else {
    isVisible = true;
  }

  updatePlayback();
  reducedMotion.addEventListener('change', updatePlayback);
};

const initDemoForm = () => {
  const form = document.querySelector('.demo-form');
  const status = document.querySelector('.form-status');
  if (!form || !status) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = 'Your request was not sent because demo delivery is not configured yet.';
  });
};

const initTrialDialog = () => {
  const dialog = document.querySelector('#trial-dialog');
  const openButton = document.querySelector('[data-open-trial]');
  const form = document.querySelector('#trial-form');
  const status = document.querySelector('.trial-status');
  if (!(dialog instanceof HTMLDialogElement) || !openButton || !form || !status) return;

  const closeButtons = dialog.querySelectorAll('[data-close-trial]');

  openButton.addEventListener('click', () => {
    dialog.showModal();
    dialog.querySelector('input')?.focus();
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.textContent = 'Your trial request was not sent because sign-up is not configured yet.';
  });
};

const initTestimonials = () => {
  const pages = Array.from(document.querySelectorAll('[data-testimonial-page]'));
  const tabs = Array.from(document.querySelectorAll('[data-testimonial-tab]'));
  const previousButton = document.querySelector('[data-testimonial-prev]');
  const nextButton = document.querySelector('[data-testimonial-next]');
  const carousel = document.querySelector('.testimonial-carousel');
  if (!carousel || pages.length < 2 || tabs.length !== pages.length || !previousButton || !nextButton) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rotationDelay = 4500;
  let currentPage = 0;
  let rotationTimer;
  let isHovered = false;
  let hasFocus = false;

  const stopRotation = () => {
    window.clearInterval(rotationTimer);
    rotationTimer = undefined;
  };

  const startRotation = () => {
    stopRotation();
    if (isHovered || hasFocus || reducedMotion.matches || document.hidden) return;
    rotationTimer = window.setInterval(() => showPage(currentPage + 1), rotationDelay);
  };

  const showPage = (index) => {
    currentPage = (index + pages.length) % pages.length;
    pages.forEach((page, pageIndex) => {
      page.hidden = pageIndex !== currentPage;
      page.classList.toggle('is-entering', pageIndex === currentPage);
    });
    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === currentPage;
      tab.classList.toggle('is-active', isActive);
      if (isActive) {
        tab.setAttribute('aria-current', 'true');
      } else {
        tab.removeAttribute('aria-current');
      }
    });
    startRotation();
  };

  previousButton.addEventListener('click', () => showPage(currentPage - 1));
  nextButton.addEventListener('click', () => showPage(currentPage + 1));
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showPage(index));
  });
  carousel.addEventListener('mouseenter', () => {
    isHovered = true;
    stopRotation();
  });
  carousel.addEventListener('mouseleave', () => {
    isHovered = false;
    startRotation();
  });
  carousel.addEventListener('focusin', () => {
    hasFocus = true;
    stopRotation();
  });
  carousel.addEventListener('focusout', (event) => {
    hasFocus = carousel.contains(event.relatedTarget);
    startRotation();
  });
  document.addEventListener('visibilitychange', startRotation);
  reducedMotion.addEventListener('change', startRotation);
  showPage(currentPage);
};

const initFeatureCarousel = () => {
  const carousel = document.querySelector('.feature-carousel');
  const pages = Array.from(document.querySelectorAll('[data-feature-page]'));
  const tabs = Array.from(document.querySelectorAll('[data-feature-tab]'));
  const previousButton = document.querySelector('[data-feature-prev]');
  const nextButton = document.querySelector('[data-feature-next]');
  const featureDialog = document.querySelector('#feature-detail-dialog');
  const featureTitle = document.querySelector('#feature-detail-title');
  const featureCopy = document.querySelector('#feature-detail-copy');
  if (!carousel || pages.length < 2 || tabs.length !== pages.length || !previousButton || !nextButton ||
    !(featureDialog instanceof HTMLDialogElement) || !featureTitle || !featureCopy) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rotationDelay = 4500;
  let currentPage = 0;
  let rotationTimer;
  let isHovered = false;
  let hasFocus = false;

  const stopRotation = () => {
    window.clearInterval(rotationTimer);
    rotationTimer = undefined;
  };

  const startRotation = () => {
    stopRotation();
    if (isHovered || hasFocus || reducedMotion.matches || document.hidden || featureDialog.open) return;
    rotationTimer = window.setInterval(() => showPage(currentPage + 1), rotationDelay);
  };

  const showPage = (index) => {
    currentPage = (index + pages.length) % pages.length;
    pages.forEach((page, pageIndex) => {
      page.hidden = pageIndex !== currentPage;
      page.classList.toggle('is-entering', pageIndex === currentPage);
    });
    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === currentPage;
      tab.classList.toggle('is-active', isActive);
      if (isActive) {
        tab.setAttribute('aria-current', 'true');
      } else {
        tab.removeAttribute('aria-current');
      }
    });
    startRotation();
  };

  previousButton.addEventListener('click', () => showPage(currentPage - 1));
  nextButton.addEventListener('click', () => showPage(currentPage + 1));
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showPage(index));
  });
  carousel.addEventListener('mouseenter', () => {
    isHovered = true;
    stopRotation();
  });
  carousel.addEventListener('mouseleave', () => {
    isHovered = false;
    startRotation();
  });
  carousel.addEventListener('focusin', () => {
    hasFocus = true;
    stopRotation();
  });
  carousel.addEventListener('focusout', (event) => {
    hasFocus = carousel.contains(event.relatedTarget);
    startRotation();
  });

  const openFeatureDetails = (card) => {
    const heading = card.querySelector('h3');
    const summary = card.querySelector('p');
    if (!heading || !summary) return;
    stopRotation();
    featureTitle.textContent = heading.textContent;
    featureCopy.textContent = card.dataset.featureDetail || summary.textContent;
    featureDialog.showModal();
  };

  carousel.querySelectorAll('.feature-card').forEach((card) => {
    card.addEventListener('click', () => openFeatureDetails(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFeatureDetails(card);
      }
    });
  });

  featureDialog.querySelectorAll('[data-close-feature]').forEach((button) => {
    button.addEventListener('click', () => featureDialog.close());
  });
  featureDialog.addEventListener('click', (event) => {
    if (event.target === featureDialog) featureDialog.close();
  });
  featureDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      featureDialog.close();
    }
  });
  featureDialog.addEventListener('close', startRotation);
  document.addEventListener('visibilitychange', startRotation);
  reducedMotion.addEventListener('change', startRotation);
  showPage(currentPage);
};

initThemeToggle();
initHeroLottie();
initDemoForm();
initTrialDialog();
initTestimonials();
initFeatureCarousel();

const revealGroups = [
  document.querySelectorAll('.hero-copy, .hero-image-wrap'),
  document.querySelectorAll('.intro-block'),
  document.querySelectorAll('#features'),
  document.querySelectorAll('.feature-card'),
  document.querySelectorAll('#testimonials'),
  document.querySelectorAll('.testimonial-card'),
  document.querySelectorAll('.section-demo-cta'),
  document.querySelectorAll('.cta'),
  document.querySelectorAll('.footer'),
];

const revealTargets = revealGroups.flatMap((group) => Array.from(group));

revealGroups.forEach((group) => {
  group.forEach((element, index) => {
    element.classList.add('reveal');
    element.style.transitionDelay = `${Math.min(index * 60, 180)}ms`;
    element.addEventListener('transitionend', () => {
      element.style.transitionDelay = '';
    }, { once: true });
  });
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealTargets.forEach((element) => revealObserver.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add('is-visible'));
}

document.querySelector('#current-year').textContent = new Date().getFullYear();
