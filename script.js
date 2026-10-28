/* Play Fun — header state, mobile nav, hero key-visual slideshow. */
(function () {
    'use strict';

    var header = document.querySelector('.header');
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.getElementById('nav-links');

    /* Condensed header after the first scroll */
    var onScroll = function () {
        if (!header) return;
        header.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Mobile menu */
    if (toggle && nav) {
        var setMenu = function (open) {
            nav.classList.toggle('active', open);
            toggle.classList.toggle('active', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        };
        toggle.addEventListener('click', function () {
            setMenu(toggle.getAttribute('aria-expanded') !== 'true');
        });
        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) setMenu(false);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setMenu(false);
        });
    }

    /* Hero slideshow: cross-fade, one autoplaying element on the page */
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    if (slides.length > 1 && dots.length === slides.length) {
        var index = 0;
        var timer = null;
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        var show = function (next) {
            slides[index].classList.remove('is-active');
            dots[index].classList.remove('is-active');
            dots[index].setAttribute('aria-pressed', 'false');
            index = (next + slides.length) % slides.length;
            slides[index].classList.add('is-active');
            dots[index].classList.add('is-active');
            dots[index].setAttribute('aria-pressed', 'true');
        };

        var start = function () {
            if (reduced || timer) return;
            timer = window.setInterval(function () { show(index + 1); }, 6000);
        };
        var stop = function () {
            window.clearInterval(timer);
            timer = null;
        };

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                stop();
                show(i);
                start();
            });
        });

        var hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
        }
        document.addEventListener('visibilitychange', function () {
            document.hidden ? stop() : start();
        });

        start();
    }

    /* Review carousels on game pages */
    Array.prototype.forEach.call(document.querySelectorAll('.ts-carousel'), function (wrap) {
        var track = wrap.querySelector('.ts-carousel-track');
        var prev = wrap.querySelector('.ts-carousel-btn.prev');
        var next = wrap.querySelector('.ts-carousel-btn.next');
        if (!track || !prev || !next) return;

        var step = function () {
            var card = track.querySelector('.ts-review');
            return card ? card.getBoundingClientRect().width + 24 : 320;
        };
        var sync = function () {
            var maxScroll = track.scrollWidth - track.clientWidth - 2;
            prev.classList.toggle('is-hidden', track.scrollLeft <= 2);
            next.classList.toggle('is-hidden', track.scrollLeft >= maxScroll);
        };

        prev.addEventListener('click', function () {
            track.scrollBy({ left: -step() * 2, behavior: 'smooth' });
        });
        next.addEventListener('click', function () {
            track.scrollBy({ left: step() * 2, behavior: 'smooth' });
        });
        track.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', sync);
        sync();
    });

    /* Contact form — simulated send. No network request: this is a demo build. */
    var form = document.getElementById('contact-form');
    var done = document.getElementById('cf-done');
    if (form && done) {
        var status = document.getElementById('cf-status');
        var submit = document.getElementById('cf-submit');
        var submitLabel = submit ? submit.querySelector('span') : null;
        var doneText = document.getElementById('cf-done-text');
        var again = document.getElementById('cf-again');
        var topic = document.getElementById('cf-topic');
        var busy = false;

        var fields = [
            { input: document.getElementById('cf-name'), wrap: document.getElementById('f-name'),
              err: document.getElementById('cf-name-err'), label: 'your name',
              test: function (v) { return v.length >= 2 ? '' : 'Add a name so we know who we are replying to.'; } },
            { input: document.getElementById('cf-email'), wrap: document.getElementById('f-email'),
              err: document.getElementById('cf-email-err'), label: 'email',
              test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'That email address is missing something — check the @ and the domain.'; } },
            { input: document.getElementById('cf-message'), wrap: document.getElementById('f-message'),
              err: document.getElementById('cf-message-err'), label: 'message',
              test: function (v) { return v.length >= 12 ? '' : 'Give us a little more to go on — twelve characters or more.'; } }
        ];

        var setError = function (field, message) {
            field.err.textContent = message;
            field.wrap.classList.toggle('has-error', !!message);
            if (message) {
                field.input.setAttribute('aria-invalid', 'true');
            } else {
                field.input.removeAttribute('aria-invalid');
            }
        };

        fields.forEach(function (field) {
            if (!field.input) return;
            field.input.addEventListener('input', function () {
                if (field.wrap.classList.contains('has-error')) setError(field, '');
            });
        });

        var validate = function () {
            var firstBad = null;
            fields.forEach(function (field) {
                if (!field.input) return;
                var message = field.test(field.input.value.trim());
                setError(field, message);
                if (message && !firstBad) firstBad = field.input;
            });
            if (firstBad) firstBad.focus();
            return !firstBad;
        };

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (busy) return;
            if (!validate()) {
                status.textContent = 'Check the highlighted fields.';
                return;
            }
            busy = true;
            status.textContent = '';
            if (submit) submit.disabled = true;
            if (submitLabel) submitLabel.textContent = 'Sending…';

            /* Stand-in for the real endpoint: keeps the sending state honest for ~1s. */
            window.setTimeout(function () {
                var name = document.getElementById('cf-name').value.trim().split(' ')[0];
                if (doneText) {
                    doneText.textContent = name
                        ? 'Thanks, ' + name + ' — we reply within two working days.'
                        : 'Thanks — we reply within two working days.';
                }
                form.hidden = true;
                done.hidden = false;
                busy = false;
                if (submit) submit.disabled = false;
                if (submitLabel) submitLabel.textContent = 'Send message';
                if (again) again.focus({ preventScroll: true });
            }, 950);
        });

        if (again) {
            again.addEventListener('click', function () {
                form.reset();
                fields.forEach(function (field) { if (field.input) setError(field, ''); });
                if (doneText) doneText.textContent = 'Thanks — we reply within two working days.';
                done.hidden = true;
                form.hidden = false;
                status.textContent = '';
                var first = document.getElementById('cf-name');
                if (first) first.focus({ preventScroll: true });
            });
        }

        /* Careers and in-game CTAs open this form with the right topic selected. */
        Array.prototype.forEach.call(document.querySelectorAll('[data-topic]'), function (link) {
            link.addEventListener('click', function () {
                if (topic) topic.value = link.getAttribute('data-topic');
            });
        });
    }
})();
