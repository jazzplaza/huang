$(window).on("load", function () {

    "use strict";

    // Mobile: show slider-img.png fully (remove circular clip-path on small screens)
    (function () {
        try {
            if (!window.matchMedia || !window.matchMedia('(max-width: 767.98px)').matches) return;
            var imgEl = document.getElementById('banner-slider-img');
            if (imgEl && imgEl.hasAttribute('clip-path')) {
                imgEl.removeAttribute('clip-path');
            }
        } catch (e) {}
    })();

    //Clear URL On Page Refresh
    var loc = window.location.href,
        index = loc.indexOf('#');

    if (index > 0) {
        window.location = loc.substring(0, index);
    }

    /* ===================================
        Page Piling
    ====================================== */
	    if($(window).width() < 1280) {
	        $('.pagedata').removeAttr('id');
	        $('html, body').css('overflow-y', 'scroll');

	        // Scroll mode: if ancestor tree is expanded and About scrolls out (downwards),
	        // collapse ancestor tree so it won't overlap the next section.
	        (function () {
	            var aboutEl = document.getElementById('about');
	            if (!aboutEl) return;

	            var collapsedOnce = false;
	            function isAncestorExpanded() {
	                try {
	                    var panel = document.getElementById('genealogy-panel-maternal');
	                    if (!panel) return false;
	                    var rootChildren = panel.querySelector('.genealogy-tree > ul > li > ul');
	                    if (!rootChildren) return false;
	                    return rootChildren.offsetParent !== null;
	                } catch (e) {
	                    return false;
	                }
	            }

	            $(window).on('scroll', function () {
	                if (!isAncestorExpanded()) {
	                    collapsedOnce = false;
	                    return;
	                }

	                var rect = aboutEl.getBoundingClientRect();
	                if (rect.bottom < 0) {
	                    if (collapsedOnce) return;
	                    collapsedOnce = true;
	                    try {
	                        if (window.collapseAncestorGenealogyTree) {
	                            window.collapseAncestorGenealogyTree();
	                        }
	                    } catch (e) {}
	                } else {
	                    collapsedOnce = false;
	                }
	            });
	        })();

	        //Team Counter
	        $('.count').each(function () {
	            $(this).appear(function () {
	                $(this).prop('Counter', 0).animate({
	                    Counter: $(this).text()
                }, {
                    duration: 3000,
                    easing: 'swing',
                    step: function (now) {
                        $(this).text(Math.ceil(now));
                    }
                });
            });
        });
        //Portfolio Counter
        $('.portfolio-counter').each(function () {
            $(this).appear(function () {
                $(this).prop('Counter', 0).animate({
                    Counter: $(this).text()
                }, {
                    duration: 3000,
                    easing: 'swing',
                    step: function (now) {
                        $(this).text(Math.ceil(now));
                    }
                });
            });
        });
    }
    else{
        var useGenealogyNormalScroll = window.matchMedia && (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches);
        $('#pagepiling').pagepiling({
            direction: 'vertical',
            sectionsColor: ['#171717', '#171717', '#171717', '#171717', '#171717', '#171717'],
            anchors: ['home-banner', 'about', 'team', 'portfolio', 'blog', 'contact'],
            scrollingSpeed: 500,
            menu: '#menu',
            easing: 'linear',
            loopBottom: false,
            loopTop: false,
            css3: true,
            navigation: {
                'bulletsColor': '#535353',
                'position': 'left',
                'tooltips': ['家', '樹狀圖', '好味道', '美好照片', '美好影片', '承先起後故事'],
            },
            normalScrollElements: useGenealogyNormalScroll ? '#about .ancestor-scroll, #about .ancestor-scroll *, #genealogy-panel-paternal .genealogy-body, #genealogy-panel-paternal .genealogy-body *' : null,
            normalScrollElementTouchThreshold: useGenealogyNormalScroll ? 100 : 5,

            //events
	            onLeave: function (index, nextIndex, direction) {
                //reaching our First section? The one with our normal site?

                $('.navbar-top-default').fadeOut();
                $('.slider-bottom .slider-social').fadeOut();
                $('.slider-copyright').fadeOut();

                if(nextIndex == 1 || nextIndex == 2 || nextIndex == 3 || nextIndex == 4 || nextIndex == 5 || nextIndex == 6 || nextIndex == 7 || nextIndex == 8 || nextIndex == 9 || nextIndex == 10){

                    setTimeout(function(){
                        $('.navbar-top-default').fadeIn();
                        $('.slider-bottom .slider-social').fadeIn();
                        $('.slider-copyright').fadeIn();
                    }, 600);
                }

                //Team Counter
                if(nextIndex == 3) {
                    $('.count').each(function () {
                        $(this).appear(function () {
                            $(this).prop('Counter', 0).animate({
                                Counter: $(this).text()
                            }, {
                                duration: 3000,
                                easing: 'swing',
                                step: function (now) {
                                    $(this).text(Math.ceil(now));
                                }
                            });
                        });
                    });
                }
                //Portfolio Counter
                if(nextIndex == 4) {
                    $('.portfolio-counter').each(function () {
                        $(this).appear(function () {
                            $(this).prop('Counter', 0).animate({
                                Counter: $(this).text()
                            }, {
                                duration: 3000,
                                easing: 'swing',
                                step: function (now) {
                                    $(this).text(Math.ceil(now));
                                }
                            });
                        });
                    });
                }

	                // About section: ensure tree_open hint is positioned correctly after pagepiling transition
		                if (nextIndex == 2) {
		                    setTimeout(function () {
		                        if (window.updateTreeOpenHint) {
		                            window.updateTreeOpenHint();
		                            setTimeout(window.updateTreeOpenHint, 180);
		                        }
		                    }, 650);
		                }

		                // Leaving About: fully collapse genealogy state so expanded containers cannot leak into adjacent sections
	                if (index == 2) {
	                    try {
	                        if (window.resetActiveGenealogyTree) {
	                            window.resetActiveGenealogyTree();
	                        }
	                    } catch (e) {}
	                }

	                if(nextIndex == 1) {
	                    $('.section1left').addClass('slideInLeft');
	                    setTimeout(function(){
	                        $('.section1left').removeClass('slideInLeft');
                    }, 1800);

                    $('.section1right').addClass('slideInRight');
                    setTimeout(function(){
                        $('.section1right').removeClass('slideInRight');
                    }, 1800);
                }

                if(nextIndex == 2) {
                    $('.about-fadeIn').addClass('slideInLeft');
                    setTimeout(function(){
                        $('.about-fadeIn').removeClass('slideInLeft');
                    }, 1500);

                    $('.about-zoom1In').addClass('zoomIn');
                    setTimeout(function(){
                        $('.about-zoom1In').removeClass('zoomIn');
                    }, 1000);

                    $('.about-zoom2In').addClass('zoomIn');
                    setTimeout(function(){
                        $('.about-zoom2In').removeClass('zoomIn');
                    }, 1200);

                    $('.about-zoom3In').addClass('zoomIn');
                    setTimeout(function(){
                        $('.about-zoom3In').removeClass('zoomIn');
                    }, 1400);

                    $('.about-zoom4In').addClass('zoomIn');
                    setTimeout(function(){
                        $('.about-zoom4In').removeClass('zoomIn');
                    }, 1600);

                    $('.about-zoom5In').addClass('fadeInUp');
                    setTimeout(function(){
                        $('.about-zoom5In').removeClass('fadeInUp');
                    }, 1400);
                }

                if(nextIndex == 3) {
                    $('.section3left').addClass('slideInLeft');
                    setTimeout(function(){
                        $('.section3left').removeClass('slideInLeft');
                    }, 1800);

                    $('.section3right').addClass('slideInRight');
                    setTimeout(function(){
                        $('.section3right').removeClass('slideInRight');
                    }, 1800);

                    $('.team-fade').addClass('zoomIn');
                    setTimeout(function(){
                        $('.team-fade').removeClass('zoomIn');
                    }, 1600);
                }

                if(nextIndex == 4) {
                    $('.section4left').addClass('slideInLeft');
                    setTimeout(function(){
                        $('.section4left').removeClass('slideInLeft');
                    }, 1800);

                    $('.section4right').addClass('slideInRight');
                    setTimeout(function(){
                        $('.section4right').removeClass('slideInRight');
                    }, 1800);

                    $('.portfolio-fade').addClass('zoomIn');
                    setTimeout(function(){
                        $('.portfolio-fade').removeClass('zoomIn');
                    }, 1600);
                }

                if(nextIndex == 5) {
                    $('.section5left').addClass('slideInLeft');
                    setTimeout(function(){
                        $('.section5left').removeClass('slideInLeft');
                    }, 1800);

                    $('.section5right').addClass('slideInRight');
                    setTimeout(function(){
                        $('.section5right').removeClass('slideInRight');
                    }, 1800);

                    $('.section5right').addClass('slideInRight');
                    setTimeout(function(){
                        $('.section5right').removeClass('slideInRight');
                    }, 1800);

                    $('.blog-left').addClass('slideInLeft');
                    setTimeout(function(){
                        $('.blog-left').removeClass('slideInLeft');
                    }, 1500);

                    $('.blog-right').addClass('slideInRight');
                    setTimeout(function(){
                        $('.blog-right').removeClass('slideInRight');
                    }, 1500);

                    $('.blog-center').addClass('fadeIn');
                    setTimeout(function(){
                        $('.blog-center').removeClass('fadeIn');
                    }, 1500);
                }

                if(nextIndex == 6) {
                    $('.section6left').addClass('slideInLeft');
                    setTimeout(function(){
                        $('.section6left').removeClass('slideInLeft');
                    }, 1800);
                }
            },
        });
    }

/* ===================================
        WOW Animation
====================================== */

    if ($(window).width() > 991) {
        var wow = new WOW({
            boxClass: 'wow',
            animateClass: 'animated',
            offset: 0,
            mobile: false,
            live: true
        });
        new WOW().init();
    }

/* ===================================
    Loading Timeout
 ====================================== */
    $('.side-menu').removeClass('hidden');

    setTimeout(function(){
        $("#loader-fade").fadeOut("slow");
    }, 1000);
});

