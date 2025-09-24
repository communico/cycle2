/*! pause plugin for Cycle2;  version: 20241105 */
(function($) {
"use strict";

function isButtonLike(nodeName) {
    return nodeName === 'button' || nodeName === 'input' || nodeName === 'select' || nodeName === 'textarea';
}

function isLinkWithHref(element, nodeName) {
    return nodeName === 'a' && element.hasAttribute('href');
}

function ensureAccessibility($elements, opts) {
    if (!$elements || !$elements.length) {
        return;
    }

    $elements.each(function() {
        var el = this;
        var $el = $(el);
        var nodeName = (el.nodeName || '').toLowerCase();
        var interactive = isButtonLike(nodeName) || isLinkWithHref(el, nodeName);
        var hasTabindex = $el.is('[tabindex]');

        if (!interactive && !hasTabindex) {
            $el.attr('tabindex', '0');
        }

        if (!$el.attr('role')) {
            $el.attr('role', 'button');
        }

        var manageLabel = !$el.attr('aria-label') && !$el.attr('aria-labelledby');
        $el.data('cyclePauseManageLabel', manageLabel);
    });
}

function updateControlState($elements, opts) {
    if (!$elements || !$elements.length) {
        return;
    }

    var isPaused = !!(opts.paused || opts.hoverPaused);
    var label = isPaused ? opts.resumeAriaLabel : opts.pauseAriaLabel;

    $elements.each(function() {
        var $el = $(this);
        var manageLabel = !!$el.data('cyclePauseManageLabel');

        $el.attr('aria-pressed', isPaused ? 'true' : 'false');

        if (manageLabel) {
            $el.attr('aria-label', label);
        }

        if (opts.pauseActiveClass) {
            $el.toggleClass(opts.pauseActiveClass, isPaused);
        }

        if (opts.pausePlayingClass) {
            $el.toggleClass(opts.pausePlayingClass, !isPaused);
        }
    });
}

function bindEvents($elements, opts) {
    if (!$elements || !$elements.length) {
        return;
    }

    var toggle = function() {
        if (opts.paused || opts.hoverPaused) {
            opts.API.resume();
        } else {
            opts.API.pause();
        }
    };

    $elements.each(function() {
        var el = this;
        var $el = $(el);
        var nodeName = (el.nodeName || '').toLowerCase();
        var interactive = isButtonLike(nodeName) || isLinkWithHref(el, nodeName);

        $el.off(opts.pauseControlEvent);
        $el.on(opts.pauseControlEvent, function(event) {
            event.preventDefault();
            toggle();
        });

        $el.off('keydown.cyclePause');
        $el.on('keydown.cyclePause', function(event) {
            var key = event.key || event.which;
            var isSpace = key === ' ' || key === 'Spacebar' || key === 32;
            var isEnter = key === 'Enter' || key === 13;

            if (isSpace) {
                event.preventDefault();
                toggle();
                return;
            }

            if (!interactive && isEnter) {
                event.preventDefault();
                toggle();
            }
        });
    });
}

$.extend($.fn.cycle.defaults, {
    pauseControl: '> .cycle-pause',
    pauseControlEvent: 'click.cycle',
    pauseActiveClass: 'cycle-pause-active',
    pausePlayingClass: 'cycle-pause-playing',
    pauseAriaLabel: 'Pause slideshow',
    resumeAriaLabel: 'Resume slideshow'
});

$(document).on('cycle-initialized', function(e, opts) {
    var controls = opts.API.getComponent('pauseControl');

    if (!controls.length) {
        controls = opts.API.getComponent('pause');
    }

    if (!controls.length) {
        return;
    }

    controls.each(function() {
        $(this).data('cycleControlFor', opts.container[0]);
    });

    ensureAccessibility(controls, opts);
    bindEvents(controls, opts);
    updateControlState(controls, opts);

    opts.container.off('.cyclePause');
    opts.container.on('cycle-paused.cyclePause cycle-resumed.cyclePause', function() {
        updateControlState(controls, opts);
    });
});

$(document).on('cycle-destroyed', function(e, opts) {
    var controls = opts.API.getComponent('pauseControl');

    if (!controls.length) {
        controls = opts.API.getComponent('pause');
    }

    controls.off(opts.pauseControlEvent)
        .off('keydown.cyclePause')
        .removeData('cyclePauseManageLabel')
        .removeData('cycleControlFor');

    opts.container.off('.cyclePause');
});

})(jQuery);
