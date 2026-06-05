$(function () {
    var $infoModal = $('#genealogy-info-modal');
    var $infoTrigger = $('#genealogy-info-trigger');

    function cloneTemplate(templateId) {
        var template = document.getElementById(templateId);
        if (!template || !('content' in template)) {
            return null;
        }

        return $(template.content.cloneNode(true));
    }

    function initGenealogyTree($tree) {
        $tree.find('ul').hide();
        $tree.children('ul').show();
        $tree.find('ul.active').hide();
    }

    function centerGenealogyBody($body) {
        var el = $body && $body.length ? $body.get(0) : null;
        if (!el) {
            return;
        }

        requestAnimationFrame(function () {
            var isMobile = window.matchMedia && window.matchMedia('(max-width: 767.98px)').matches;
            var $panel = $body.closest('[data-genealogy-panel]');
            // Mobile UX: when viewing ancestor tree and it's collapsed, center the first prestack card (一世).
            if (isMobile && $panel.is('#genealogy-panel-maternal') && !$panel.hasClass('is-expanded')) {
                var wrapper0 = el.closest ? el.closest('.ancestor-scroll') : null;
                var scroller0 = wrapper0 || el;
                var target0 = $panel.find('.ancestor-prestack .member-details[data-ancestor-gen="1"]').get(0);
                if (!target0) {
                    scroller0.scrollLeft = 0;
                    return;
                }

                var scRect = scroller0.getBoundingClientRect ? scroller0.getBoundingClientRect() : null;
                var tRect = target0.getBoundingClientRect ? target0.getBoundingClientRect() : null;
                var max0 = scroller0.scrollWidth - scroller0.clientWidth;
                if (!scRect || !tRect || max0 <= 0) {
                    scroller0.scrollLeft = 0;
                    return;
                }

                var targetCenter = (tRect.left - scRect.left) + (tRect.width / 2);
                var desired = scroller0.scrollLeft + targetCenter - (scroller0.clientWidth / 2);
                scroller0.scrollLeft = Math.max(0, Math.min(max0, Math.floor(desired)));
                return;
            }

            // Prefer centering the actual horizontal scroller.
            // Ancestor view uses a wrapper (.ancestor-scroll) as the overflow-x container.
            var scroller = el;
            var maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
            if (maxScrollLeft <= 0) {
                var wrapper = el.closest ? el.closest('.ancestor-scroll') : null;
                if (wrapper) {
                    scroller = wrapper;
                    maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
                }
            }

            if (maxScrollLeft <= 0) return;
            scroller.scrollLeft = Math.max(0, Math.floor(maxScrollLeft / 2));
        });
    }

    function showTreeChildren($children) {
        $children
            .stop(true, true)
            .slideDown('fast', function () {
                $(this).css('display', 'flex');
            })
            .addClass('active');
    }

    function hideTreeChildren($children) {
        $children
            .stop(true, true)
            .slideUp('fast')
            .removeClass('active');
    }

    function keepGenealogyNodeCentered($node, opts) {
        var nodeEl = $node && $node.length ? $node.get(0) : null;
        if (!nodeEl) {
            return;
        }

        var $body = $node.closest('.genealogy-body');
        var bodyEl = $body.length ? $body.get(0) : null;
        if (!bodyEl) {
            return;
        }

        opts = opts || {};
        var mobileView = window.matchMedia && window.matchMedia('(max-width: 991.98px)').matches;
        var activeAnim = bodyEl.__genealogyCenterAnim || null;
        if (activeAnim && typeof cancelAnimationFrame === 'function') {
            cancelAnimationFrame(activeAnim);
            bodyEl.__genealogyCenterAnim = null;
        }

        function computeTargetScrollLeft() {
            var bodyRect = bodyEl.getBoundingClientRect();
            var nodeRect = nodeEl.getBoundingClientRect();

            var bodyCenter = bodyRect.left + bodyRect.width / 2;
            var nodeCenter = nodeRect.left + nodeRect.width / 2;
            var delta = nodeCenter - bodyCenter;

            if (!Number.isFinite(delta) || Math.abs(delta) < 1) {
                return null;
            }

            var maxScroll = Math.max(0, bodyEl.scrollWidth - bodyEl.clientWidth);
            var next = bodyEl.scrollLeft + delta;
            return Math.max(0, Math.min(maxScroll, next));
        }

        function animateScrollTo(target, duration) {
            if (target == null) {
                return;
            }

            if (!mobileView) {
                bodyEl.scrollLeft = target;
                return;
            }

            var start = bodyEl.scrollLeft;
            var delta = target - start;
            if (!Number.isFinite(delta) || Math.abs(delta) < 1) {
                bodyEl.scrollLeft = target;
                return;
            }

            duration = duration || 260;
            var startTs = null;

            function easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            function step(ts) {
                if (startTs == null) {
                    startTs = ts;
                }

                var p = Math.min(1, (ts - startTs) / duration);
                var eased = easeInOutCubic(p);
                bodyEl.scrollLeft = start + delta * eased;

                if (p < 1) {
                    bodyEl.__genealogyCenterAnim = requestAnimationFrame(step);
                } else {
                    bodyEl.__genealogyCenterAnim = null;
                }
            }

            bodyEl.__genealogyCenterAnim = requestAnimationFrame(step);
        }

        function runCentering(retriesLeft) {
            var target = computeTargetScrollLeft();
            if (target == null) {
                if (retriesLeft > 0) {
                    setTimeout(function () { runCentering(retriesLeft - 1); }, 60);
                }
                return;
            }

            animateScrollTo(target);
        }

        // Wait until slide animation settles, then center (mobile animates; desktop snaps).
        setTimeout(function () {
            requestAnimationFrame(function () {
                runCentering(8);
            });
        }, mobileView ? 220 : 0);
    }

    function showAllTreeDescendants($node) {
        $node.find('ul').each(function () {
            showTreeChildren($(this));
        });
    }

    function hideAllTreeDescendants($node) {
        $node.find('ul').each(function () {
            hideTreeChildren($(this));
        });
    }

    function ensureGenealogyTreeContent($content) {
        if (!$content || !$content.length) {
            return null;
        }

        if (!$content.find('.genealogy-tree').length) {
            return null;
        }

        return $content;
    }
    function formatAncestorCouples($root) {
        $root.find('.member-details h3').each(function () {
            var $title = $(this);
            var rawText = $title.text().trim();

            if (!rawText) {
                return;
            }

            // Support both half-width & and full-width ＆
            if (rawText.indexOf('&') === -1 && rawText.indexOf('＆') === -1) {
                return;
            }

            var parts = rawText
                .split(/[&＆]/)
                .map(function (p) { return p.trim(); })
                .filter(Boolean);

            if (parts.length !== 2) {
                return;
            }

            $title
                .addClass('ancestor-pair')
                .empty()
                .append($('<span/>', { 'class': 'ancestor-vertical-name', text: parts[0] }))
                .append($('<span/>', { 'class': 'ancestor-vertical-name', text: parts[1] }));
        });
    }

    function renderFamilyTree() {
        var $panel = $('#genealogy-panel-paternal');
        var $content = ensureGenealogyTreeContent(cloneTemplate('genealogy-tree-family-template'));

        if (!$panel.length || !$content) {
            return;
        }

        $panel.empty().append($content);
        initGenealogyTree($panel.find('.genealogy-tree').first());
        centerGenealogyBody($panel.find('.genealogy-body').first());
    }

    function renderAncestorTree() {
        var $panel = $('#genealogy-panel-maternal');
        var $content = ensureGenealogyTreeContent(cloneTemplate('genealogy-tree-ancestor-template'));

        if (!$panel.length || !$content) {
            return;
        }

        $content.find('img').remove();
        $content.find('.genealogy-tree').addClass('genealogy-tree--ancestor');
        // Ancestor view is horizontal (left-to-right), so do not apply vertical couple formatting.

        // Highlight specific ancestor nodes (requested custom background colors)
        $content.find('.member-details h3').each(function () {
            var text = ($(this).text() || '').replace(/\s+/g, '');
            if (text.indexOf('邱阿公') !== -1 || text.indexOf('黃阿嬤') !== -1) {
                $(this).closest('.member-details').addClass('ancestor-highlight-bg');
            }
        });

        var lifeKeySeq = 0;

        // Merge note bubble text into fields under the name, and remove the bubble UI.
        $content.find('.member-details').each(function () {
            var $details = $(this);
            var $h3 = $details.find('h3').first();
            if (!$h3.length) return;
            var $arrow = $details.find('.ancestor-arrow-inside').first();

            // Generation tag:
            // - Pre-stacked ancestors (above 鄭阿扁) are authored in the template with data-ancestor-gen="1..5"
            // - All actual tree nodes (including 鄭阿扁/邱溪/邱大哥/邱二哥/邱阿公) default to data-ancestor-gen="6"
            if (!$details.attr('data-ancestor-gen')) {
                $details.attr('data-ancestor-gen', '6');
            }

            var rawName = ($h3.text() || '').trim();
            var parts = rawName.split(/[&＆]/).map(function (s) { return (s || '').trim(); }).filter(Boolean);
            var nameOnly = parts.length ? parts[0] : rawName;
            var spouse = parts.length > 1 ? parts.slice(1).join('＆') : '';
            $h3.text(nameOnly);
            $h3.toggleClass('ancestor-name-nowrap', nameOnly === '鄭賴阿金');

            var noteText = $details.find('.ancestor-note__bubble').first().text();
            noteText = (noteText || '').replace(/\s+/g, ' ').trim();

            var origin = '';
            var life = noteText;
            if (noteText) {
                // Try to extract 籍貫 from the leading text.
                // 1) Preferred: leading "X籍"
                var m = noteText.match(/^(.{1,12}?籍)/);
                if (m && m[1]) {
                    origin = m[1];
                    life = noteText.slice(m[1].length);
                    life = life.replace(/^[，,;；、\s]+/, '').trim();
                } else {
                    // 2) Fallback: allow other wording (not limited to "福建籍").
                    // If the first segment looks like a place (contains common location suffixes),
                    // treat it as 籍貫 and allow the rest to be collapsible "生平".
                    var segs = noteText.split(/[，,;；、]/);
                    var firstSeg = (segs[0] || '').trim();
                    var rest = segs.slice(1).join('，').trim();
                    if (
                        firstSeg &&
                        firstSeg.length <= 24 &&
                        /(省|市|縣|郡|鄉|鎮|里|庄|村|區|州)$/.test(firstSeg)
                    ) {
                        origin = firstSeg;
                        life = rest;
                    }
                }
            }

            // Normalize 籍貫 wording for display (e.g., 福建籍 -> 福建省)
            var originDisplay = origin;
            if (originDisplay && /籍$/.test(originDisplay)) {
                var base = originDisplay.replace(/籍$/, '');
                if (base && !/(省|市|縣|區|鄉|鎮|里)$/.test(base)) {
                    originDisplay = base + '省';
                } else {
                    originDisplay = base;
                }
            }

            // Rebuild inline info block (順序：配偶、籍貫、生平；生平需點選▼展開)
            $details.find('.ancestor-note-inline').remove();
            $details.find('.ancestor-life-toggle, .ancestor-life-content').remove();

            var wrap = document.createElement('div');
            wrap.className = 'ancestor-note-inline';

            function addRow(label, value, extraClass) {
                if (!value) return;
                var row = document.createElement('div');
                row.className = 'ancestor-note-row';
                if (extraClass) row.className += ' ' + extraClass;
                var k = document.createElement('span');
                k.className = 'k';
                k.textContent = label;
                var v = document.createElement('span');
                v.className = 'v';
                v.textContent = String(value);
                row.appendChild(k);
                row.appendChild(v);
                wrap.appendChild(row);
                return { row: row, k: k, v: v };
            }

            var ancestorGen = $details.attr('data-ancestor-gen');
            if (ancestorGen !== '6') {
                addRow('配偶：', spouse, 'ancestor-note-row--spouse');
            }
            var originRow = addRow('籍貫：', originDisplay, 'ancestor-note-row--origin');

            if (life) {
                lifeKeySeq += 1;
                $details.attr('data-life-key', String(lifeKeySeq));
                if (originRow && originRow.v) {
                    var btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'ancestor-life-toggle';
                    btn.setAttribute('aria-expanded', 'false');
                    btn.setAttribute('aria-label', '展開生平');
                    btn.setAttribute('data-life-key', String(lifeKeySeq));
                    btn.textContent = '▼';
                    originRow.v.appendChild(document.createTextNode(' '));
                    originRow.v.appendChild(btn);
                }

                var lifeBlock = document.createElement('div');
                lifeBlock.className = 'ancestor-life-block';

                var rowLife = document.createElement('div');
                rowLife.className = 'ancestor-note-row ancestor-note-row--life';
                var kLife = document.createElement('span');
                kLife.className = 'k';
                kLife.textContent = '生平：';
                var vLife = document.createElement('span');
                vLife.className = 'v';
                rowLife.appendChild(kLife);
                rowLife.appendChild(vLife);
                lifeBlock.appendChild(rowLife);

                var lifeEl = document.createElement('div');
                lifeEl.className = 'ancestor-life-content';
                if (window.matchMedia && window.matchMedia('(max-width: 767.98px)').matches) {
                    var chars = Array.from(String(life));
                    for (var i = 0; i < chars.length; i++) {
                        if (i > 0 && i % 8 === 0) {
                            lifeEl.appendChild(document.createElement('br'));
                        }
                        lifeEl.appendChild(document.createTextNode(chars[i]));
                    }
                } else {
                    lifeEl.textContent = life;
                }
                lifeBlock.appendChild(lifeEl);

                wrap.appendChild(lifeBlock);
            }

            if (wrap.childNodes.length) {
                $details.append(wrap);
            }

            $details.find('.ancestor-note').remove();
        });

        $panel.empty().append($content);
        $panel.find('.genealogy-tree').each(function () {
            initGenealogyTree($(this));
        });
        centerGenealogyBody($panel.find('.genealogy-body').first());
    }

    function setupGenealogyZoom() {
        var $controls = $('#genealogy-zoom-controls');
        if (!$controls.length) return;

        var aboutEl = document.getElementById('about');

        function isAboutActive() {
            var bodyClass = (document.body && typeof document.body.className === 'string') ? document.body.className : '';

            // Pagepiling mode: rely on body class only (sections are absolutely positioned and can "intersect" even when not visible).
            if (document.querySelector('.pp-section')) {
                return /\bpp-viewing-about\b/.test(bodyClass);
            }

            // Scroll mode: check viewport intersection.
            if (!aboutEl) return false;
            var rect = aboutEl.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < window.innerHeight;
        }

        function updateControlsVisibility() {
            // Show on all viewports when About is visible/active
            $controls.prop('hidden', !isAboutActive());
        }

        updateControlsVisibility();

        function getActivePanel() {
            return $('[data-genealogy-panel].is-active').first();
        }

        function clamp(v, min, max) {
            return Math.max(min, Math.min(max, v));
        }

        function applyScale($panel, scale) {
            if (!$panel || !$panel.length) return;
            var $trees = $panel.find('.genealogy-tree');
            if (!$trees.length) return;

            // Use the actual horizontal scroller for ratio preservation.
            var $scroller = $panel.is('#genealogy-panel-maternal')
                ? $panel.find('.ancestor-scroll').first()
                : $panel.find('.genealogy-body').first();
            var bodyEl = $scroller.length ? $scroller.get(0) : null;
            var beforeMaxScroll = bodyEl ? Math.max(0, bodyEl.scrollWidth - bodyEl.clientWidth) : 0;
            var beforeRatio = bodyEl && beforeMaxScroll > 0 ? (bodyEl.scrollLeft / beforeMaxScroll) : null;

            // Store per-panel scale
            $panel.attr('data-zoom', String(scale));

            // Prefer CSS zoom (affects layout/scroll); fallback to transform for browsers that don't support it.
            var firstTreeEl = $trees.first().get(0);
            var supportsZoom = firstTreeEl && typeof firstTreeEl.style.zoom !== 'undefined';
            $trees.each(function () {
                var treeEl = this;
                if (!treeEl || !treeEl.style) return;
                if (supportsZoom) {
                    treeEl.style.zoom = String(scale);
                    treeEl.style.transform = '';
                    treeEl.style.transformOrigin = '';
                } else {
                    treeEl.style.zoom = '';
                    treeEl.style.transformOrigin = '0 0';
                    treeEl.style.transform = 'scale(' + scale + ')';
                }
            });

            // Preserve horizontal scroll position proportionally (avoid jumping during pinch/zoom)
            if (bodyEl && beforeRatio != null) {
                requestAnimationFrame(function () {
                    var afterMax = Math.max(0, bodyEl.scrollWidth - bodyEl.clientWidth);
                    bodyEl.scrollLeft = afterMax > 0 ? Math.round(afterMax * beforeRatio) : 0;
                });
            } else {
                centerGenealogyBody($panel.find('.genealogy-body').first());
            }
        }

        function getScale($panel) {
            var raw = $panel && $panel.length ? parseFloat($panel.attr('data-zoom')) : NaN;
            return Number.isFinite(raw) ? raw : 1;
        }

        $(window).on('resize', function () {
            updateControlsVisibility();
        });

        // Tab switching should also toggle controls visibility.
        $(document).on('click', '[data-genealogy-tab]', function () {
            // allow DOM state to update
            setTimeout(updateControlsVisibility, 0);
        });

        // Keep controls hidden when user scrolls away from About on mobile.
        if (aboutEl && 'IntersectionObserver' in window) {
            try {
                var obs = new IntersectionObserver(function () {
                    updateControlsVisibility();
                }, { root: null, threshold: 0.01 });
                obs.observe(aboutEl);
            } catch (e) {}
        } else {
            $(window).on('scroll', function () {
                updateControlsVisibility();
            });
        }

        // Pagepiling mode: observe body class changes (pp-viewing-*) to toggle controls immediately.
        if ('MutationObserver' in window && document.body) {
            try {
                var bodyObs = new MutationObserver(function () {
                    updateControlsVisibility();
                });
                bodyObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
            } catch (e) {}
        }

        $controls.off('click.genealogyZoom').on('click.genealogyZoom', '[data-zoom-action]', function () {
            var $panel = getActivePanel();
            if (!$panel.length) return;

            var action = $(this).data('zoomAction');
            var scale = getScale($panel);
            var next = scale;

            if (action === 'in') next = scale + 0.1;
            if (action === 'out') next = scale - 0.1;
            if (action === 'reset') next = 1;

            next = Math.round(clamp(next, 0.4, 1.6) * 10) / 10;
            applyScale($panel, next);
        });

        // Pinch-to-zoom (two-finger) on mobile/iPad, synced with the same scale state.
        (function () {
            var pinchActive = false;
            var startDist = 0;
            var startScale = 1;
            var $pinchPanel = null;

            function dist(t1, t2) {
                var dx = (t2.clientX - t1.clientX);
                var dy = (t2.clientY - t1.clientY);
                return Math.sqrt(dx * dx + dy * dy);
            }

            function panelFromEventTarget(target) {
                if (!target) return null;
                var el = target.closest ? target.closest('[data-genealogy-panel]') : null;
                return el ? $(el) : getActivePanel();
            }

            function onTouchStart(e) {
                if (!e || !e.touches || e.touches.length !== 2) return;
                $pinchPanel = panelFromEventTarget(e.target);
                if (!$pinchPanel || !$pinchPanel.length) return;

                pinchActive = true;
                startDist = dist(e.touches[0], e.touches[1]);
                startScale = getScale($pinchPanel);
            }

            function onTouchMove(e) {
                if (!pinchActive || !$pinchPanel || !$pinchPanel.length) return;
                if (!e || !e.touches || e.touches.length !== 2) return;

                // Prevent page scroll while pinching
                if (typeof e.preventDefault === 'function') e.preventDefault();

                var d = dist(e.touches[0], e.touches[1]);
                if (!d || !startDist) return;

                var next = startScale * (d / startDist);
                next = Math.round(clamp(next, 0.4, 1.6) * 100) / 100;
                applyScale($pinchPanel, next);
            }

            function onTouchEnd() {
                pinchActive = false;
                $pinchPanel = null;
            }

            // Attach to About only (both panels live inside)
            if (aboutEl && aboutEl.addEventListener) {
                // Need passive:false to allow preventDefault() on iOS
                aboutEl.addEventListener('touchstart', onTouchStart, { passive: true });
                aboutEl.addEventListener('touchmove', onTouchMove, { passive: false });
                aboutEl.addEventListener('touchend', onTouchEnd, { passive: true });
                aboutEl.addEventListener('touchcancel', onTouchEnd, { passive: true });
            }
        })();
    }

    function updateTreeOpenHint() {
        var $hint = $('#tree-open-hint');
        if (!$hint.length) return;

        var $activePanel = $('[data-genealogy-panel].is-active').first();
        var $tree = $activePanel.find('.genealogy-tree').first();
        if (!$tree.length) {
            $hint.removeClass('is-hidden');
            return;
        }

        // Use the root node's direct children visibility as the source of truth.
        // This avoids timing issues with slideUp/slideDown animations.
        // Maternal split: if either side is expanded, hide the hint.
        var $rootLi = $tree.children('ul').children('li').first();
        var $rootChildren = $rootLi.children('ul');
        var expanded = false;
        if ($activePanel.is('#genealogy-panel-maternal')) {
            $activePanel.find('.genealogy-tree').each(function () {
                var $rt = $(this);
                var $rtRoot = $rt.children('ul').children('li').first();
                var $rtChildren = $rtRoot.children('ul');
                if ($rtChildren.length && $rtChildren.is(':visible')) {
                    expanded = true;
                }
            });
        } else {
            expanded = $rootChildren.length ? $rootChildren.is(':visible') : false;
        }
        $hint.toggleClass('is-hidden', expanded);

        // Mark panel expanded/collapsed (used by desktop drag scroll + ancestor note visibility).
        $activePanel.toggleClass('is-expanded', expanded);
        if ($activePanel.is('#genealogy-panel-maternal')) {
            setupAncestorDragScroll();
        } else if ($activePanel.is('#genealogy-panel-paternal')) {
            setupPaternalDragScroll();
        }

        // Position hint midway between the root node (e.g. 邱阿公&黃阿嬤) and the viewport bottom (desktop + iPad only).
        var hintEl = $hint.get(0);
        if (!hintEl) return;
        // Avoid overlapping the stacked "一世" card in ancestor view (desktop/iPad only).
        if ($activePanel.is('#genealogy-panel-maternal')) {
            hintEl.style.setProperty('--tree-open-hint-shift', '56px');
        } else {
            hintEl.style.setProperty('--tree-open-hint-shift', '0px');
        }

        if (expanded) {
            hintEl.style.removeProperty('--tree-open-hint-top');
            hintEl.style.top = '';
            hintEl.style.bottom = '10px';
            return;
        }

        if (window.matchMedia && window.matchMedia('(min-width: 768px)').matches) {
            var wrapEl = document.querySelector('#about .genealogy-panel-wrap');
            var firstNodeEl = $rootLi.find('> a').get(0) || $rootLi.get(0);
            if (!wrapEl || !firstNodeEl) return;

        var wrapRect = wrapEl.getBoundingClientRect();
        var firstRect = firstNodeEl.getBoundingClientRect();

        // Convert viewport Y to wrap-local Y by subtracting wrapRect.top.
        // Use the visible part of the wrap for iPad sizes so the hint stays centered in the section.
        var visibleBottomViewportY = Math.min(window.innerHeight, wrapRect.bottom);

        var start = Math.max(0, firstRect.bottom - wrapRect.top);
        var viewportBottomLocal = Math.max(start, visibleBottomViewportY - wrapRect.top);
        var mid = start + (viewportBottomLocal - start) / 2;

        var isIpadLike = window.matchMedia && window.matchMedia('(min-width: 768px) and (max-width: 1279.98px)').matches;
        if (isIpadLike) {
            // iPad (both orientations): keep the hint centered within the about wrap.
            mid = wrapRect.height / 2;
        }

            // Clamp so the hint is fully visible inside the wrap (wrap has overflow hidden).
            var hintRect = hintEl.getBoundingClientRect();
            var hintHeight = hintRect && hintRect.height ? hintRect.height : 0;
            if (hintHeight > 0) {
                var half = hintHeight / 2;
                var maxY = Math.max(half, wrapRect.height - half);
                mid = Math.max(half, Math.min(maxY, mid));
            }

            hintEl.style.setProperty('--tree-open-hint-top', mid + 'px');
            hintEl.style.top = 'var(--tree-open-hint-top)';
            hintEl.style.bottom = 'auto';
        }
    }

    function setupAncestorDragScroll() {
        var isDesktop = window.matchMedia && window.matchMedia('(min-width: 992px)').matches;
        if (!isDesktop) return;

        var panel = document.getElementById('genealogy-panel-maternal');
        if (!panel) return;
        if (!panel.classList.contains('is-expanded')) return;

        var scroller = panel.querySelector('.ancestor-scroll');
        if (!scroller || scroller.__ancestorDragBound) return;
        scroller.__ancestorDragBound = true;

        var isDown = false;
        var startX = 0;
        var startY = 0;
        var startLeft = 0;
        var startTop = 0;
        var dragged = false;
        var suppressNextClick = false;

        function isInteractiveTarget(target) {
            if (!target) return false;
            return !!(target.closest && target.closest('a, button, input, textarea, select, label, .ancestor-arrow-inside, .ancestor-life-toggle'));
        }

        scroller.addEventListener('mousedown', function (e) {
            if (e.button !== 0) return;
            if (isInteractiveTarget(e.target)) return;

            var canScrollX = scroller.scrollWidth > scroller.clientWidth + 1;
            var canScrollY = scroller.scrollHeight > scroller.clientHeight + 1;
            if (!canScrollX && !canScrollY) return;

            e.preventDefault();
            isDown = true;
            dragged = false;
            suppressNextClick = false;
            startX = e.pageX;
            startY = e.pageY;
            startLeft = scroller.scrollLeft;
            startTop = scroller.scrollTop;
            scroller.classList.add('is-dragging');
        });

        window.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            var dx = e.pageX - startX;
            var dy = e.pageY - startY;
            if (!dragged && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
                dragged = true;
            }
            scroller.scrollLeft = startLeft - dx;
            scroller.scrollTop = startTop - dy;
        });

        window.addEventListener('mouseup', function () {
            if (!isDown) return;
            isDown = false;
            scroller.classList.remove('is-dragging');
            if (dragged) {
                suppressNextClick = true;
                // Clear on next tick (after click fires)
                setTimeout(function () { suppressNextClick = false; }, 0);
            }
            dragged = false;
        });

        // Prevent accidental click after drag (so nodes don't toggle)
        scroller.addEventListener('click', function (e) {
            if (isInteractiveTarget(e.target)) return;
            if (!suppressNextClick) return;
            e.preventDefault();
            e.stopPropagation();
        }, true);
    }

    function setupPaternalDragScroll() {
        var isDesktop = window.matchMedia && window.matchMedia('(min-width: 992px)').matches;
        if (!isDesktop) return;

        var panel = document.getElementById('genealogy-panel-paternal');
        if (!panel || !panel.classList.contains('is-expanded')) return;

        var scroller = panel.querySelector('.genealogy-body');
        if (!scroller || scroller.__paternalDragBound) return;
        scroller.__paternalDragBound = true;

        var isDown = false;
        var startX = 0;
        var startY = 0;
        var startLeft = 0;
        var startTop = 0;
        var dragged = false;
        var suppressNextClick = false;

        function isInteractiveTarget(target) {
            if (!target) return false;
            return !!(target.closest && target.closest('a, button, input, textarea, select, label, .ancestor-arrow-inside, .ancestor-life-toggle'));
        }

        scroller.classList.add('is-dragscroll');

        scroller.addEventListener('mousedown', function (e) {
            if (e.button !== 0) return;
            if (isInteractiveTarget(e.target)) return;

            var canScrollX = scroller.scrollWidth > scroller.clientWidth + 1;
            var canScrollY = scroller.scrollHeight > scroller.clientHeight + 1;
            if (!canScrollX && !canScrollY) return;

            e.preventDefault();
            isDown = true;
            dragged = false;
            suppressNextClick = false;
            startX = e.pageX;
            startY = e.pageY;
            startLeft = scroller.scrollLeft;
            startTop = scroller.scrollTop;
            scroller.classList.add('is-dragging');
        });

        window.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            var dx = e.pageX - startX;
            var dy = e.pageY - startY;
            if (!dragged && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
                dragged = true;
            }
            scroller.scrollLeft = startLeft - dx;
            scroller.scrollTop = startTop - dy;
        });

        window.addEventListener('mouseup', function () {
            if (!isDown) return;
            isDown = false;
            scroller.classList.remove('is-dragging');
            if (dragged) {
                suppressNextClick = true;
                setTimeout(function () { suppressNextClick = false; }, 0);
            }
            dragged = false;
        });

        scroller.addEventListener('click', function (e) {
            if (isInteractiveTarget(e.target)) return;
            if (!suppressNextClick) return;
            e.preventDefault();
            e.stopPropagation();
        }, true);
    }

    // Expose for pagepiling navigation callbacks
    window.updateTreeOpenHint = updateTreeOpenHint;
    window.resetActiveGenealogyTree = function () {
        var $activePanel = $('[data-genealogy-panel].is-active').first();
        var $trees = $activePanel.find('.genealogy-tree');
        if (!$trees.length) return;

        $trees.each(function () {
            var $tree = $(this);
            $tree.find('ul').hide().removeClass('active');
            $tree.children('ul').show();
        });
        updateTreeOpenHint();
    };

    // Collapse only ancestor (maternal) genealogy when leaving About.
    window.collapseAncestorGenealogyTree = function () {
        var $panel = $('#genealogy-panel-maternal');
        if (!$panel.length) return;

        var $trees = $panel.find('.genealogy-tree');
        if (!$trees.length) return;

        $trees.each(function () {
            var $tree = $(this);
            $tree.find('ul').hide().removeClass('active');
            $tree.children('ul').show();
        });

        // Ensure the ancestor container is scrolled back to the top.
        var $body = $panel.find('.genealogy-body').first();
        if ($body.length) {
            $body.scrollTop(0);
            $body.get(0).scrollLeft = 0;
        }

        // Reset life open state when collapsing the tree
        $panel.removeAttr('data-life-open-all');
        $panel.find('.member-details').removeClass('is-life-open');
        $panel.find('.ancestor-life-toggle').attr('aria-expanded', 'false');

        updateTreeOpenHint();
    };

    function setGenealogyPanel(panelName) {
        $('[data-genealogy-tab]').each(function () {
            var isActive = $(this).data('genealogyTab') === panelName;
            $(this).toggleClass('is-active', isActive).attr('aria-selected', String(isActive));
        });

        $('[data-genealogy-panel]').each(function () {
            var isActive = $(this).data('genealogyPanel') === panelName;
            $(this).toggleClass('is-active', isActive).prop('hidden', !isActive);
        });

        // Keep ancestor view centered when switching tabs.
        if (panelName === 'maternal') {
            centerGenealogyBody($('#genealogy-panel-maternal').find('.genealogy-body').first());
        }
    }

    function openInfoModal() {
        $infoModal.prop('hidden', false);
        $infoTrigger.attr('aria-expanded', 'true');
    }

    function closeInfoModal() {
        $infoModal.prop('hidden', true);
        $infoTrigger.attr('aria-expanded', 'false');
    }

    renderFamilyTree();
    renderAncestorTree();
    updateTreeOpenHint();
    setupGenealogyZoom();
    setupAncestorDragScroll();
    setupPaternalDragScroll();

    $(window).on('resize', function () {
        // Recompute position when viewport changes
        updateTreeOpenHint();
        setTimeout(updateTreeOpenHint, 120);
        setupAncestorDragScroll();
        setupPaternalDragScroll();
    });

    // Ancestor life-toggle must be handled before tree toggle (to avoid accidental expand/collapse).
    $(document).on('click', '#genealogy-panel-maternal .ancestor-life-toggle', function (event) {
        var $btn = $(this);
        var $panel = $btn.closest('#genealogy-panel-maternal');
        if (!$panel.length) return;

        // Global toggle: click any ▼ to open/close ALL ancestor life blocks together.
        // Use a panel flag as the source of truth (more robust than relying on transient classes).
        var isOpenAll = $panel.attr('data-life-open-all') === '1';
        var willOpenAll = !isOpenAll;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        // Reset everything first
        $panel.find('.member-details').removeClass('is-life-open');
        $panel.find('.ancestor-life-toggle').attr('aria-expanded', 'false');
        $panel.find('.ancestor-arrow-inside').each(function () {
            var $a = $(this);
            var $d = $a.closest('.member-details');
            if ($d.length) $a.appendTo($d.first());
        });

        if (willOpenAll) {
            $panel.attr('data-life-open-all', '1');
            $panel.find('.member-details').each(function () {
                var $d = $(this);
                var $lifeBlock = $d.find('.ancestor-life-block').first();
                if (!$lifeBlock.length) return;

                $d.addClass('is-life-open');
                $d.find('.ancestor-life-toggle').attr('aria-expanded', 'true');

                var $arrow = $d.find('.ancestor-arrow-inside').first();
                if ($arrow.length) $arrow.appendTo($lifeBlock);
            });
        } else {
            $panel.removeAttr('data-life-open-all');
        }
    });

    // Ancestor tree: use the "一世" card (in the prestack above 鄭阿扁) as the expand/collapse trigger.
    $(document).on('click', '#genealogy-panel-maternal .ancestor-prestack .member-details[data-ancestor-gen="1"]', function (event) {
        var $panel = $(this).closest('#genealogy-panel-maternal');
        if (!$panel.length) return;

        $panel.addClass('is-expanding');
        var expanded = false;
        $panel.find('.genealogy-tree').each(function () {
            var $tree = $(this);
            var $rootLi = $tree.children('ul').children('li').first();
            var $rootChildren = $rootLi.children('ul');
            if ($rootChildren.length && $rootChildren.is(':visible')) {
                expanded = true;
            }
        });

        var shouldExpand = !expanded;
        $panel.find('.genealogy-tree').each(function () {
            var $tree = $(this);
            var $rootLi = $tree.children('ul').children('li').first();
            if (!$rootLi.length) return;
            if (shouldExpand) showAllTreeDescendants($rootLi);
            else hideAllTreeDescendants($rootLi);
        });

        centerGenealogyBody($panel.find('.genealogy-body').first());
        updateTreeOpenHint();
        setTimeout(updateTreeOpenHint, 260);
        setTimeout(function () { $panel.removeClass('is-expanding'); }, 320);

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    });

    // Clicking the ▼ inside 一世 should also trigger expand/collapse.
    $(document).on('click', '#genealogy-panel-maternal .ancestor-prestack .member-details[data-ancestor-gen="1"] .ancestor-arrow-inside', function (event) {
        $(this).closest('.member-details[data-ancestor-gen="1"]').trigger('click');
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    });

    $(document).on('click', '.genealogy-tree li > a', function (event) {
        // Clicking the life toggle (▼) should not toggle the tree node itself.
        if ($(event.target).closest('.ancestor-life-toggle').length) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        var $node = $(this).closest('li');
        var $children = $node.children('ul');
        var isTopLevelNode = $node.parent('ul').parent('.genealogy-tree').length > 0;

        if (!$children.length) {
            return;
        }

        // Ancestor (maternal) split: clicking either root toggles both sides together,
        // and hides the tree_open.png hint while expanded.
        (function () {
            var $panel = $node.closest('[data-genealogy-panel]');
            if (!$panel.is('#genealogy-panel-maternal')) return;
            if (!isTopLevelNode) return;

            var $tree = $node.closest('.genealogy-tree');
            var $rootLi = $tree.children('ul').children('li').first();
            if (!$rootLi.is($node)) return;

            // Root expand/collapse is handled by clicking the "一世" card above 鄭阿扁.
            event.preventDefault();
            event.stopPropagation();
        })();

        // If maternal root handled above, stop here.
        if ($node.closest('#genealogy-panel-maternal').length && isTopLevelNode) {
            var $tree2 = $node.closest('.genealogy-tree');
            var $rootLi2 = $tree2.children('ul').children('li').first();
            if ($rootLi2.is($node)) return;
        }

        if (isTopLevelNode) {
            if ($children.is(':visible')) {
                hideAllTreeDescendants($node);
            } else {
                showAllTreeDescendants($node);
            }
        } else {
            if ($children.is(':visible')) {
                hideTreeChildren($children);
            } else {
                showTreeChildren($children);
            }
        }

        var $panel = $node.closest('[data-genealogy-panel]');
        if ($panel.is('#genealogy-panel-maternal')) {
            centerGenealogyBody($panel.find('.genealogy-body').first());
        } else {
            keepGenealogyNodeCentered($node);
        }
        updateTreeOpenHint();
        // Re-check after slide animations settle.
        setTimeout(updateTreeOpenHint, 260);
        event.preventDefault();
        event.stopPropagation();
    });

    // (ancestor-life-toggle handler moved above tree handler)


    $('[data-genealogy-tab]').on('click', function () {
        setGenealogyPanel($(this).data('genealogyTab'));
        updateTreeOpenHint();
    });

    $infoTrigger.on('click', function () {
        openInfoModal();
    });

    $infoModal.on('click', '[data-modal-close="true"]', function () {
        closeInfoModal();
    });

    $(document).on('keydown', function (event) {
        if (event.key === 'Escape' && !$infoModal.prop('hidden')) {
            closeInfoModal();
        }
    });

    // Contact story tabs (故事內容 / 祭拜資訊)
    $(document).on('click', '.story-tab[data-story-tab]', function () {
        var $btn = $(this);
        var tab = $btn.data('storyTab');
        var $wrap = $btn.closest('.contact-details');
        if (!$wrap.length) return;

        $wrap.find('.story-tab').each(function () {
            var isActive = $(this).data('storyTab') === tab;
            $(this).toggleClass('is-active', isActive).attr('aria-selected', String(isActive));
        });

        $wrap.find('.story-panel').each(function () {
            var panelId = $(this).attr('id') || '';
            var isActive = panelId === ('story-panel-' + tab);
            $(this).toggleClass('is-active', isActive).prop('hidden', !isActive);
        });
    });
});