jQuery(function ($) {

    "use strict";

    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 260) { // Set position from top to add class
            $('header').addClass('header-appear');
        }
        else {
            $('header').removeClass('header-appear');
        }
    });

    //scroll to appear
    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 500)
            $('.scroll-top-arrow').fadeIn('slow');
        else
            $('.scroll-top-arrow').fadeOut('slow');
    });

    //Click event to scroll to top
    $(document).on('click', '.scroll-top-arrow', function () {
        $('html, body').animate({scrollTop: 0}, 800);
        return false;
    });
});

/* ===================================
     Side Menu Open & Close
====================================== */
function  my_click() {

    $('#my_tog').on("click", function () {
        $(".side_nav").addClass("expand_nav");
        $("#my_tog").addClass("close_nav");
        $("#my_tog").attr("id","close_nav");

        $(".overlay-body").addClass("show_body_overlay");
        $('#pp-nav').hide();
    });

    $('#close_nav').on("click", function () {
        $("#close_nav").removeClass("close_nav");
        $(".side_nav").removeClass("expand_nav");
        $("#my_tog").removeClass("close_nav");
        $("#close_nav").attr("id","my_tog");

        $(".overlay-body").removeClass("show_body_overlay");
        $('#pp-nav').show();
    });
}

$('.side-nav-menu .nav-menu li a').on("click", function () {
    $(".side_nav").removeClass("expand_nav");
    $("#close_nav").removeClass("close_nav");
    $(".side_nav").removeClass("expand_nav");
    $("#my_tog").removeClass("close_nav");
    $("#close_nav").attr("id","my_tog");
    $('#pp-nav').show();
    $('.side-nav-menu .nav-menu .nav-item .nav-link').removeClass('active');
    $(this).addClass('active');
});

