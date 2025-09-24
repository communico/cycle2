/*!
 * jQuery Cycle2 Keyboard Navigation Plugin
 * Enables left/right arrow key navigation for any Cycle2 slideshow when focused.
 * (c) 2024
 */
;(function($) {
"use strict";

// Listen for keydown events on the document
$(document).on('keydown', function(e) {
    var key = e.key || e.which;
    var isLeft = key === 'ArrowLeft' || key === 37;
    var isRight = key === 'ArrowRight' || key === 39;

    if (!isLeft && !isRight) {
        return;
    }

    var $focused = $(document.activeElement);
    var $slideshow = $focused.closest('.cycle-slideshow');

    if (!$slideshow.length) {
        var controlRoot = $focused.data('cycleControlFor');
        if (controlRoot) {
            $slideshow = $(controlRoot);
        }
    }

    if (!$slideshow || !$slideshow.length) {
        return;
    }

    if (!$slideshow.data('cycle.opts')) {
        return;
    }

    if (isLeft) {
        $slideshow.cycle('prev');
        e.preventDefault();
    }
    else if (isRight) {
        $slideshow.cycle('next');
        e.preventDefault();
    }
});

})(jQuery);
