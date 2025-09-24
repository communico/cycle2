/*! pager plugin for Cycle2;  version: 20140415 */
(function($) {
"use strict";

$.extend($.fn.cycle.defaults, {
    pager:            '> .cycle-pager',
    pagerActiveClass: 'cycle-pager-active',
    pagerEvent:       'click.cycle',
    pagerEventBubble: undefined,
    pagerTemplate:    '<span>&bull;</span>'
});

$(document).on( 'cycle-bootstrap', function( e, opts, API ) {
    // add method to API
    API.buildPagerLink = buildPagerLink;
});

function isButtonLike(nodeName) {
    return nodeName === 'button' || nodeName === 'input' || nodeName === 'select' || nodeName === 'textarea';
}

function isLinkWithHref(element, nodeName) {
    return nodeName === 'a' && element.hasAttribute('href');
}

function buildPagerAriaLabel(opts, index) {
    return 'Go to slide ' + (index + 1);
}

function updatePagerPressedState(pager, target) {
    pager.children().attr('aria-pressed', 'false');
    $(target).attr('aria-pressed', 'true');
}

function enhancePagerItem($item, opts, pager, slideIndex) {
    var el = $item[0];
    var nodeName = (el.nodeName || '').toLowerCase();
    var interactive = isButtonLike(nodeName) || isLinkWithHref(el, nodeName);

    if (!interactive && !$item.is('[tabindex]')) {
        $item.attr('tabindex', '0');
    }

    if (!interactive && !$item.attr('role')) {
        $item.attr('role', 'button');
    }

    if (!$item.attr('aria-label')) {
        $item.attr('aria-label', buildPagerAriaLabel(opts, slideIndex));
    }

    $item.attr('aria-pressed', opts.currSlide === slideIndex ? 'true' : 'false');
    $item.data('cycleControlFor', opts.container[0]);
    $item.data('cyclePagerIndex', slideIndex);

    $item.off('keydown.cyclePager');
    $item.on('keydown.cyclePager', function(e) {
        var key = e.key || e.which;
        var isSpace = key === ' ' || key === 'Spacebar' || key === 32;
        var isEnter = key === 'Enter' || key === 13;
        var isLeft = key === 'ArrowLeft' || key === 37;
        var isRight = key === 'ArrowRight' || key === 39;

        if (isSpace || isEnter) {
            e.preventDefault();
            opts.API.page( pager, el );
            updatePagerPressedState(pager, el);
            $item.focus();
            return;
        }

        if (isLeft || isRight) {
            e.preventDefault();
            var children = pager.children();
            var currentIndex = children.index( el );
            if (currentIndex === -1) {
                return;
            }

            var delta = isRight ? 1 : -1;
            var nextIndex = currentIndex + delta;
            var childCount = children.length;

            if (nextIndex < 0 || nextIndex >= childCount) {
                if (!opts.allowWrap) {
                    return;
                }
                nextIndex = (nextIndex + childCount) % childCount;
            }

            var target = children.get(nextIndex);
            if (target) {
                opts.API.page( pager, target );
                updatePagerPressedState(pager, target);
                $(target).focus();
            }
        }
    });
}

$(document).on( 'cycle-slide-added', function( e, opts, slideOpts, slideAdded ) {
    if ( opts.pager ) {
        opts.API.buildPagerLink ( opts, slideOpts, slideAdded );
        opts.API.page = page;
    }
});

$(document).on( 'cycle-initialized', function( e, opts ) {
    if ( !opts.pager ) {
        return;
    }

    var pagers = opts.API.getComponent( 'pager' );
    if ( pagers && pagers.length ) {
        pagers.each(function() {
            var pager = $(this);
            pager.data('cycleControlFor', opts.container[0] );
            pager.children().each(function(index) {
                enhancePagerItem($(this), opts, pager, index);
            });
        });
    }
});

$(document).on( 'cycle-slide-removed', function( e, opts, index, slideRemoved ) {
    if ( opts.pager ) {
        var pagers = opts.API.getComponent( 'pager' );
        pagers.each(function() {
            var pager = $(this);
            $( pager.children()[index] ).remove();
        });
    }
});

$(document).on( 'cycle-update-view', function( e, opts, slideOpts ) {
    var pagers;

    if ( opts.pager ) {
        pagers = opts.API.getComponent( 'pager' );
        pagers.each(function() {
           var children = $(this).children();
           children.removeClass( opts.pagerActiveClass )
            .attr('aria-pressed', 'false')
            .eq( opts.currSlide )
                .addClass( opts.pagerActiveClass )
                .attr('aria-pressed', 'true');
        });
    }
});

$(document).on( 'cycle-destroyed', function( e, opts ) {
    var pager = opts.API.getComponent( 'pager' );

    if ( pager ) {
        pager.children().off( opts.pagerEvent ).off('keydown.cyclePager'); // #202
        if ( opts.pagerTemplate )
            pager.empty();
        pager.removeData('cycleControlFor');
    }
});

function buildPagerLink( opts, slideOpts, slide ) {
    var pagerLink;
    var pagers = opts.API.getComponent( 'pager' );
    pagers.each(function() {
        var pager = $(this);
        var slideIndex = opts.slides.index(slide);
        if (slideIndex < 0) {
            slideIndex = Math.max(0, opts.slides.length - 1);
        }
        if ( slideOpts.pagerTemplate ) {
            var markup = opts.API.tmpl( slideOpts.pagerTemplate, slideOpts, opts, slide[0] );
            pagerLink = $( markup ).appendTo( pager );
        }
        else {
            pagerLink = pager.children().eq( opts.slideCount - 1 );
        }
        pagerLink.on( opts.pagerEvent, function(e) {
            if ( ! opts.pagerEventBubble )
                e.preventDefault();
            opts.API.page( pager, e.currentTarget);
            updatePagerPressedState(pager, e.currentTarget);
        });

        pagerLink.data('cycleControlFor', opts.container[0] );
        enhancePagerItem(pagerLink, opts, pager, slideIndex);
    });
}

function page( pager, target ) {
    /*jshint validthis:true */
    var opts = this.opts();
    if ( opts.busy && ! opts.manualTrump )
        return;

    var index = pager.children().index( target );
    var nextSlide = index;
    var fwd = opts.currSlide < nextSlide;
    if (opts.currSlide == nextSlide) {
        return; // no op, clicked pager for the currently displayed slide
    }
    opts.nextSlide = nextSlide;
    opts._tempFx = opts.pagerFx;
    opts.API.prepareTx( true, fwd );
    opts.API.trigger('cycle-pager-activated', [opts, pager, target ]);
}

})(jQuery);
