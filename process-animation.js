// Replace the process animation instance so startup motion cannot inherit
// the old automatic hover, focus, or visibility pauses.
const oldProcessSection = document.querySelector('.process-section');

if (oldProcessSection) {
  const processSection = oldProcessSection.cloneNode(true);
  oldProcessSection.replaceWith(processSection);

  const track = processSection.querySelector('.process-track');
  const rows = [...processSection.querySelectorAll('.process-list:not(.highlight-copy) .process-row')];
  const oldHighlight = track.querySelector('.process-highlight');
  oldHighlight.remove();

  const highlight = document.createElement('div');
  highlight.className = 'process-highlight';
  highlight.setAttribute('aria-hidden', 'true');
  track.prepend(highlight);

  const highlightCopy = processSection.querySelector('.process-list').cloneNode(true);
  highlightCopy.classList.add('highlight-copy');
  highlightCopy.setAttribute('aria-hidden', 'true');
  highlight.append(highlightCopy);

  const pauseButton = processSection.querySelector('#process-pause');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let stepIndex = 0;
  let timer = null;
  let manualPause = false;

  function drawHighlight() {
    const row = rows[stepIndex];
    track.style.setProperty('--process-y', `${row.offsetTop}px`);
    highlight.style.height = `${row.offsetHeight}px`;
    highlight.style.backgroundColor = stepIndex % 2 ? '#101115' : '#c9141e';
    rows.forEach((item, index) => item.classList.toggle('is-active', !reduceMotion.matches && index === stepIndex));
    highlightCopy.style.transform = `translateY(-${row.offsetTop}px)`;
    [...highlightCopy.children].forEach((item, index) => item.style.height = `${rows[index].offsetHeight}px`);
    track.classList.toggle('is-running', !reduceMotion.matches);
  }

  function advance() {
    stepIndex = (stepIndex + 1) % rows.length;
    drawHighlight();
  }

  function syncProcess() {
    clearInterval(timer);
    timer = null;
    pauseButton.hidden = reduceMotion.matches;
    processSection.classList.toggle('is-paused', manualPause);
    if (reduceMotion.matches) {
      track.classList.remove('is-running');
      rows.forEach(row => row.classList.remove('is-active'));
      return;
    }
    drawHighlight();
    if (!document.hidden && !manualPause) timer = setInterval(advance, 3000);
  }

  pauseButton.addEventListener('click', () => {
    manualPause = !manualPause;
    pauseButton.setAttribute('aria-pressed', String(manualPause));
    pauseButton.innerHTML = manualPause
      ? 'Resume highlight <span aria-hidden="true">▷</span>'
      : 'Pause highlight <span aria-hidden="true">Ⅱ</span>';
    syncProcess();
  });

  new ResizeObserver(drawHighlight).observe(track);
  reduceMotion.addEventListener('change', syncProcess);
  document.addEventListener('visibilitychange', syncProcess);
  syncProcess();

  // Start the original 750ms row slide immediately after the first paint.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (!reduceMotion.matches && !document.hidden && !manualPause) advance();
  }));
}

