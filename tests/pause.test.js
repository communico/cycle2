import { beforeAll, describe, expect, it } from 'vitest';
import $ from 'jquery';

async function loadCycle2Modules() {
  const modules = [
    '../src/jquery.cycle2.core.js',
    '../src/jquery.cycle2.autoheight.js',
    '../src/jquery.cycle2.command.js',
    '../src/jquery.cycle2.prevnext.js',
    '../src/jquery.cycle2.pause.js'
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

describe('pause control plugin', () => {
  it('exposes accessible controls and toggles paused state', () => {
    const $pause = $('<div class="cycle-pause">Pause</div>');
    const $controls = $('<div class="demo-controls"></div>').append($pause);
    const $wrapper = $('<div class="demo-carousel"></div>');
    const $slideshow = $(`
      <div class="cycle-slideshow">
        <img src="about:blank" alt="" />
        <img src="about:blank" alt="" />
      </div>
    `);

    $wrapper.append($slideshow, $controls);
    $(document.body).append($wrapper);

    $slideshow.cycle({
      fx: 'none',
      timeout: 0,
      slides: '> img',
      pause: '.demo-controls .cycle-pause'
    });

    const api = $slideshow.data('cycle.API');

    expect($pause.attr('tabindex')).toBe('0');
    expect($pause.attr('role')).toBe('button');
    expect($pause.attr('aria-pressed')).toBe('false');
    expect($pause.attr('aria-label')).toBe('Pause slideshow');

    $pause.trigger('click');

    expect(api.opts().paused).toBe(true);
    expect($pause.hasClass('cycle-pause-active')).toBe(true);
    expect($pause.attr('aria-pressed')).toBe('true');
    expect($pause.attr('aria-label')).toBe('Resume slideshow');

    const spaceEvent = $.Event('keydown', { key: ' ', which: 32 });
    $pause.trigger(spaceEvent);

    expect(api.opts().paused).toBe(false);
    expect($pause.hasClass('cycle-pause-active')).toBe(false);
    expect($pause.attr('aria-pressed')).toBe('false');
    expect($pause.attr('aria-label')).toBe('Pause slideshow');

    $slideshow.cycle('destroy');
  });

  it('respects author-supplied accessibility metadata on button elements', () => {
    const $pause = $('<button class="cycle-pause" type="button" aria-label="Toggle playback">Pause</button>');
    const $slideshow = $(`
      <div class="cycle-slideshow">
        <img src="about:blank" alt="" />
        <img src="about:blank" alt="" />
      </div>
    `);

    $slideshow.append($pause);
    $(document.body).append($slideshow);

    $slideshow.cycle({
      fx: 'none',
      timeout: 0,
      slides: '> img'
    });

    const api = $slideshow.data('cycle.API');

    expect($pause.attr('aria-label')).toBe('Toggle playback');
    expect($pause.attr('aria-pressed')).toBe('false');

    api.pause();
    expect($pause.attr('aria-label')).toBe('Toggle playback');
    expect($pause.attr('aria-pressed')).toBe('true');

    api.resume();
    expect($pause.attr('aria-pressed')).toBe('false');
    expect($pause.hasClass('cycle-pause-active')).toBe(false);

    $slideshow.cycle('destroy');
  });
});
