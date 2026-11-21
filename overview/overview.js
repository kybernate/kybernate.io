(() => {
  const figure = document.querySelector('.figure');
  const chapters = [...document.querySelectorAll('.chapter')];
  const tiers = chapters.slice(1);
  const keyLinks = [...figure.querySelectorAll('.layer-key a')];
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const sections = [...document.querySelectorAll('.story-section')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let stops = [];
  let sectionStops = [];
  let frame = 0;
  let activeIndex = -1;
  let activeNav = '';

  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => value * value * (3 - 2 * value);

  function markCurrent(link, current) {
    if (current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }

  function render() {
    frame = 0;
    const y = Math.max(0, window.scrollY);
    let index = 0;
    while (index + 1 < stops.length && y >= stops[index + 1]) index++;
    const nextStop = stops[index + 1];
    const fraction = nextStop ? clamp((y - stops[index]) / (nextStop - stops[index])) : 0;
    const position = index + smooth(fraction);
    const current = Math.round(position);
    const open = reducedMotion.matches ? 1 : smooth(clamp((position - .08) / .8));
    figure.style.setProperty('--spread', open.toFixed(3));
    tiers.forEach((tier, i) => {
      const distance = Math.abs((reducedMotion.matches ? current : position) - (i + 1));
      figure.style.setProperty('--' + tier.id + '-active', clamp(1 - distance).toFixed(3));
    });
    if (current !== activeIndex) {
      activeIndex = current;
      figure.dataset.state = chapters[current].id || 'overview';
      keyLinks.forEach((link, i) => markCurrent(link, i + 1 === current));
    }
    const section = sectionStops.findLastIndex(stop => y >= stop);
    const nav = section < 0 ? figure.dataset.state : sections[section].id;
    if (nav !== activeNav) {
      activeNav = nav;
      navLinks.forEach(link => markCurrent(link, link.dataset.nav === nav));
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function measure() {
    const maxScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    stops = chapters.map((chapter, i) => {
      if (!i) return 0;
      const scrollMargin = parseFloat(getComputedStyle(chapter).scrollMarginTop) || 0;
      const target = chapter.getBoundingClientRect().top + window.scrollY - scrollMargin;
      return Math.min(maxScroll, Math.max(1, target));
    });
    sectionStops = sections.map(section => {
      const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0;
      return Math.min(maxScroll, section.getBoundingClientRect().top + window.scrollY - margin - 2);
    });
    schedule();
  }

  new ResizeObserver(measure).observe(document.querySelector('main'));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('pageshow', measure);
  reducedMotion.addEventListener('change', schedule);
  document.fonts?.ready.then(measure);
  measure();
})();
