import $ from 'jquery';

window.jQuery = window.$ = $;

async function loadCycle2() {
  const modules = [
    '../src/jquery.cycle2.core.js',
    '../src/jquery.cycle2.autoheight.js',
    '../src/jquery.cycle2.caption.js',
    '../src/jquery.cycle2.command.js',
    '../src/jquery.cycle2.hash.js',
    '../src/jquery.cycle2.loader.js',
    '../src/jquery.cycle2.pager.js',
    '../src/jquery.cycle2.prevnext.js',
    '../src/jquery.cycle2.progressive.js',
    '../src/jquery.cycle2.tmpl.js'
  ];

  for (const modulePath of modules) {
    await import(modulePath);
  }
}

function initializeDemo() {
  const $slideshow = $('.cycle-slideshow');
  const $next = $('.cycle-next');
  const $prev = $('.cycle-prev');

  if (!$slideshow.length) {
    return;
  }

  $slideshow.cycle({
    timeout: 0,
    slides: '> img',
    next: $next,
    prev: $prev
  });
}

loadCycle2()
  .then(initializeDemo)
  .catch((error) => {
    console.error('Failed to boot Cycle2 demo', error);
  });
