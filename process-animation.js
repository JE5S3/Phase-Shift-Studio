// A compact four-step signal. Text stays readable while the current card lifts.
const processSection = document.querySelector('.process-section');

if (processSection) {
  const track = processSection.querySelector('.process-track');
  const rows = [...processSection.querySelectorAll('.process-row')];
  const pauseButton = processSection.querySelector('#process-pause');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let stepIndex = 0;
  let timer = null;
  let manualPause = false;

  function drawHighlight() {
    const position = ((stepIndex + 0.5) / rows.length) * 100;
    track.style.setProperty('--process-position', `${position}%`);
    rows.forEach((item, index) => item.classList.toggle('is-active', !reduceMotion.matches && index === stepIndex));
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
    pauseButton.innerHTML = manualPause
      ? 'Resume motion <span aria-hidden="true">▷</span>'
      : 'Pause motion <span aria-hidden="true">Ⅱ</span>';
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
    syncProcess();
  });

  reduceMotion.addEventListener('change', syncProcess);
  document.addEventListener('visibilitychange', syncProcess);
  syncProcess();
}

