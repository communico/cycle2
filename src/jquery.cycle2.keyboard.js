/*!
 * jQuery Cycle2 Keyboard Navigation Plugin
 * Enables left/right arrow key navigation for any Cycle2 slideshow when focused.
 * (c) 2024
 */
;(function($) {
"use strict";

function resolveSlideshow( $element ) {
    var $slideshow = $();

    if ( !$element || !$element.length )
        return $slideshow;

    $slideshow = $element.closest('.cycle-slideshow');
    if ( $slideshow.length )
        return $slideshow;

    $slideshow = $element.closest('[data-cycle-slides]');
    if ( $slideshow.length && $slideshow.data('cycle.opts') )
        return $slideshow;

    $slideshow = $element.parents().filter(function() {
        return !!$( this ).data('cycle.opts');
    }).first();

    return $slideshow.length ? $slideshow : $();
}

// Listen for keydown events on the document
$(document).on('keydown', function(e) {
    var key = e.key || e.which;
    var isLeft = key === 'ArrowLeft' || key === 37;
    var isRight = key === 'ArrowRight' || key === 39;

    if (!isLeft && !isRight) {
        return;
    }

    var $focused = $(document.activeElement);
    var $slideshow = resolveSlideshow( $focused );

    if (!$slideshow.length) {
        var controlRoot = $focused.data('cycleControlFor');
        if (controlRoot) {
            $slideshow = $(controlRoot);
        }
    }

    if (!$slideshow || !$slideshow.length) {
        return;
    }

    var opts = $slideshow.data('cycle.opts');
    if (!opts) {
        return;
    }

    var activeClass = opts.slideActiveClass || 'cycle-slide-active';
    var $slides = opts.slides ? opts.slides : $slideshow.children();
    var $activeSlide = $slides.filter('.' + activeClass);
    var $focusables = getFocusableElements($activeSlide);
    var hasMultiple = $focusables.length > 1;
    var $currentFocusable = getCurrentFocusable($focusables, $focused);
    var currentIndex = $currentFocusable.length ? $focusables.index($currentFocusable) : -1;
    var slideCount = typeof opts.slideCount === 'number' ? opts.slideCount : $slides.length;

    if (hasMultiple && isRight) {
        if ($focused.is($slideshow) || (!$currentFocusable.length && $activeSlide.has($focused).length)) {
            focusItem($focusables.first());
            e.preventDefault();
            return;
        }

        if (currentIndex > -1 && currentIndex < $focusables.length - 1) {
            focusItem($focusables.eq(currentIndex + 1));
            e.preventDefault();
            return;
        }

        if (currentIndex === $focusables.length - 1) {
            if (slideCount > 1) {
                queueSlideFocus($slideshow, false);
                $slideshow.cycle('next');
            }
            else {
                focusItem($focusables.first());
            }
            e.preventDefault();
            return;
        }
    }

    if (hasMultiple && isLeft) {
        if (currentIndex > 0) {
            focusItem($focusables.eq(currentIndex - 1));
            e.preventDefault();
            return;
        }

        if (currentIndex === 0) {
            if (slideCount > 1) {
                queueSlideFocus($slideshow, true);
                $slideshow.cycle('prev');
            }
            else {
                focusItem($focusables.last());
            }
            e.preventDefault();
            return;
        }
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

function getFocusableElements($context) {
    if (!$context || !$context.length) {
        return $();
    }

    return $context
        .find('a[href], area[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
}

function getCurrentFocusable($focusables, $focused) {
    if (!$focusables.length || !$focused.length) {
        return $();
    }

    var active = $();
    $focusables.each(function(idx, element) {
        if (element === $focused[0] || $.contains(element, $focused[0])) {
            active = $(element);
            return false;
        }
        return true;
    });

    return active;
}

function focusItem($element) {
    if (!$element || !$element.length || !$element[0] || typeof $element[0].focus !== 'function') {
        return;
    }

    setTimeout(function() {
        $element[0].focus();
    }, 0);
}

function queueSlideFocus($slideshow, reverse) {
    if (!$slideshow || !$slideshow.length) {
        return;
    }

    $slideshow.one('cycle-after', function(event, slideOpts, prevSlide, currSlide) {
        var $slide = $(currSlide);
        var $focusables = getFocusableElements($slide);

        if ($focusables.length) {
            focusItem(reverse ? $focusables.last() : $focusables.first());
            return;
        }

        focusItem($slideshow);
    });
}

})(jQuery);
