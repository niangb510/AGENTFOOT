document.addEventListener('DOMContentLoaded', () => {
    // Restaurer les emails obfusqués
    const obfuscatedElements = document.querySelectorAll('.email-obfuscated');
    obfuscatedElements.forEach(el => {
        const text = el.innerText.replace(' [at] ', '@');
        el.innerHTML = `<a href="mailto:${text}">${text}</a>`;
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    function setMenuOpen(isOpen) {
        if (!hamburger || !navLinks) return;
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        navLinks.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (hamburger) {
        hamburger.setAttribute('aria-label', 'Menu principal');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'main-nav-links');
        hamburger.addEventListener('click', () => {
            const isOpen = !hamburger.classList.contains('active');
            setMenuOpen(isOpen);
        });
    }

    // Close menu when clicking a link
    if (navLinks) {
        navLinks.id = 'main-nav-links';
        document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => setMenuOpen(false)));
    }

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hamburger && hamburger.classList.contains('active')) {
            setMenuOpen(false);
        }
    });

    // Reset menu on resize to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && hamburger && hamburger.classList.contains('active')) {
            setMenuOpen(false);
        }
    });

    // Scroll animation for elements (Scroll Reveal)
    const revealElements = () => {
        const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        reveals.forEach(element => {
            const windowHeight = window.innerHeight;
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealElements);
    revealElements(); // Run once on load

    // Contact Form Handling (Netlify Forms AJAX + repli mailto)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalLabel = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi...';

            // Sanitize inputs slightly (prevent simple script injections in the mail body)
            const sanitize = (str) => {
                const temp = document.createElement('div');
                temp.textContent = str;
                return temp.innerHTML;
            };

            // Récupération des données du formulaire
            const formData = new FormData(contactForm);
            const name = sanitize(formData.get('user_name'));
            const email = sanitize(formData.get('user_email'));
            const club = sanitize(formData.get('club')) || 'Non renseigné';
            const video = sanitize(formData.get('video_link')) || 'Non renseigné';
            const message = sanitize(formData.get('message'));

            // Tentative Netlify Forms (AJAX) — fonctionne sur le site en ligne
            let netlifyOk = false;
            try {
                const payload = new URLSearchParams();
                formData.forEach((value, key) => payload.append(key, value));
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
                    body: payload.toString()
                });
                if (response.ok) netlifyOk = true;
            } catch (err) {
                console.log('Netlify Forms indisponible (local ?), repli mailto.', err);
            }

            if (netlifyOk) {
                contactForm.reset();
                if (submitBtn) submitBtn.innerHTML = originalLabel;
                alert("✅ Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.");
                return;
            }

            // Repli : construction du lien mailto (fonctionne partout, dont en local)
            const recipient = "n.iconseilsmanagements.fr@gmail.com";
            const subject = encodeURIComponent(`Contact Joueur : ${name}`);

            const bodyText = `Nom complet: ${name}\nEmail de contact: ${email}\nClub actuel: ${club}\nLien Vidéo: ${video}\n\nMessage:\n${message}`;

            const body = encodeURIComponent(bodyText);
            const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;

            // Ouverture de l'application de messagerie
            window.location.href = mailtoLink;

            // Réinitialiser le formulaire après un court délai
            setTimeout(() => {
                contactForm.reset();
                if (submitBtn) submitBtn.innerHTML = originalLabel;
                alert("Votre application de messagerie va s'ouvrir pour envoyer le mail.");
            }, 500);
        });
    }

    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => console.log('SW Registered', reg))
                .catch(err => console.log('SW Registration Error', err));
        });
    }

    // iOS Install Prompt Logic
    const isIos = () => {
        const userAgent = window.navigator.userAgent.toLowerCase();
        return /iphone|ipad|ipod/.test(userAgent);
    }

    const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

    if (isIos() && !isInStandaloneMode()) {
        const prompt = document.createElement('div');
        prompt.id = 'ios-install-prompt';
        prompt.innerHTML = `
            <span class="close-prompt">&times;</span>
            <img src="assets/images/logo.png" alt="Logo" class="prompt-icon">
            <div class="prompt-text">
                <h3>Installer l'application</h3>
                <p>Appuyez sur <i class="fa-solid fa-arrow-up-from-bracket"></i> puis <strong>"Sur l'écran d'accueil"</strong> pour l'installer sur votre iPhone.</p>
            </div>
        `;
        document.body.appendChild(prompt);

        // Show after a delay
        setTimeout(() => {
            prompt.style.display = 'flex';
        }, 4000);

        prompt.querySelector('.close-prompt').addEventListener('click', () => {
            prompt.style.display = 'none';
        });
    }

    /* ==========================================
       LOGIQUE GESTION DES ACTUALITÉS & GOOGLE NEWS
       ========================================== */

    const newsContainer = document.getElementById('news-container');

    if (newsContainer) {
        let allArticles = [];

        const defaultBackupArticles = (window.NewsData && window.NewsData.defaultBackupArticles) ? window.NewsData.defaultBackupArticles : [];

        // Charger les articles depuis news.json (source unique) avec fallback
        const loadArticles = async () => {
            // Utiliser le module partagé si disponible
            if (window.NewsData && typeof window.NewsData.loadArticles === 'function') {
                allArticles = await window.NewsData.loadArticles();
            } else {
                // Fallback si news-data.js n'est pas chargé
                let jsonArticles = [];
                try {
                    const response = await fetch('./news.json?t=' + Date.now(), { cache: 'no-store' });
                    if (response.ok) {
                        jsonArticles = await response.json();
                    }
                } catch (err) {
                    console.log('Erreur fetch news.json, utilisation des données de secours:', err);
                }

                if (!jsonArticles || jsonArticles.length === 0) {
                    jsonArticles = defaultBackupArticles;
                }

                const deletedIds = JSON.parse(localStorage.getItem('deleted_news_ids') || '[]');
                const localArticles = JSON.parse(localStorage.getItem('custom_news_articles') || '[]');

                const articleMap = new Map();
                localArticles.forEach(item => {
                    if (!deletedIds.includes(item.id)) {
                        articleMap.set(item.id, item);
                    }
                });
                jsonArticles.forEach(item => {
                    if (!deletedIds.includes(item.id) && !articleMap.has(item.id)) {
                        articleMap.set(item.id, item);
                    }
                });

                allArticles = Array.from(articleMap.values());
                allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
            }

            renderNewsGrid(allArticles);
            checkUrlParamArticle();
        };

        const renderNewsGrid = (articles) => {
            newsContainer.innerHTML = '';

            if (articles.length === 0) {
                newsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748b;">
                    <i class="fa-solid fa-newspaper" style="font-size: 3rem; margin-bottom: 15px;"></i>
                    <p>Aucun article disponible pour le moment.</p>
                </div>`;
                return;
            }

            articles.forEach(article => {
                const card = document.createElement('article');
                card.className = 'news-card reveal active';
                card.setAttribute('itemscope', '');
                card.setAttribute('itemtype', 'https://schema.org/NewsArticle');

                const videoBadge = (article.video && article.video.trim() !== '') ? `<span style="background:#ef4444; color:white; padding:2px 8px; border-radius:10px; font-size:0.7rem; font-weight:700; margin-left:6px;"><i class="fa-solid fa-circle-play"></i> VIDÉO</span>` : '';

                // Pour les articles avec videoAsThumbnail, afficher une miniature avec bouton play (pas d'autoplay : économie de bande passante)
                const cardThumbnail = (article.videoAsThumbnail && article.video && article.video.trim() !== '')
                    ? `<div class="news-card-video-wrapper" role="button" tabindex="0" aria-label="Lire l'article vidéo : ${article.title}" data-video-preview>
                        <img src="${article.image}" alt="${article.title}" class="news-card-img" itemprop="image" loading="lazy" decoding="async">
                        <div class="video-play-icon"><i class="fa-solid fa-circle-play"></i></div>
                        <meta itemprop="image" content="${article.image}">
                       </div>`
                    : `<img src="${article.image}" alt="${article.title}" class="news-card-img" itemprop="image" loading="lazy" decoding="async">`;

                card.innerHTML = `
                    ${cardThumbnail}
                    <div class="news-card-body">
                        <div class="news-card-meta">
                            <div>
                                <span class="news-tag" itemprop="articleSection">${article.category}</span>
                                ${videoBadge}
                            </div>
                            <span itemprop="datePublished" content="${article.date}"><i class="fa-regular fa-calendar"></i> ${article.dateFormatted || article.date}</span>
                        </div>
                        <h3 class="news-card-title" itemprop="headline">${article.title}</h3>
                        <p class="news-card-excerpt" itemprop="description">${article.summary}</p>
                        <div class="news-card-footer">
                            <span style="font-size:0.8rem; color:#94a3b8;"><i class="fa-solid fa-user-ninja"></i> ${article.player || 'Joueur'}</span>
                            <button class="news-read-btn" data-id="${article.id}">
                                Lire l'article <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    </div>
                `;

                card.querySelector('.news-read-btn').addEventListener('click', () => {
                    window.location.href = 'article.html?id=' + encodeURIComponent(article.id);
                });

                // Clic sur la miniature vidéo → ouvre l'article (au lieu de l'autoplay)
                const videoPreview = card.querySelector('[data-video-preview]');
                if (videoPreview) {
                    const goToArticle = () => { window.location.href = 'article.html?id=' + encodeURIComponent(article.id); };
                    videoPreview.addEventListener('click', goToArticle);
                    videoPreview.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToArticle(); }
                    });
                }

                newsContainer.appendChild(card);
            });
        };

        // Filtres par catégorie et recherche combinés
        const filterBtns = document.querySelectorAll('.filter-btn');
        let activeCategory = 'all';
        let activeQuery = '';

        function filterArticles() {
            let filtered = allArticles;
            if (activeCategory !== 'all') {
                filtered = filtered.filter(a => a.category === activeCategory);
            }
            if (activeQuery) {
                const q = activeQuery;
                filtered = filtered.filter(a =>
                    a.title.toLowerCase().includes(q) ||
                    a.summary.toLowerCase().includes(q) ||
                    (a.player && a.player.toLowerCase().includes(q)) ||
                    (a.category && a.category.toLowerCase().includes(q))
                );
            }
            renderNewsGrid(filtered);
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = btn.dataset.category;
                filterArticles();
            });
        });

        // Recherche en temps réel
        const searchInput = document.getElementById('news-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                activeQuery = e.target.value.toLowerCase().trim();
                filterArticles();
            });
        }

        // Vérification si un ID d'article est présent dans l'URL (?id=...)
        const checkUrlParamArticle = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const articleId = urlParams.get('id');
            if (articleId) {
                // Redirection vers la page article dédiée pour une expérience pleine page
                window.location.replace('article.html?id=' + encodeURIComponent(articleId));
            }
        };

        loadArticles();
    }
});