/* ===================================
    Broad Nav
====================================== */

$('.my_nav_tog').click(function() {
    $('.broad').addClass('broad-nav');
    $('.broad').css({ opacity: "1" });
    $('.head-nav').hide();
    $('body').addClass('show-modal');
});

$('.btn-close').click(function() {
    $('.broad').css({ opacity: "0" });
    $('body').removeClass('show-modal');
    setTimeout(function() {$('.broad').removeClass('broad-nav')},100);
});

$('.broad ul li a').click(function () {
    $('.broad').css({ opacity: "0" });
    $('body').removeClass('show-modal');
    setTimeout(function() {$('.broad').removeClass('broad-nav')},100);
});

/* ===================================
    Fixed Broad Nav-Bar
 ====================================== */

$(window).on('scroll', function () {

    if($(window).width() <= 767){
        if ($(this).scrollTop() > 300) {
            $('#home').addClass('fixed-top')
            $('#home').addClass('fix-top')
            $('#pagepiling').addClass('margin-manage');
        }
        else {
            $('#home').removeClass('fixed-top')
            $('#home').removeClass('fix-top')
            $('#pagepiling').removeClass('margin-manage');
        }
    }else {
        $('#home').removeClass('fixed-top')
        $('#home').removeClass('fix-top')
    }
});

$('.overlay-body').on('click', function(e) {
    $("#close_nav").removeClass("close_nav");
    $(".side_nav").removeClass("expand_nav");
    $("#my_tog").removeClass("close_nav");
    $("#close_nav").attr("id","my_tog");
    $(".overlay-body").removeClass('show_body_overlay');
});

/* =====================================
      Nav-Bar Offset
 ====================================== */

$(".broad .nav-menu .nav-link").on("click", function (event) {
    event.preventDefault();
    off_set= 65;
    if(screen.width > 768){
        off_set = 140;
    }
    $("html,body").animate({
        scrollTop: $(this.hash).offset().top - off_set}, 100);
});

/* ===================================
     Team Carousel
====================================== */

$("#team-slider").owlCarousel({
    items: 5,
    dots: false,
    nav: false,
    loop: true,
    center:true,
    autoplay: true,
    autoplayHoverPause:true,
    slideSpeed: 900,
    paginationSpeed: 1500,
    smartSpeed: 250,
    responsive: {
        992: {
            items: 3
        },
        600: {
            items: 3
        },
        320: {
            items: 1
        },
        280: {
            items: 1
        }
    }
});

/*===================================
    Testimonials Carousel
====================================== */

$(".owl-testimonial").owlCarousel({
    items: 3,
    margin: 30,
    dots: false,
    nav: false,
    loop:true,
    autoplay: true,
    autoplayHoverPause:true,
    responsiveClass:true,
    animateOut: 'zoomOut',
    animateIn: 'zoomIn',
    responsive: {
        992: {
            items: 1
        },
        600: {
            items: 1
        },
        320: {
            items: 1
        },
    }
});

