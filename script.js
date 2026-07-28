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

    // Contact Form Handling (Méthode Mailto avec validation basique)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

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

            // Préparation du contenu de l'email
            const recipient = "n.iconseilsmanagements.fr@gmail.com";
            const subject = encodeURIComponent(`Contact Joueur : ${name}`);

            const bodyText = `Nom complet: ${name}
Email de contact: ${email}
Club actuel: ${club}
Lien Vidéo: ${video}

Message:
${message}`;

            const body = encodeURIComponent(bodyText);

            // Construction du lien mailto
            const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;

            // Ouverture de l'application de messagerie
            window.location.href = mailtoLink;

            // Optionnel : Réinitialiser le formulaire après un court délai
            setTimeout(() => {
                contactForm.reset();
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

        const defaultBackupArticles = [
            {
                "id": "cyriaque-irie-but-fribourg",
                "title": "Performance : But décisif pour Cyriaque Irié lors du match amical du SC Fribourg",
                "date": "2026-07-28",
                "dateFormatted": "28 Juillet 2026",
                "category": "Performance",
                "author": "Ibrahim Niang",
                "player": "Cyriaque Irié",
                "image": "assets/images/cyriaque.png",
                "images": ["assets/images/cyriaque.png"],
                "video": "assets/videos/cyriaque-but.mp4",
                "hideHeaderImage": true,
                "summary": "Lors du match de préparation face à Derby County, le jeune attaquant burkinabè Cyriaque Irié a ouvert le score pour le SC Fribourg, confirmant sa montée en puissance en ce début de saison.",
                "content": "<p>C'est un début de préparation idéal pour le jeune international burkinabè. Aligné d'entrée par le staff du <strong>SC Fribourg</strong> lors de la rencontre amicale contre <strong>Derby County</strong> le 24 juillet 2026, l'attaquant de 21 ans a grandement contribué à la victoire de son équipe (3-1) en ouvrant le score dès la première période.</p><p>Cyriaque Irié continue de valider les espoirs placés en lui après son transfert retentissant en Bundesliga. Sa percussion et son sens du but ont été encensés par le staff technique allemand après la rencontre.</p><h3 style='color:var(--primary-color); margin: 15px 0 8px;'>Un but plein de sang-froid</h3><p>L'action s'est déroulée à la suite d'un pressing haut des joueurs de Fribourg. Servi dans la surface de réparation adverse, Cyriaque Irié a éliminé son vis-à-vis d'un crochet déstabilisant avant de tromper le gardien adverse d'une frappe précise à ras de terre. Une réalisation de grande classe qui montre toute l'étendue de ses qualités athlétiques et techniques.</p><h3 style='color:var(--primary-color); margin: 15px 0 8px;'>Une saison 2026-2027 pleine de promesses</h3><p>Après une première saison d'adaptation au football allemand, Cyriaque Irié semble avoir trouvé ses marques. Son coach a souligné son attitude exemplaire et son travail acharné à l'entraînement durant le stage de préparation. Avec cette prestation aboutie, le natif du Burkina Faso envoie un signal fort à la concurrence à l'aube de la nouvelle saison de Bundesliga.</p><p><em>« Cyriaque franchit les étapes les unes après les autres. Ce but valide tout le travail de l'ombre effectué ces derniers mois. Nous sommes convaincus qu'il va réaliser une grande saison en Bundesliga »</em>, rappelle l'équipe de N.I Conseils Managements.</p>",
                "tags": ["Cyriaque Irié", "SC Fribourg", "Performance", "Bundesliga", "Ibrahim Niang"]
            },
            {
                "id": "joel-bayala-transfert-dijon-fco",
                "title": "Mercato : Le milieu burkinabè Bayala Joël s’engage officiellement au Dijon FCO grâce à N.I Conseils Managements",
                "date": "2026-07-23",
                "dateFormatted": "23 Juillet 2026",
                "category": "Transfert",
                "author": "Ibrahim Niang",
                "player": "Bayala Joël",
                "image": "assets/images/mercato_dijon_1.webp",
                "summary": "À 19 ans, le prodige du milieu de terrain burkinabè Bayala Joël quitte le Sporting Club de Tenakourou pour signer son contrat avec le Dijon FCO sous l'égide d'Ibrahim Niang.",
                "content": "<p>C'est une grande étape pour le football burkinabè. Le jeune milieu de terrain de 19 ans, <strong>Bayala Joël</strong>, s'est officiellement engagé en faveur du club français du <strong>Dijon FCO</strong> (DFCO).</p><p>Ce transfert prestigieux est le résultat direct de l'accompagnement et du travail mené par l'agence burkinabè <strong>N.I Conseils Managements</strong>, dirigée par <strong>Ibrahim Niang</strong>. Entre rigueur, discrétion et négociation contractuelle de haut niveau, l'agence s'impose aujourd'hui comme la référence absolue pour propulser les jeunes espoirs du continent vers l'Europe.</p><h3 style='color:var(--primary-color); margin: 15px 0 8px;'>Un talent pur façonné au Fasofoot</h3><p>Issu du Sporting Club de Tenakourou, réputé pour l'excellence de sa formation, Bayala Joël s'est rapidement imposé comme l'un des meilleurs milieux récupérateurs et organisateurs du championnat national (Fasofoot) durant la saison 2024-2025. Doté d'une vision de jeu exceptionnelle, d'une grande aisance technique et d'une rigueur tactique rare pour son âge, le joueur a séduit les recruteurs bourguignons.</p><h3 style='color:var(--primary-color); margin: 15px 0 8px;'>Une nouvelle aventure professionnelle sous les couleurs dijonnaises</h3><p>En rejoignant les rangs du Dijon FCO, Bayala Joël franchit un palier capital dans son plan de carrière. Supervisé et conseillé par <strong>Ibrahim Niang</strong>, le jeune international espoir burkinabè bénéficiera d'un suivi personnalisé pour faciliter son intégration et poursuivre son ascension au plus haut niveau européen.</p><p><em>« L'objectif est d'offrir à nos joueurs les meilleures structures pour transformer leur potentiel en succès durable en Europe »</em>, rappelle l'équipe de N.I Conseils Managements.</p>",
                "tags": ["Bayala Joël", "Dijon FCO", "Mercato", "Ibrahim Niang", "Fasofoot"]
            },
            {
                "id": "kelvin-kwasi-adamtay-premier-contrat-pro-dijon",
                "title": "Premier contrat pro au Dijon FCO pour l’attaquant Kelvin Kwasi Adamtay supervisé par Ibrahim Niang",
                "date": "2026-07-23",
                "dateFormatted": "23 Juillet 2026",
                "category": "Transfert",
                "author": "Ibrahim Niang",
                "player": "Kelvin Kwasi Adamtay",
                "image": "assets/images/dijon.png",
                "summary": "Formé à l’Académie Afca Burkina, le jeune avant-centre polyvalent de 18 ans Kelvin Kwasi Adamtay signe son premier contrat professionnel au Dijon FCO via N.I Conseils Managements.",
                "content": "<p>Le marché des transferts s'emballe pour l'agence <strong>N.I Conseils Managements</strong> ! L'avant-centre d'origine ghanéenne de 18 ans, <strong>Kelvin Kwasi Adamtay</strong>, vient de signer son tout premier contrat professionnel au sein du club français du <strong>Dijon FCO</strong>.</p><p>Entièrement supervisée par le représentant et fondateur de l'agence <strong>Ibrahim Niang</strong>, cette signature marque le début d'une aventure prometteuse dans l'Hexagone pour le jeune attaquant.</p><h3 style='color:var(--primary-color); margin: 15px 0 8px;'>Un attaquant moderne et polyvalent</h3><p>Poli et formé au sein de la prestigieuse <strong>Académie Afca Burkina</strong>, Kelvin Kwasi Adamtay est un avant-centre complet, puissant et doté d'une grande mobilité sur tout le front de l'attaque. Capable d'évoluer en pointe comme sur les ailes, il a impressionné la cellule de recrutement du Dijon FCO par son sens du but et son abnégation.</p><h3 style='color:var(--primary-color); margin: 15px 0 8px;'>N.I Conseils Managements : Le pont entre les académies et l'Europe</h3><p>Après avoir déjà orchestré le transfert de l'attaquant international burkinabè <strong>Cyriaque Irié</strong> vers le SC Fribourg en Bundesliga, <strong>Ibrahim Niang</strong> et N.I Conseils Managements confirment leur capacité à créer des opportunités concrètes et durables pour les pépites africaines.</p><p>Pour Kelvin Kwasi Adamtay, l'aventure professionnelle ne fait que commencer sous les couleurs de la Côte-d'Or, fort du soutien permanent de son agence de management.</p>",
                "tags": ["Kelvin Kwasi Adamtay", "Dijon FCO", "Afca Burkina", "Ibrahim Niang", "Transfert"]
            },
            {
                "id": "cyriaque-irie-transfert-fribourg",
                "title": "Cyriaque Irié rejoint le SC Fribourg en Bundesliga",
                "date": "2026-07-20",
                "dateFormatted": "20 Juillet 2026",
                "category": "Transfert",
                "author": "N.I. CONSEILS-MANAGEMENTS",
                "player": "Cyriaque Irié",
                "image": "assets/images/cyriaque.png",
                "summary": "Après une saison étincelante à Dijon puis Troyes, le jeune ailier international burkinabé s'engage avec le SC Fribourg en Bundesliga.",
                "content": "<p>N.I. CONSEILS-MANAGEMENTS a le grand plaisir d'annoncer la signature officielle de <strong>Cyriaque Irié</strong> au <strong>SC Fribourg</strong> en Bundesliga allemande.</p><p>Révélé sous les couleurs du DFCO Dijon avec 26 matchs et 7 buts inscrits, puis confirmé à l'ESTAC Troyes, l'international burkinabé de 19 ans franchit une étape majeure dans sa carrière sportive.</p><p>Cette signature concrétise le travail d'accompagnement sur-mesure mené par notre agence pour placer nos talents dans les plus grands championnats européens.</p>",
                "tags": ["Cyriaque Irié", "Bundesliga", "Fribourg", "Transfert", "Mercato"]
            }
        ];

        // Charger articles depuis news.json et localStorage avec fallback instantané
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

                card.innerHTML = `
                    <img src="${article.image}" alt="${article.title}" class="news-card-img" itemprop="image">
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
