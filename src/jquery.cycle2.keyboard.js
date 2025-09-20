/*!
 * jQuery Cycle2 Keyboard Navigation Plugin
 * Enables left/right arrow key navigation for any Cycle2 slideshow when focused.
 * (c) 2024
 */
(($) => {
	// Listen for keydown events on the document
	$(document).on("keydown", (e) => {
		// Only care about left/right arrow keys
		if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

		// Get the currently focused element
		var $focused = $(document.activeElement);

		// Find the nearest .cycle-slideshow ancestor (or itself)
		var $slideshow = $focused.closest(".cycle-slideshow");
		// If not found, check if focus is on a direct child of a carousel container
		if (!$slideshow.length) {
			$slideshow = $focused.parents().find(".cycle-slideshow").first();
		}
		if (!$slideshow.length) return;

		// Only trigger if the slideshow is visible and initialized
		if (!$slideshow.is(":visible") || !$slideshow.data("cycle.opts")) return;

		if (e.key === "ArrowLeft") {
			$slideshow.cycle("prev");
			e.preventDefault();
		} else if (e.key === "ArrowRight") {
			$slideshow.cycle("next");
			e.preventDefault();
		}
	});
})(jQuery);