/*===================================
    Portfolio Carousel
====================================== */

$(".team-classic.owl-team").owlCarousel({
    items: 3,
    margin: 30,
    dots: false,
    nav: false,
    loop:true,
    autoplay: true,
    smartSpeed: 150,
    navSpeed: 150,
    autoplayHoverPause:true,
    responsiveClass:true,
    responsive: {
        992: {
            items: 1
        },
        600: {
            items: 1
        },
        320: {
            items: 1
        },
        280: {
            items: 1
        }
    }
});

/*===================================
    Videos Carousel
====================================== */

if ($(".owl-videos").length) {
    $(".owl-videos").owlCarousel({
        items: 2,
        margin: 30,
        dots: false,
        nav: true,
        loop: true,
        autoplay: true,
        autoplayHoverPause: true,
        smartSpeed: 180,
        responsive: {
            992: {
                items: 2
            },
            600: {
                items: 1
            },
            320: {
                items: 1
            },
        }
    });
}

/*===================================
    Video review (main + right list)
====================================== */

(function () {
    function setMainVideo(videoId) {
        var frame = document.getElementById('video-review-main');
        if (!frame || !videoId) return;
        frame.src = 'https://www.youtube.com/embed/' + videoId;
    }

    function setMainTitle(title) {
        var el = document.getElementById('video-review-title');
        if (!el) return;
        el.textContent = title || '';
    }

    $(function () {
        var $scope = $('.video-review-scope');
        if (!$scope.length) return;

        // Init from active item
        var $active = $('.video-review-scope .video-review__item.is-active').first();
        if ($active.length) {
            setMainTitle($.trim($active.find('.video-review__label').first().text()));
        }

        $(document).on('click', '.video-review-scope .video-review__item', function () {
            var $item = $(this);
            var id = $item.data('videoId');
            var title = $.trim($item.find('.video-review__label').first().text());
            if (!id) return;

            $('.video-review-scope .video-review__item').removeClass('is-active');
            $('.video-review-scope .video-review__item[data-video-id="' + id + '"]').addClass('is-active');
            setMainVideo(id);
            setMainTitle(title);
        });
    });
})();

/*===================================
    Portfolio thumbs (3 fixed + arrows)
====================================== */

