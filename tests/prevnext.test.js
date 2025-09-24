import { beforeAll, describe, expect, it } from 'vitest';
import $ from 'jquery';

async function loadCycle2Modules() {
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
    '../src/jquery.cycle2.tmpl.js',
    '../src/jquery.cycle2.keyboard.js'
  ];

  for (const modulePath of modules) {
    await import(modulePath);
  }
}

beforeAll(async () => {
  globalThis.jQuery = $;
  globalThis.$ = $;
  await loadCycle2Modules();
});

describe('prev/next accessibility', () => {
  it('adds focus and aria metadata to plain elements', () => {
    const $prev = $('<div class="cycle-prev">Prev</div>');
    const $next = $('<div class="cycle-next">Next</div>');
    const $slideshow = $(`
      <div class="cycle-slideshow">
        <img src="about:blank" alt="" />
        <img src="about:blank" alt="" />
      </div>
    `);

    $slideshow.append($prev, $next);
    $(document.body).append($slideshow);

    $slideshow.cycle({
      fx: 'none',
      timeout: 0,
      slides: '> img',
      next: $next,
      prev: $prev
    });

    expect($next.attr('tabindex')).toBe('0');
    expect($prev.attr('tabindex')).toBe('0');
    expect($next.attr('role')).toBe('button');
    expect($prev.attr('role')).toBe('button');
    expect($next.attr('aria-label')).toBe('Next slide');
    expect($prev.attr('aria-label')).toBe('Previous slide');

    $slideshow.cycle('destroy');
  });

  it('respects existing accessibility metadata on interactive controls', () => {
    const $prev = $('<button class="cycle-prev" type="button" aria-label="Go back">Prev</button>');
    const $next = $('<button class="cycle-next" type="button" aria-label="Go forward">Next</button>');
    const $slideshow = $(`
      <div class="cycle-slideshow">
        <img src="about:blank" alt="" />
        <img src="about:blank" alt="" />
      </div>
    `);

    $slideshow.append($prev, $next);
    $(document.body).append($slideshow);

    $slideshow.cycle({
      fx: 'none',
      timeout: 0,
      slides: '> img',
      next: $next,
      prev: $prev
    });

    expect($next.attr('tabindex')).toBeUndefined();
    expect($prev.attr('tabindex')).toBeUndefined();
    expect($next.attr('aria-label')).toBe('Go forward');
    expect($prev.attr('aria-label')).toBe('Go back');

    $slideshow.cycle('destroy');
  });

  it('activates navigation when pressing Space or Enter', async () => {
    const $prev = $('<div class="cycle-prev">Prev</div>');
    const $next = $('<div class="cycle-next">Next</div>');
    const $slideshow = $(`
      <div class="cycle-slideshow">
        <img src="about:blank" alt="" />
        <img src="about:blank" alt="" />
        <img src="about:blank" alt="" />
      </div>
    `);

    $slideshow.append($prev, $next);
    $(document.body).append($slideshow);

    $slideshow.cycle({
      fx: 'none',
      timeout: 0,
      slides: '> img',
      next: $next,
      prev: $prev
    });

    const api = $slideshow.data('cycle.API');
    expect(api.opts().currSlide).toBe(0);

    expect($next.data('cycleControlFor')).toBe($slideshow[0]);
    expect($prev.data('cycleControlFor')).toBe($slideshow[0]);

    $slideshow.cycle('next');
    expect(api.opts().currSlide).toBe(1);
    $slideshow.cycle('prev');
    expect(api.opts().currSlide).toBe(0);

    const spaceEvent = $.Event('keydown', { key: ' ', which: 32 });
    $next.trigger(spaceEvent);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(api.opts().currSlide).toBe(1);

    const enterEvent = $.Event('keydown', { key: 'Enter', which: 13 });
    $prev.trigger(enterEvent);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(api.opts().currSlide).toBe(0);

    $slideshow.cycle('destroy');
  });

  it('only responds to arrow keys when a control has focus', async () => {
    const originalActiveDescriptor = Object.getOwnPropertyDescriptor(document, 'activeElement');
    const setActiveElement = (el) => {
      Object.defineProperty(document, 'activeElement', {
        configurable: true,
        get: () => el
      });
    };

    const $prev = $('<button class="cycle-prev" type="button">Prev</button>');
    const $next = $('<button class="cycle-next" type="button">Next</button>');
    const $slideshow = $(`
      <div class="cycle-slideshow">
        <img src="about:blank" alt="" />
        <img src="about:blank" alt="" />
      </div>
    `);

    $slideshow.append($prev, $next);
    $(document.body).append($slideshow);

    $slideshow.cycle({
      fx: 'none',
      timeout: 0,
      slides: '> img',
      next: $next,
      prev: $prev
    });

    const api = $slideshow.data('cycle.API');
    expect(api.opts().currSlide).toBe(0);

    setActiveElement(document.body);
    expect(document.activeElement).toBe(document.body);

    const arrowRight = $.Event('keydown', { key: 'ArrowRight', which: 39 });
    $(document).trigger(arrowRight);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(api.opts().currSlide).toBe(0);

    if (typeof $next[0].focus === 'function') {
      $next[0].focus();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
    setActiveElement($next[0]);
    expect(document.activeElement).toBe($next[0]);
    const focusedArrowRight = $.Event('keydown', { key: 'ArrowRight', which: 39 });
    $(document).trigger(focusedArrowRight);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(api.opts().currSlide).toBe(1);

    if (typeof $prev[0].focus === 'function') {
      $prev[0].focus();
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
    setActiveElement($prev[0]);
    expect(document.activeElement).toBe($prev[0]);
    const focusedArrowLeft = $.Event('keydown', { key: 'ArrowLeft', which: 37 });
    $(document).trigger(focusedArrowLeft);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(api.opts().currSlide).toBe(0);

    $slideshow.cycle('destroy');

    if (originalActiveDescriptor) {
      Object.defineProperty(document, 'activeElement', originalActiveDescriptor);
    }
  });
});
