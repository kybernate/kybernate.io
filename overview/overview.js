(() => {
  const figure = document.querySelector('.figure');
  const chapters = [...document.querySelectorAll('.chapter')];
  const tiers = chapters.slice(1);
  const keyLinks = [...figure.querySelectorAll('.layer-key a')];
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let stops = [];
  let frame = 0;
  let activeIndex = -1;

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
    if (current === activeIndex) return;
    activeIndex = current;
    figure.dataset.state = chapters[current].id || 'overview';
    keyLinks.forEach((link, i) => markCurrent(link, i + 1 === current));
    navLinks.forEach(link => markCurrent(link, link.dataset.nav === (current ? 'states' : 'overview')));
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
    schedule();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('pageshow', measure);
  reducedMotion.addEventListener('change', schedule);
  document.fonts?.ready.then(measure);
  measure();
})();