(function () {
    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getPortfolioPhotos($portfolio) {
        var dataEl = $portfolio.find('#portfolio-photo-data').get(0);
        if (!dataEl) return [];
        try {
            var parsed = JSON.parse(dataEl.textContent || '[]');
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(function (item) {
                return item && item.src;
            }).map(function (item) {
                return {
                    src: String(item.src),
                    caption: String(item.caption || ''),
                    alt: String(item.alt || item.caption || '')
                };
            });
        } catch (e) {
            return [];
        }
    }

    function renderPortfolio($portfolio, photos) {
        if (!$portfolio.length || !photos.length) return;

        var main = photos[0];
        var mainHtml = [
            '<a class="portfolio-main__link" href="', escapeHtml(main.src), '" data-fancybox="portfolio-images" data-caption="', escapeHtml(main.caption), '">',
                '<div class="portfolio-main__frame">',
                    '<img class="portfolio-main__img" src="', escapeHtml(main.src), '" alt="', escapeHtml(main.caption || main.alt), '">',
                    '<div class="portfolio-main__overlay" aria-hidden="true">',
                        '<div class="portfolio-main__icon"><i class="fa fa-plus"></i></div>',
                        '<div class="portfolio-main__hint alt-font">原圖</div>',
                    '</div>',
                '</div>',
                '<img class="portfolio-main__corner-png" src="img/toy.png" alt="" aria-hidden="true">',
            '</a>',
            '<div class="portfolio-main__caption text-yellow main-font">', escapeHtml(main.caption), '</div>'
        ].join('');
        $portfolio.find('.portfolio-main').first().html(mainHtml);

        var thumbsHtml = photos.map(function (photo, idx) {
            return [
                '<a class="portfolio-thumbs__item', (idx === 0 ? ' is-active' : ''), '" href="', escapeHtml(photo.src), '" data-thumb="', escapeHtml(photo.src), '" data-caption="', escapeHtml(photo.caption), '" aria-label="', escapeHtml(photo.alt || ('photo-' + idx)), '">',
                    '<img src="', escapeHtml(photo.src), '" alt="', escapeHtml(photo.alt || photo.caption), '">',
                '</a>'
            ].join('');
        }).join('');
        $portfolio.find('.portfolio-thumbs__track').first().html(thumbsHtml);
    }

    function initThumbs($root) {
        var $portfolio = $root.closest('#portfolio');
        var photos = getPortfolioPhotos($portfolio);
        renderPortfolio($portfolio, photos);
        var $track = $root.find('.portfolio-thumbs__track');
        var $items = $track.find('.portfolio-thumbs__item');
        var $prev = $root.find('.portfolio-thumbs__nav--prev');
        var $next = $root.find('.portfolio-thumbs__nav--next');
        var $mainLink = $portfolio.find('.portfolio-main__link').first();
        var $mainImg = $portfolio.find('.portfolio-main__img').first();
        var $mainCaption = $portfolio.find('.portfolio-main__caption').first();
        var $mainFrame = $portfolio.find('.portfolio-main__frame').first();

        var visibleCount = 3;

        if (!$track.length || $items.length <= visibleCount) {
            $prev.prop('disabled', true);
            $next.prop('disabled', true);
            return;
        }

        // Build loop by cloning head/tail items once.
        if (!$track.data('thumbsLoopReady')) {
            var originals = $items.toArray();
            originals.forEach(function (el, i) {
                el.dataset.originalIndex = String(i);
            });

            var cloneCount = Math.min(visibleCount, originals.length);
            var head = originals.slice(0, cloneCount).map(function (el) {
                var c = el.cloneNode(true);
                c.classList.add('is-clone');
                c.setAttribute('aria-hidden', 'true');
                c.dataset.originalIndex = el.dataset.originalIndex;
                return c;
            });

            var tail = originals.slice(originals.length - cloneCount).map(function (el) {
                var c = el.cloneNode(true);
                c.classList.add('is-clone');
                c.setAttribute('aria-hidden', 'true');
                c.dataset.originalIndex = el.dataset.originalIndex;
                return c;
            });

            // Prepend tail clones, append head clones.
            tail.forEach(function (c) { $track.get(0).insertBefore(c, $track.get(0).firstChild); });
            head.forEach(function (c) { $track.get(0).appendChild(c); });

            $track.data('thumbsLoopReady', true);
        }

        $items = $track.find('.portfolio-thumbs__item');
        var originalCount = $items.not('.is-clone').length;
        var cloneCount = Math.min(visibleCount, originalCount);

        // Start at the first original item (after prepended clones).
        var index = cloneCount;
        var currentOriginalIndex = 0;

        function normalizeOriginalIndex(originalIndex) {
            var next = parseInt(originalIndex, 10);
            if (isNaN(next)) next = 0;
            if (!originalCount) return 0;
            next = ((next % originalCount) + originalCount) % originalCount;
            return next;
        }

        function selectOriginal(originalIndex) {
            if (originalIndex == null) return;

            // Highlight all items (original + clones) that point to the same original index.
            $items.removeClass('is-active');
            $items.filter('[data-original-index="' + originalIndex + '"]').addClass('is-active');

            var $original = $items.not('.is-clone').filter('[data-original-index="' + originalIndex + '"]').first();
            if (!$original.length) return;

            var full = $original.attr('href') || '';
            var thumb = $original.data('thumb') || $original.find('img').attr('src') || '';
            var caption = $original.data('caption') || $original.attr('aria-label') || '';

            if ($mainLink.length) {
                $mainLink.attr('href', full);
                $mainLink.attr('data-caption', caption);
            }
            if ($mainImg.length) {
                $mainImg.attr('src', thumb);
                $mainImg.attr('alt', caption);
            }
            if ($mainCaption.length) {
                $mainCaption.text(caption);
            }
        }

        function goToOriginal(originalIndex, animate) {
            currentOriginalIndex = normalizeOriginalIndex(originalIndex);
            selectOriginal(currentOriginalIndex);
            index = cloneCount + currentOriginalIndex;
            render(animate !== false);
        }

        function itemStepPx() {
            var first = $items.get(0);
            var second = $items.get(1);
            if (!first || !second) return 0;
            return Math.round(second.offsetLeft - first.offsetLeft);
        }

        function setTransition(enabled) {
            var el = $track.get(0);
            if (!el) return;
            el.style.transition = enabled ? 'transform 350ms ease' : 'none';
        }

        function render(animate) {
            setTransition(animate !== false);
            var step = itemStepPx();
            var offset = step * index;
            $track.get(0).style.setProperty('--thumbs-offset', offset + 'px');
            $prev.prop('disabled', false);
            $next.prop('disabled', false);

            // Seamless jump when reaching clone zones.
            if (index < cloneCount) {
                setTimeout(function () {
                    index += originalCount;
                    render(false);
                }, 360);
            } else if (index >= cloneCount + originalCount) {
                setTimeout(function () {
                    index -= originalCount;
                    render(false);
                }, 360);
            }
        }

        $items.on('click', function (e) {
            e.preventDefault();
            var originalIndex = this.dataset.originalIndex;
            if (typeof originalIndex === 'undefined') return;
            goToOriginal(originalIndex, true);
        });

        $prev.on('click', function () {
            goToOriginal(currentOriginalIndex - 1, true);
        });

        $next.on('click', function () {
            goToOriginal(currentOriginalIndex + 1, true);
        });

        if ($mainFrame.length) {
            var dragState = null;
            var dragThreshold = 36;
            var clickCancelThreshold = 8;

            function getPoint(event) {
                if (event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length) {
                    return event.originalEvent.touches[0];
                }
                if (event.originalEvent && event.originalEvent.changedTouches && event.originalEvent.changedTouches.length) {
                    return event.originalEvent.changedTouches[0];
                }
                return event;
            }

            function startDrag(event) {
                var point = getPoint(event);
                dragState = {
                    startX: point.clientX,
                    startY: point.clientY,
                    moved: false,
                    swiped: false
                };
                $mainFrame.addClass('is-dragging');
            }

            function moveDrag(event) {
                if (!dragState) return;
                var point = getPoint(event);
                var deltaX = point.clientX - dragState.startX;
                var deltaY = point.clientY - dragState.startY;

                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > clickCancelThreshold) {
                    dragState.moved = true;
                    if (event.cancelable) event.preventDefault();
                }

                if (!dragState.swiped && Math.abs(deltaX) >= dragThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
                    dragState.swiped = true;
                    if (deltaX < 0) {
                        goToOriginal(currentOriginalIndex + 1, true);
                    } else {
                        goToOriginal(currentOriginalIndex - 1, true);
                    }
                }
            }

            function endDrag() {
                if (!dragState) return;
                if (dragState.moved || dragState.swiped) {
                    $mainLink.data('cancelClickOnce', true);
                }
                dragState = null;
                $mainFrame.removeClass('is-dragging');
            }

            $mainFrame.on('mousedown touchstart', startDrag);
            $(document).on('mousemove.portfolioMainSwipe', moveDrag);
            $(document).on('mouseup.portfolioMainSwipe touchend.portfolioMainSwipe touchcancel.portfolioMainSwipe', endDrag);

            $mainLink.on('click', function (event) {
                if ($mainLink.data('cancelClickOnce')) {
                    event.preventDefault();
                    $mainLink.removeData('cancelClickOnce');
                    return;
                }

                if (window.jQuery && $.fancybox && photos && photos.length) {
                    event.preventDefault();
                    $.fancybox.open(
                        photos.map(function (photo) {
                            return {
                                src: photo.src,
                                opts: {
                                    caption: photo.caption
                                }
                            };
                        }),
                        {
                            loop: true,
                            hash: null,
                            animationEffect: 'fade'
                        },
                        currentOriginalIndex
                    );
                }
            });
        }

        $(window).on('resize', function () {
            render(false);
        });

        var $initial = $items.not('.is-clone').filter('.is-active').first();
        if (!$initial.length) {
            $initial = $items.not('.is-clone').first();
        }
        var initIdx = $initial.get(0) ? ($initial.get(0).dataset.originalIndex || '0') : '0';
        goToOriginal(initIdx, false);
    }

    $(function () {
        $('.portfolio-thumbs').each(function () {
            initThumbs($(this));
        });
    });
})();

