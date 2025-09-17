const raf = (cb) => setTimeout(cb, 0);

if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = raf;
}

if (typeof globalThis.cancelAnimationFrame !== 'function') {
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

afterEach(() => {
  document.body.innerHTML = '';
});
