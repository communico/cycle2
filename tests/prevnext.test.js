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

  it('isolates controls across multiple carousels using shared selectors', async () => {
    const $page = $(`
      <div class="carousel">
        <div class="cycle-slideshow">
          <img src="about:blank" alt="" />
          <img src="about:blank" alt="" />
        </div>
        <button class="next" type="button">Next 1</button>
        <button class="prev" type="button">Prev 1</button>
      </div>
      <div class="carousel">
        <div class="cycle-slideshow">
          <img src="about:blank" alt="" />
          <img src="about:blank" alt="" />
        </div>
        <button class="next" type="button">Next 2</button>
        <button class="prev" type="button">Prev 2</button>
      </div>
    `);

    $(document.body).append($page);

    const $slideshows = $page.find('.cycle-slideshow');
    $slideshows.each(function() {
      $(this).cycle({
        fx: 'carousel',
        timeout: 0,
        slides: '> img',
        speed: 0,
        next: '.next',
        prev: '.prev'
      });
    });

    const api1 = $slideshows.eq(0).data('cycle.API');
    const api2 = $slideshows.eq(1).data('cycle.API');
    const opts1 = $slideshows.eq(0).data('cycle.opts');
    const opts2 = $slideshows.eq(1).data('cycle.opts');

    const firstNextButton = opts1.API.getComponent('next');
    const secondNextButton = opts2.API.getComponent('next');

    expect(firstNextButton).toHaveLength(1);
    expect(secondNextButton).toHaveLength(1);

    const firstEvents = $._data(firstNextButton[0], 'events') || {};
    const secondEvents = $._data(secondNextButton[0], 'events') || {};

    expect((firstEvents.click || []).length).toBeGreaterThan(0);
    expect((secondEvents.click || []).length).toBeGreaterThan(0);

    const originalNext1 = opts1.API.next;
    const originalNext2 = opts2.API.next;
    const callCounts = [0, 0];

    opts1.API.next = function() {
      callCounts[0]++;
      return originalNext1.apply(this, arguments);
    };

    opts2.API.next = function() {
      callCounts[1]++;
      return originalNext2.apply(this, arguments);
    };

    secondNextButton.trigger('click.cycle');
    expect(callCounts[0]).toBe(0);
    expect(callCounts[1]).toBe(1);

    firstNextButton.trigger('click.cycle');
    expect(callCounts[0]).toBe(1);
    expect(callCounts[1]).toBe(1);

    opts1.API.next = originalNext1;
    opts2.API.next = originalNext2;

    $slideshows.cycle('destroy');
    $page.remove();
  });
});