// Custom Portfolio OWL
$('.ini-customNextBtn').click(function () {
    var owl = $('.team-classic.owl-team');
    owl.owlCarousel();
    owl.trigger('next.owl.carousel');
});
$('.ini-customPrevBtn').click(function () {
    var owl = $('.team-classic.owl-team');
    owl.owlCarousel();
    owl.trigger('prev.owl.carousel', [300]);
});

/*===================================
    YouTube audio (contact icons)
====================================== */

(function () {
    var VIDEO_ID = 'SNkt7GjmBEU';
    var BAR_TITLE = '家族音樂';

    var player = null;
    var tick = null;
    var ready = false;

    function formatTime(seconds) {
        var s = Math.max(0, Math.floor(seconds || 0));
        var m = Math.floor(s / 60);
        var r = s % 60;
        return m + ':' + (r < 10 ? '0' + r : r);
    }

    function showBar($bar) {
        $bar.prop('hidden', false);
    }

    function hideBar($bar) {
        $bar.prop('hidden', true);
    }

    function clearTick() {
        if (tick) {
            window.clearInterval(tick);
            tick = null;
        }
    }

    function startTick($range, $current, $duration) {
        clearTick();
        tick = window.setInterval(function () {
            if (!player || typeof player.getDuration !== 'function') return;
            var dur = player.getDuration() || 0;
            var cur = player.getCurrentTime ? player.getCurrentTime() : 0;
            if (dur > 0) {
                var ratio = cur / dur;
                $range.val(String(Math.round(ratio * 1000)));
            } else {
                $range.val('0');
            }
            $current.text(formatTime(cur));
            $duration.text(formatTime(dur));
        }, 250);
    }

    function ensurePlayer() {
        if (player || !window.YT || !window.YT.Player) return;
        player = new window.YT.Player('yt-audio-player', {
            height: '0',
            width: '0',
            videoId: VIDEO_ID,
            playerVars: {
                autoplay: 0,
                controls: 0,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                playsinline: 1,
                iv_load_policy: 3,
            },
            events: {
                onReady: function () {
                    ready = true;
                },
                onStateChange: function (e) {
                    if (!e || typeof e.data === 'undefined') return;
                    // 0 ended, 1 playing, 2 paused
                    if (e.data === 0) {
                        // ended => stop UI
                        $('#yt-audio-trigger').attr('aria-pressed', 'false');
                        hideBar($('#yt-audio-bar'));
                        clearTick();
                    }
                },
            },
        });
    }

    // Hook YouTube IFrame API ready (chain-safe)
    var prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
        try {
            if (typeof prevReady === 'function') prevReady();
        } catch (e) {}
        ensurePlayer();
    };

    $(function () {
        var $btn = $('#yt-audio-trigger');
        var $bar = $('#yt-audio-bar');
        var $barToggle = $('#yt-audio-bar-toggle');
        var $range = $('#yt-audio-bar-range');
        var $current = $('#yt-audio-bar-current');
        var $duration = $('#yt-audio-bar-duration');
        var $title = $('#yt-audio-bar-title');

        if ($title.length) $title.text(BAR_TITLE);

        if (!$btn.length || !$bar.length || !$barToggle.length || !$range.length) return;

        function isPlaying() {
            if (!player || typeof player.getPlayerState !== 'function') return false;
            return player.getPlayerState() === 1;
        }

        function play() {
            ensurePlayer();
            if (!player || !ready) return;
            showBar($bar);
            $btn.attr('aria-pressed', 'true');
            player.playVideo();
            startTick($range, $current, $duration);
        }

        function stop() {
            if (!player || !ready) {
                $btn.attr('aria-pressed', 'false');
                hideBar($bar);
                clearTick();
                $range.val('0');
                $current.text('0:00');
                $duration.text('0:00');
                return;
            }
            player.stopVideo();
            $btn.attr('aria-pressed', 'false');
            hideBar($bar);
            clearTick();
            $range.val('0');
            $current.text('0:00');
            $duration.text('0:00');
        }

        $btn.on('click', function () {
            if (isPlaying()) {
                stop();
            } else {
                play();
            }
        });

        $barToggle.on('click', function () {
            stop();
        });

        $range.on('input', function () {
            if (!player || !ready) return;
            var dur = player.getDuration ? player.getDuration() : 0;
            if (!dur) return;
            var value = parseInt($range.val(), 10) || 0;
            var t = (value / 1000) * dur;
            player.seekTo(t, true);
        });

        // If API already loaded before this script ran
        ensurePlayer();
    });
})();

