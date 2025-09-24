import { beforeAll, describe, expect, it } from 'vitest';
import $ from 'jquery';

async function loadCycle2Modules() {
  const modules = [
    '../src/jquery.cycle2.core.js',
    '../src/jquery.cycle2.autoheight.js',
    '../src/jquery.cycle2.pager.js',
    '../src/jquery.cycle2.prevnext.js',
    '../src/jquery.cycle2.tmpl.js'
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

describe('pager accessibility', () => {
  it('provides focusable pager controls with keyboard support', async () => {
    const $pager = $('<div class="cycle-pager"></div>');
    const $slideshow = $(`
      <div class="cycle-slideshow">
        <img src="about:blank" alt="" />
        <img src="about:blank" alt="" />
        <img src="about:blank" alt="" />
      </div>
    `);

    $(document.body).append($slideshow, $pager);

    $slideshow.cycle({
      fx: 'none',
      timeout: 0,
      slides: '> img',
      pager: $pager
    });

    const api = $slideshow.data('cycle.API');
    const dots = $pager.children();

    expect(dots.length).toBe(3);
    expect(dots.eq(0).attr('tabindex')).toBe('0');
    expect(dots.eq(0).attr('role')).toBe('button');
    expect(dots.eq(0).attr('aria-label')).toBe('Go to slide 1');
    expect(dots.eq(0).attr('aria-pressed')).toBe('true');
    expect(dots.eq(1).attr('aria-pressed')).toBe('false');

    dots.eq(1).focus();
    const spaceEvent = $.Event('keydown', { key: ' ', which: 32 });
    dots.eq(1).trigger(spaceEvent);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(api.opts().currSlide).toBe(1);
    expect(dots.eq(1).attr('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(dots.eq(1)[0]);

    const rightEvent = $.Event('keydown', { key: 'ArrowRight', which: 39 });
    dots.eq(1).trigger(rightEvent);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(api.opts().currSlide).toBe(2);
    expect(document.activeElement).toBe(dots.eq(2)[0]);

    const leftEvent = $.Event('keydown', { key: 'ArrowLeft', which: 37 });
    dots.eq(2).trigger(leftEvent);
    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(api.opts().currSlide).toBe(1);
    expect(document.activeElement).toBe(dots.eq(1)[0]);

    $slideshow.cycle('destroy');
  });
});
