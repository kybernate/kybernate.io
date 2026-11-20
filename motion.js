(() => {
  const showcase = document.querySelector('[data-showcase]');
  const stage = showcase?.querySelector('[data-stage]');
  const scene = stage?.querySelector('.logo-scene');
  if (!scene || !window.matchMedia || !CSS.supports('position', 'sticky')) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const orbits = scene.querySelector('[data-orbits]');
  const shell = scene.querySelector('[data-shell]');
  const cold = scene.querySelector('[data-cold]');
  const warm = scene.querySelector('[data-warm]');
  const hot = scene.querySelector('[data-hot]');
  const moon = scene.querySelector('[data-moon]');
  let frame = 0;
  let lastProgress = -1;

  function ease(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
  }

  function draw() {
    frame = 0;
    const bounds = showcase.getBoundingClientRect();
    const travel = bounds.height - stage.offsetHeight;
    const progress = !reducedMotion.matches && travel > 0
      ? Math.max(0, Math.min(1, -bounds.top / travel))
      : 0;
    if (progress === lastProgress) return;
    lastProgress = progress;

    // The centre of the scroll holds the exploded view briefly before reassembly.
    const open = ease(progress / 0.48) * (1 - ease((progress - 0.56) / 0.44));
    showcase.style.setProperty('--progress', progress.toFixed(4));
    orbits.setAttribute('transform', 'rotate(' + (50 * progress) + ' 360 360)');
    shell.setAttribute('transform', 'rotate(' + (-9 * open) + ' 512 360)');
    shell.setAttribute('opacity', 1 - 0.68 * open);
    cold.setAttribute('transform', 'translate(' + (25 * open) + ' ' + (108 * open) + ')');
    warm.setAttribute('transform', 'translate(' + (-19 * open) + ' ' + (20 * open) + ')');
    hot.setAttribute('transform', 'translate(' + (12 * open) + ' ' + (-72 * open) + ')');
    moon.setAttribute('transform', 'translate(' + (20 * open) + ' ' + (-132 * open) + ')');
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(draw);
  }

  function configure() {
    document.documentElement.classList.toggle('motion-enabled', !reducedMotion.matches);
    lastProgress = -1;
    schedule();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('pageshow', schedule);
  reducedMotion.addEventListener('change', configure);
  configure();
})();