/* ===================================
        Mouse parallax
 ====================================== */

if ($(window).width() > 991) {
    $('#home-banner').mousemove(function(e) {
        $('[data-depth]').each(function () {
            var depth = $(this).data('depth');
            var amountMovedX = (e.pageX * -depth/4);
            var amountMovedY = (e.pageY * -depth/4);

            $(this).css({
                'transform':'translate3d(' + amountMovedX +'px,' + amountMovedY +'px, 0)',
            });
        });
    });
}

/* ===================================
        Fancy Box
====================================== */

$('[data-fancybox]').fancybox({
    protect: true,
    animationEffect: "fade",
    hash: null,
});

/* ===================================
        Animated Cursor
====================================== */

function animatedCursor() {

    if ($("#animated-cursor").length) {

        var e = {x: 0, y: 0}, t = {x: 0, y: 0}, n = .25, o = !1, a =    document.getElementById("cursor"),
            i = document.getElementById("cursor-loader");
        TweenLite.set(a, {xPercent: -50, yPercent: -50}), document.addEventListener("mousemove", function (t) {
            var n = window.pageYOffset || document.documentElement.scrollTop;
            e.x = t.pageX, e.y = t.pageY - n
        }), TweenLite.ticker.addEventListener("tick", function () {
            o || (t.x += (e.x - t.x) * n, t.y += (e.y - t.y) * n, TweenLite.set(a, {x: t.x, y: t.y}))
        }),
            $(".animated-wrap").mouseenter(function (e) {
                TweenMax.to(this, .3, {scale: 2}), TweenMax.to(a, .3, {
                    scale: 2,
                    borderWidth: "1px",
                    opacity: .2
                }), TweenMax.to(i, .3, {
                    scale: 2,
                    borderWidth: "1px",
                    top: 1,
                    left: 1
                }), TweenMax.to($(this).children(), .3, {scale: .5}), o = !0
            }),
            $(".animated-wrap").mouseleave(function (e) {
                TweenMax.to(this, .3, {scale: 1}), TweenMax.to(a, .3, {
                    scale: 1,
                    borderWidth: "2px",
                    opacity: 1
                }), TweenMax.to(i, .3, {
                    scale: 1,
                    borderWidth: "2px",
                    top: 0,
                    left: 0
                }), TweenMax.to($(this).children(), .3, {scale: 1, x: 0, y: 0}), o = !1
            }),

            $(".testimonial-images .animated-wrap").mouseenter(function (e) {
                TweenMax.to(this, .3, {scale: 2}), TweenMax.to(a, .3, {
                    scale: 2,
                    borderWidth: "1px",
                    opacity: .2
                }), TweenMax.to(i, .3, {
                    scale: 2,
                    borderWidth: "1px",
                    top: 1,
                    left: 1
                }), TweenMax.to($(this).children(), .3, {scale: .5}), o = !0
            }),

            $(".animated-wrap").mousemove(function (e) {
                var n, o, i, l, r, d, c, s, p, h, x, u, w, f, m;
                n = e, o = 2, i = this.getBoundingClientRect(), l = n.pageX - i.left, r = n.pageY - i.top, d = window.pageYOffset || document.documentElement.scrollTop, t.x = i.left + i.width / 2 + (l - i.width / 2) / o, t.y = i.top + i.height / 2 + (r - i.height / 2 - d) / o, TweenMax.to(a, .3, {
                    x: t.x,
                    y: t.y
                }), s = e, p = c = this, h = c.querySelector(".animated-element"), x = 20, u = p.getBoundingClientRect(), w = s.pageX - u.left, f = s.pageY - u.top, m = window.pageYOffset || document.documentElement.scrollTop, TweenMax.to(h, .3, {
                    x: (w - u.width / 2) / u.width * x,
                    y: (f - u.height / 2 - m) / u.height * x,
                    ease: Power2.easeOut
                })
            }),
            $(".hide-cursor,.btn,.tp-bullets").mouseenter(function (e) {
                TweenMax.to("#cursor", .2, {borderWidth: "1px", scale: 2, opacity: 0})
            }), $(".hide-cursor,.btn,.tp-bullets").mouseleave(function (e) {
            TweenMax.to("#cursor", .3, {borderWidth: "2px", scale: 1, opacity: 1})
        }),$(".link").mouseenter(function (e) {
            TweenMax.to("#cursor", .2, {
                borderWidth: "0px",
                scale: 3,
                backgroundColor: "rgba(5,5,5,0.27)",
                opacity: .15
            })
        }), $(".link").mouseleave(function (e) {
            TweenMax.to("#cursor", .3, {
                borderWidth: "2px",
                scale: 1,
                backgroundColor: "rgba(12,12,12,0)",
                opacity: 1
            })
        })
    }
}

