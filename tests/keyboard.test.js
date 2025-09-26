import { beforeAll, describe, expect, it } from 'vitest';
import $ from 'jquery';

async function loadCycle2Modules() {
  const modules = [
    '../src/jquery.cycle2.core.js',
    '../src/jquery.cycle2.carousel.js',
    '../src/jquery.cycle2.command.js',
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

const KEY_MAP = {
  ArrowLeft: 37,
  ArrowRight: 39
};

async function triggerKey(key) {
  const event = $.Event('keydown', { key, which: KEY_MAP[key] });
  $(document).trigger(event);
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function mockActiveElement(el) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(document, 'activeElement');
  Object.defineProperty(document, 'activeElement', {
    configurable: true,
    get: () => el
  });
  return () => {
    if (originalDescriptor) {
      Object.defineProperty(document, 'activeElement', originalDescriptor);
    }
    else {
      delete document.activeElement;
    }
  };
}

describe('keyboard navigation', () => {
  it('loops through carousel slides when focus stays inside the slideshow', async () => {
    const $slideshow = $(`
      <div class="cycle-slideshow">
        <button class="slide" type="button">Slide 1</button>
        <button class="slide" type="button">Slide 2</button>
        <button class="slide" type="button">Slide 3</button>
      </div>
    `);

    $(document.body).append($slideshow);

    $slideshow.cycle({
      fx: 'carousel',
      timeout: 0,
      slides: '> .slide',
      speed: 0,
      allowWrap: true
    });

    const api = $slideshow.data('cycle.API');
    const slides = $slideshow.find('.slide');

    if (typeof slides[0].focus === 'function') {
      slides[0].focus();
    }

    const restoreActiveElement = mockActiveElement(slides[0]);

    expect(api.opts().currSlide).toBe(0);

    await triggerKey('ArrowRight');
    expect(api.opts().currSlide).toBe(1);

    await triggerKey('ArrowRight');
    expect(api.opts().currSlide).toBe(2);

    await triggerKey('ArrowRight');
    expect(api.opts().currSlide).toBe(0);

    await triggerKey('ArrowLeft');
    expect(api.opts().currSlide).toBe(2);

    await triggerKey('ArrowLeft');
    expect(api.opts().currSlide).toBe(1);

    $slideshow.cycle('destroy');
    $slideshow.remove();

    restoreActiveElement();
  });

  it('handles slideshows without the default cycle-slideshow class', async () => {
    const $slideshow = $(`
      <div class="ambl-show" data-cycle-next=".ambl-next" data-cycle-prev=".ambl-prev">
        <a class="ambl-prev" href="#prev">Prev</a>
        <div class="slide-wrap">
          <a class="slide" href="#one">One</a>
          <a class="slide" href="#two">Two</a>
          <a class="slide" href="#three">Three</a>
        </div>
        <a class="ambl-next" href="#next">Next</a>
      </div>
    `);

    $(document.body).append($slideshow);

    $slideshow.cycle({
      fx: 'carousel',
      timeout: 0,
      slides: '.slide',
      speed: 0,
      allowWrap: true
    });

    const api = $slideshow.data('cycle.API');
    const $links = $slideshow.find('.slide');

    if (typeof $links[1].focus === 'function') {
      $links[1].focus();
    }

    const restoreActiveElement = mockActiveElement($links[1]);

    expect(api.opts().currSlide).toBe(0);

    await triggerKey('ArrowRight');
    expect(api.opts().currSlide).toBe(1);

    await triggerKey('ArrowRight');
    expect(api.opts().currSlide).toBe(2);

    await triggerKey('ArrowLeft');
    expect(api.opts().currSlide).toBe(1);

    await triggerKey('ArrowLeft');
    expect(api.opts().currSlide).toBe(0);

    restoreActiveElement();
    $slideshow.cycle('destroy');
    $slideshow.remove();
  });

  it('steps through multiple focusable items before advancing slides', async () => {
    const originalActiveDescriptor = Object.getOwnPropertyDescriptor(document, 'activeElement');
    const originalFocus = HTMLElement.prototype.focus;
    let activeEl = null;

    Object.defineProperty(document, 'activeElement', {
      configurable: true,
      get: () => activeEl
    });

    HTMLElement.prototype.focus = function focusOverride() {
      activeEl = this;
      if (typeof originalFocus === 'function') {
        return originalFocus.call(this);
      }
      return undefined;
    };

    const $slideshow = $(`
      <div class="cycle-slideshow" tabindex="0">
        <div class="slide">
          <a class="item" href="#s1a">Slide 1A</a>
          <a class="item" href="#s1b">Slide 1B</a>
          <a class="item" href="#s1c">Slide 1C</a>
        </div>
        <div class="slide">
          <a class="item" href="#s2a">Slide 2A</a>
          <a class="item" href="#s2b">Slide 2B</a>
        </div>
      </div>
    `);

    try {
      $(document.body).append($slideshow);

      $slideshow.cycle({
        fx: 'fade',
        timeout: 0,
        slides: '> .slide',
        speed: 0,
        allowWrap: true
      });

      const api = $slideshow.data('cycle.API');
      const slides = $slideshow.find('.slide');
      const firstSlideLinks = slides.eq(0).find('a');
      const secondSlideLinks = slides.eq(1).find('a');

      if (typeof firstSlideLinks[0].focus === 'function') {
        firstSlideLinks[0].focus();
      }

      expect(document.activeElement).toBe(firstSlideLinks[0]);
      expect(api.opts().currSlide).toBe(0);

      await triggerKey('ArrowRight');
      expect(document.activeElement).toBe(firstSlideLinks[1]);
      expect(api.opts().currSlide).toBe(0);

      await triggerKey('ArrowRight');
      expect(document.activeElement).toBe(firstSlideLinks[2]);
      expect(api.opts().currSlide).toBe(0);

      await triggerKey('ArrowRight');
      expect(document.activeElement).toBe(secondSlideLinks[0]);
      expect(api.opts().currSlide).toBe(1);

      await triggerKey('ArrowLeft');
      expect(document.activeElement).toBe(firstSlideLinks[2]);
      expect(api.opts().currSlide).toBe(0);

      await triggerKey('ArrowLeft');
      expect(document.activeElement).toBe(firstSlideLinks[1]);
      expect(api.opts().currSlide).toBe(0);
    }
    finally {
      $slideshow.cycle('destroy');
      $slideshow.remove();

      if (originalActiveDescriptor) {
        Object.defineProperty(document, 'activeElement', originalActiveDescriptor);
      }
      else {
        delete document.activeElement;
      }

      HTMLElement.prototype.focus = originalFocus;
    }
  });
});
