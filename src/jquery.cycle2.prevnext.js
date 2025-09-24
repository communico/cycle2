/*! prevnext plugin for Cycle2;  version: 20241105 */
(function($) {
"use strict";

function enhanceControlAccess( $elements, label, action ) {
    if ( !$elements || !$elements.length ) {
        return;
    }

    $elements.each(function() {
        var $el = $( this );
        var nodeName = ( this.nodeName || '' ).toLowerCase();
        var hasTabindex = $el.is('[tabindex]');
        var isButtonLike = nodeName === 'button' || nodeName === 'input' || nodeName === 'select' || nodeName === 'textarea';
        var isLinkWithHref = nodeName === 'a' && this.hasAttribute('href');

        if ( !isButtonLike && !isLinkWithHref && !hasTabindex ) {
            $el.attr('tabindex', '0');
        }

        if ( !$el.attr('role') ) {
            $el.attr('role', 'button');
        }

        if ( label && !$el.attr('aria-label') && !$el.attr('aria-labelledby') ) {
            $el.attr('aria-label', label );
        }

        $el.off('keydown.cycle');
        $el.on('keydown.cycle', function( event ) {
            var key = event.key || event.which;
            var isSpace = key === ' ' || key === 'Spacebar' || key === 32;
            var isEnter = key === 'Enter' || key === 13;

            if ( isSpace ) {
                event.preventDefault();
                action();
                return;
            }

            if ( !isButtonLike && !isLinkWithHref && isEnter ) {
                event.preventDefault();
                action();
            }
        });
    });
}

$.extend($.fn.cycle.defaults, {
    next:           '> .cycle-next',
    nextEvent:      'click.cycle',
    disabledClass:  'disabled',
    prev:           '> .cycle-prev',
    prevEvent:      'click.cycle',
    swipe:          false,
    nextAriaLabel:  'Next slide',
    prevAriaLabel:  'Previous slide'
});

$(document).on( 'cycle-initialized', function( e, opts ) {
    var next = opts.API.getComponent( 'next' );
    var prev = opts.API.getComponent( 'prev' );
    var root = opts.container && opts.container[0];

    if (root) {
        if (next && next.length) {
            next.each(function() {
                $(this).data('cycleControlFor', root);
            });
        }

        if (prev && prev.length) {
            prev.each(function() {
                $(this).data('cycleControlFor', root);
            });
        }
    }

    enhanceControlAccess( next, opts.nextAriaLabel, function() {
        opts.API.next();
    });

    enhanceControlAccess( prev, opts.prevAriaLabel, function() {
        opts.API.prev();
    });

    next.on( opts.nextEvent, function(e) {
        e.preventDefault();
        opts.API.next();
    });

    prev.on( opts.prevEvent, function(e) {
        e.preventDefault();
        opts.API.prev();
    });

    if ( opts.swipe ) {
        var nextEvent = opts.swipeVert ? 'swipeUp.cycle' : 'swipeLeft.cycle swipeleft.cycle';
        var prevEvent = opts.swipeVert ? 'swipeDown.cycle' : 'swipeRight.cycle swiperight.cycle';
        opts.container.on( nextEvent, function(e) {
            opts._tempFx = opts.swipeFx;
            opts.API.next();
        });
        opts.container.on( prevEvent, function() {
            opts._tempFx = opts.swipeFx;
            opts.API.prev();
        });
    }
});

$(document).on( 'cycle-update-view', function( e, opts, slideOpts, currSlide ) {
    if ( opts.allowWrap )
        return;

    var cls = opts.disabledClass;
    var next = opts.API.getComponent( 'next' );
    var prev = opts.API.getComponent( 'prev' );
    var prevBoundry = opts._prevBoundry || 0;
    var nextBoundry = (opts._nextBoundry !== undefined)?opts._nextBoundry:opts.slideCount - 1;

    if ( opts.currSlide == nextBoundry )
        next.addClass( cls ).prop( 'disabled', true );
    else
        next.removeClass( cls ).prop( 'disabled', false );

    if ( opts.currSlide === prevBoundry )
        prev.addClass( cls ).prop( 'disabled', true );
    else
        prev.removeClass( cls ).prop( 'disabled', false );
});


$(document).on( 'cycle-destroyed', function( e, opts ) {
    var prev = opts.API.getComponent( 'prev' );
    var next = opts.API.getComponent( 'next' );
    prev.off( opts.nextEvent ).off( 'keydown.cycle' );
    next.off( opts.prevEvent ).off( 'keydown.cycle' );
    prev.removeData('cycleControlFor');
    next.removeData('cycleControlFor');
    opts.container.off( 'swipeleft.cycle swiperight.cycle swipeLeft.cycle swipeRight.cycle swipeUp.cycle swipeDown.cycle' );
});

})(jQuery);