if ($(window).width() > 991) {
    setTimeout(function () {
        animatedCursor();
    }, 1000);
}

/*===================================
    Home banner image loop (SVG image)
====================================== */

(function () {
    var paths = [
        'static/image/slider-img0.png',
        'static/image/slider-img.png',
        'static/image/slider-img01.png',
        'static/image/slider-img02.png',
    ];

    function setSvgImageHref(el, href) {
        if (!el) return;
        el.setAttribute('href', href);
        el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
    }

    function preloadBannerImages(list) {
        list.forEach(function (src) {
            try {
                var img = new Image();
                img.decoding = 'async';
                img.src = src;
            } catch (e) {}
        });
    }

    $(function () {
        var elA = document.getElementById('banner-slider-img');
        if (!elA) return;
        if (elA.dataset.loopReady === 'true') return;
        elA.dataset.loopReady = 'true';

        preloadBannerImages(paths);

        var elB = document.getElementById('banner-slider-img-2');
        if (!elB) {
            try {
                elB = elA.cloneNode(true);
                elB.setAttribute('id', 'banner-slider-img-2');
                elB.removeAttribute('data-loop-ready');
                if (elA.parentNode) {
                    elA.parentNode.appendChild(elB);
                }
            } catch (e) {
                elB = null;
            }
        }

        var front = elA;
        var back = elB || elA;
        var index = 0;
        var intervalMs = 3200;
        var fadeMs = 450;
        var isAnimating = false;
        var timerId = null;

        function scheduleNext() {
            if (timerId) {
                window.clearTimeout(timerId);
            }
            timerId = window.setTimeout(next, intervalMs);
        }

        function next() {
            if (document.hidden) {
                scheduleNext();
                return;
            }
            if (isAnimating) {
                scheduleNext();
                return;
            }

            isAnimating = true;
            index = (index + 1) % paths.length;
            try { back.style.opacity = '0'; } catch (e) {}
            setSvgImageHref(back, paths[index]);

            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    try { front.style.opacity = '0'; } catch (e) {}
                    try { back.style.opacity = '1'; } catch (e) {}

                    window.setTimeout(function () {
                        var tmp = front;
                        front = back;
                        back = tmp;
                        isAnimating = false;
                        scheduleNext();
                    }, Math.max(0, fadeMs + 40));
                });
            });
        }

        setSvgImageHref(front, paths[0]);
        try { front.style.opacity = '1'; } catch (e) {}
        if (back && back !== front) {
            try { back.style.opacity = '0'; } catch (e) {}
        }

        document.addEventListener('visibilitychange', function () {
            if (!document.hidden && !isAnimating) {
                scheduleNext();
            }
        });

        scheduleNext();
    });
})();



















