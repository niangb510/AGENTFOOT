/**
 * N.I. CONSEILS-MANAGEMENTS - Animations & Interactions
 * Gestion des effets visuels, scroll et hover.
 */
(function () {
    'use strict';

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    // ----------------------------------------------------------------
    // 1. Scroll Progress Bar & Back to Top
    // ----------------------------------------------------------------
    function initScrollHelpers() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);

        const backToTop = document.createElement('button');
        backToTop.className = 'back-to-top';
        backToTop.setAttribute('aria-label', 'Retour en haut');
        backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
        document.body.appendChild(backToTop);

        let rafId = null;
        let lastScrollY = 0;
        const navbar = document.querySelector('.navbar');

        function updateOnScroll() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

            progressBar.style.width = progress + '%';

            if (scrollTop > 300) {
                backToTop.classList.add('is-visible');
            } else {
                backToTop.classList.remove('is-visible');
            }

            if (navbar) {
                if (scrollTop > lastScrollY && scrollTop > 100) {
                    navbar.classList.add('nav-hidden');
                } else {
                    navbar.classList.remove('nav-hidden');
                }
            }

            lastScrollY = scrollTop;
            rafId = null;
        }

        window.addEventListener('scroll', () => {
            if (!rafId) {
                rafId = requestAnimationFrame(updateOnScroll);
            }
        }, { passive: true });

        updateOnScroll();
    }

    // ----------------------------------------------------------------
    // 2. IntersectionObserver based reveal
    // ----------------------------------------------------------------
    let scrollObserver = null;

    function initScrollReveal() {
        if (prefersReducedMotion) {
            document.querySelectorAll('.js-reveal, .js-reveal-left, .js-reveal-right, .js-scale-in, .reveal, .reveal-left, .reveal-right').forEach(el => {
                el.classList.add('is-visible');
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.15 });

        document.querySelectorAll('.js-reveal, .js-reveal-left, .js-reveal-right, .js-scale-in, .service-row, .timeline-item').forEach(el => scrollObserver.observe(el));

        // Legacy reveal support
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
            el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            scrollObserver.observe(el);
        });
    }

    // ----------------------------------------------------------------
    // 3. Hero animations (parallax + stagger)
    // ----------------------------------------------------------------
    function initHeroAnimations() {
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');

        if (heroContent) {
            heroContent.classList.add('animate-in');
        }

        // Parallax on hero background (desktop only)
        if (hero && !prefersReducedMotion && !isTouchDevice) {
            let rafId = null;
            window.addEventListener('scroll', () => {
                if (rafId) return;
                rafId = requestAnimationFrame(() => {
                    const yPos = -(window.scrollY * 0.3);
                    hero.style.backgroundPosition = `center calc(50% + ${yPos}px)`;
                    rafId = null;
                });
            }, { passive: true });
        }
    }

    // ----------------------------------------------------------------
    // 4. Typing effect for hero subtitle
    // ----------------------------------------------------------------
    function initTypingEffect() {
        const subtitle = document.querySelector('.hero-content .hero-subtitle');
        if (!subtitle || prefersReducedMotion || isTouchDevice) return;

        const originalText = subtitle.textContent;
        subtitle.textContent = '';
        subtitle.classList.add('typing-text');

        let i = 0;
        const speed = 40;
        function type() {
            if (i < originalText.length) {
                subtitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        setTimeout(type, 600);
    }

    // ----------------------------------------------------------------
    // 5. 3D Tilt cards (desktop only)
    // ----------------------------------------------------------------
    function initTiltCards() {
        if (prefersReducedMotion || isTouchDevice) return;

        const cards = document.querySelectorAll('.tilt-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // ----------------------------------------------------------------
    // 6. Button ripple effect
    // ----------------------------------------------------------------
    function initButtonRipple() {
        document.querySelectorAll('.btn').forEach(btn => {
            btn.addEventListener('click', function (e) {
                const ripple = document.createElement('span');
                ripple.className = 'btn-ripple';
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }

    // ----------------------------------------------------------------
    // 7. Stat counters
    // ----------------------------------------------------------------
    function animateCounter(el) {
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * ease);
            el.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function initCounters() {
        const counters = document.querySelectorAll('.stat-counter');
        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    // ----------------------------------------------------------------
    // 8. Timeline animation
    // ----------------------------------------------------------------
    function initTimeline() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;

        const progress = document.createElement('div');
        progress.className = 'timeline-progress';
        timeline.appendChild(progress);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    progress.classList.add('is-visible');
                    observer.unobserve(progress);
                }
            });
        }, { threshold: 0.2 });

        observer.observe(progress);
    }

    // ----------------------------------------------------------------
    // 9. Service list checkmarks stagger
    // ----------------------------------------------------------------
    function initServiceAnimations() {
        const serviceRows = document.querySelectorAll('.service-row');
        if (!serviceRows.length) return;

        serviceRows.forEach(row => {
            const items = row.querySelectorAll('.service-list li');
            items.forEach((item, index) => {
                item.style.transitionDelay = (index * 0.1) + 's';
            });
        });
    }

    // ----------------------------------------------------------------
    // 10. Gallery lightbox
    // ----------------------------------------------------------------
    function initLightbox() {
        const galleryImages = document.querySelectorAll('.gallery-img, .agent-gallery-img, [data-lightbox]');
        if (!galleryImages.length) return;

        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = '<button class="lightbox-close" aria-label="Fermer">&times;</button><img src="" alt="">';
        document.body.appendChild(overlay);

        const imgEl = overlay.querySelector('img');
        const closeBtn = overlay.querySelector('.lightbox-close');

        galleryImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                imgEl.src = img.src;
                imgEl.alt = img.alt || '';
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        function closeLightbox() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        closeBtn.addEventListener('click', closeLightbox);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    // ----------------------------------------------------------------
    // 11. Floating labels for contact form
    // ----------------------------------------------------------------
    function initFloatingLabels() {
        document.querySelectorAll('.contact-form-wrapper .form-group').forEach(group => {
            const input = group.querySelector('input, textarea');
            const label = group.querySelector('label');
            if (!input || !label) return;

            group.classList.add('floating');
            input.setAttribute('placeholder', ' ');
        });
    }

    // ----------------------------------------------------------------
    // 12. Contact form submit animation
    // ----------------------------------------------------------------
    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        const submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', function (e) {
            const requiredFields = form.querySelectorAll('[required]');
            let valid = true;
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    valid = false;
                    field.parentElement.classList.add('shake');
                    setTimeout(() => field.parentElement.classList.remove('shake'), 500);
                }
            });

            if (!valid) {
                e.preventDefault();
                return;
            }

            if (submitBtn) {
                submitBtn.classList.add('btn-submit-loading');
            }

            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.classList.remove('btn-submit-loading');
                    submitBtn.classList.add('btn-submit-success');
                    submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Envoyé';

                    setTimeout(() => {
                        submitBtn.classList.remove('btn-submit-success');
                        submitBtn.innerHTML = 'Envoyer';
                    }, 3000);
                }
            }, 1000);
        });
    }

    // ----------------------------------------------------------------
    // 13. Partners marquee
    // ----------------------------------------------------------------
    function initPartnersMarquee() {
        const partnersGrid = document.querySelector('.partners-grid');
        if (!partnersGrid) return;

        const items = Array.from(partnersGrid.children);
        if (items.length < 2) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'partners-wrapper';
        const track = document.createElement('div');
        track.className = 'partners-track';

        // Duplicate items for seamless loop
        items.forEach(item => track.appendChild(item.cloneNode(true)));
        items.forEach(item => track.appendChild(item.cloneNode(true)));

        wrapper.appendChild(track);
        partnersGrid.innerHTML = '';
        partnersGrid.appendChild(wrapper);
    }

    // ----------------------------------------------------------------
    // 14. News cards enhancement
    // ----------------------------------------------------------------
    function initNewsCards() {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;

        function enhanceNewsCards(container) {
            container.querySelectorAll('.news-card').forEach((card, index) => {
                card.classList.add('shine-card');
                if (!card.classList.contains('js-reveal')) {
                    card.classList.add('js-reveal');
                    const stagger = (index % 4) + 1;
                    card.classList.add(`stagger-${stagger}`);
                }
                if (scrollObserver && !card.classList.contains('is-visible')) {
                    scrollObserver.observe(card);
                }
            });
        }

        enhanceNewsCards(newsContainer);

        const observer = new MutationObserver(() => {
            enhanceNewsCards(newsContainer);
        });
        observer.observe(newsContainer, { childList: true });
    }

    // ----------------------------------------------------------------
    // 15. Smooth scroll for anchor links
    // ----------------------------------------------------------------
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                }
            });
        });
    }

    // ----------------------------------------------------------------
    // Initialization
    // ----------------------------------------------------------------
    onReady(() => {
        if (!prefersReducedMotion) {
            initScrollHelpers();
            initScrollReveal();
            initHeroAnimations();
            initTypingEffect();
            initTiltCards();
            initButtonRipple();
            initCounters();
            initTimeline();
            initServiceAnimations();
            initPartnersMarquee();
            initNewsCards();
        } else {
            document.querySelectorAll('.js-reveal, .js-reveal-left, .js-reveal-right, .js-scale-in').forEach(el => {
                el.classList.add('is-visible');
            });
        }

        initLightbox();
        initFloatingLabels();
        initContactForm();
        initSmoothScroll();
    });
})();
