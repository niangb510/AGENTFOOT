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
    const articleModal = document.getElementById('article-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    if (newsContainer) {
        let allArticles = [];

        const defaultBackupArticles = [
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
            // Les articles modifiés/créés localement sont prioritaires
            localArticles.forEach(item => {
                if (!deletedIds.includes(item.id)) {
                    articleMap.set(item.id, item);
                }
            });
            // Les articles de news.json s'ajoutent s'ils ne sont ni supprimés ni modifiés
            jsonArticles.forEach(item => {
                if (!deletedIds.includes(item.id) && !articleMap.has(item.id)) {
                    articleMap.set(item.id, item);
                }
            });

            allArticles = Array.from(articleMap.values());

            // Tri par date décroissante
            allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));

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
                    openArticleModal(article);
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

        // Ouverture de la modale article & mise à jour SEO Schema.org
        // Sauvegarde du titre original de la page
        const originalPageTitle = document.title;

        // Nettoyage des styles inline du contenu pour respecter le design éditorial
        const prepareArticleContent = (html) => {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            wrapper.querySelectorAll('p, h3, h4, h5, h6, blockquote').forEach(el => {
                el.removeAttribute('style');
            });
            return wrapper.innerHTML;
        };

        const openArticleModal = (article) => {
            const mainImg = document.getElementById('modal-img');
            const gallerySec = document.getElementById('modal-gallery-sec');
            const imgLoader = document.getElementById('modal-img-loader');
            const modalContent = document.getElementById('modal-content');

            const photoList = (article.images && article.images.length > 0) ? article.images : (article.image ? [article.image] : []);

            if (imgLoader) imgLoader.style.display = 'none';

            // Gestion des médias
            if (photoList.length === 0) {
                mainImg.style.display = 'none';
                if (gallerySec) gallerySec.style.display = 'none';
            } else if (photoList.length === 1) {
                mainImg.style.display = 'none';
                if (imgLoader) imgLoader.style.display = 'block';
                mainImg.onload = () => {
                    if (imgLoader) imgLoader.style.display = 'none';
                    mainImg.style.display = 'block';
                };
                mainImg.onerror = () => {
                    if (imgLoader) imgLoader.style.display = 'none';
                    mainImg.style.display = 'none';
                };
                mainImg.src = photoList[0];
                mainImg.alt = article.title;
                mainImg.style.maxHeight = '480px';
                mainImg.style.objectFit = 'contain';
                mainImg.style.backgroundColor = '#0f172a';
                if (gallerySec) gallerySec.style.display = 'none';
            } else {
                // 2 ou plusieurs photos : galerie responsive
                mainImg.style.display = 'none';
                if (gallerySec) {
                    let galleryHtml = `<div class="gallery-grid">`;

                    photoList.forEach((src, index) => {
                        galleryHtml += `
                            <div class="gallery-item">
                                <img src="${src}" alt="${article.title} - Photo ${index + 1}" onclick="window.open('${src}', '_blank')">
                            </div>
                        `;
                    });
                    galleryHtml += `</div>`;
                    gallerySec.innerHTML = galleryHtml;
                    gallerySec.style.display = 'block';
                }
            }

            // Métadonnées éditoriales
            document.getElementById('modal-title').innerText = article.title;
            document.getElementById('modal-date').innerText = article.dateFormatted || article.date;
            document.getElementById('modal-category').innerText = article.category;

            // Contenu de l'article
            const rawContent = window.DOMPurify ? DOMPurify.sanitize(article.content, { USE_PROFILES: { html: true } }) : article.content;
            modalContent.innerHTML = prepareArticleContent(rawContent);

            // Rendu Vidéo si présente
            const videoSec = document.getElementById('modal-video-sec');
            if (videoSec) {
                if (article.video && article.video.trim() !== '') {
                    const videoUrl = article.video.trim();
                    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                        let ytId = '';
                        const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|[^\/]+\/|(?:v|embed|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                        const match = videoUrl.match(ytRegex);
                        if (match && match[1]) {
                            ytId = match[1];
                        }
                        if (ytId) {
                            videoSec.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
                        } else {
                            videoSec.innerHTML = `<p style="color:#64748b;"><i class="fa-brands fa-youtube"></i> <a href="${videoUrl}" target="_blank" rel="noopener noreferrer">Voir la vidéo sur YouTube</a></p>`;
                        }
                    } else {
                        videoSec.innerHTML = `<video controls src="${videoUrl}"></video>`;
                    }
                    videoSec.style.display = 'block';
                } else {
                    videoSec.innerHTML = '';
                    videoSec.style.display = 'none';
                }
            }

            // Liens de partage
            const currentUrl = window.location.origin + window.location.pathname + '?id=' + article.id;
            const shareFacebook = document.getElementById('share-facebook');
            const shareWhatsapp = document.getElementById('share-whatsapp');

            if (shareFacebook) shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
            if (shareWhatsapp) shareWhatsapp.href = `https://wa.me/?text=${encodeURIComponent(article.title + ' : ' + currentUrl)}`;

            const copyBtn = document.getElementById('copy-link-btn');
            if (copyBtn) {
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(currentUrl);
                    alert('Lien de l\'article copié !');
                };
            }

            // Section "À lire aussi"
            const relatedContainer = document.getElementById('modal-related-articles');
            const relatedSec = document.getElementById('modal-related-sec');
            if (relatedContainer && relatedSec) {
                relatedContainer.innerHTML = '';
                // Articles de la même catégorie, sinon les plus récents
                let related = allArticles.filter(a => a.id !== article.id && a.category === article.category);
                if (related.length < 2) {
                    related = [...related, ...allArticles.filter(a => a.id !== article.id && !related.find(r => r.id === a.id))];
                }

                if (related.length === 0) {
                    relatedSec.style.display = 'none';
                } else {
                    related.slice(0, 2).forEach(relArticle => {
                        const relUrl = '?id=' + encodeURIComponent(relArticle.id);
                        const relCard = document.createElement('a');
                        relCard.className = 'related-card';
                        relCard.href = relUrl;
                        relCard.setAttribute('aria-label', `Lire l'article : ${relArticle.title}`);
                        relCard.innerHTML = `
                            <img src="${relArticle.image}" alt="" loading="lazy" decoding="async">
                            <div class="related-body">
                                <span class="related-tag">${relArticle.category}</span>
                                <h4>${relArticle.title}</h4>
                                <span class="related-date"><i class="fa-regular fa-calendar"></i> ${relArticle.dateFormatted || relArticle.date}</span>
                            </div>
                        `;
                        relCard.addEventListener('click', (e) => {
                            e.preventDefault();
                            const modalContentEl = document.querySelector('.modal-content');
                            if (modalContentEl) modalContentEl.scrollTop = 0;
                            openArticleModal(relArticle);
                        });
                        relatedContainer.appendChild(relCard);
                    });
                    relatedSec.style.display = 'block';
                }
            }

            // Injection dynamique du Schema.org NewsArticle pour Google News
            const schemaTag = document.getElementById('seo-news-schema');
            if (schemaTag) {
                schemaTag.textContent = JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "NewsArticle",
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": currentUrl
                    },
                    "headline": article.title,
                    "image": [ window.location.origin + '/' + article.image ],
                    "datePublished": article.date,
                    "dateModified": article.date,
                    "author": {
                        "@type": "Organization",
                        "name": article.author || "N.I. CONSEILS-MANAGEMENTS"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "N.I. CONSEILS-MANAGEMENTS",
                        "logo": {
                            "@type": "ImageObject",
                            "url": window.location.origin + "/assets/images/logo.png"
                        }
                    },
                    "description": article.summary
                }, null, 2);
            }

            articleModal.style.display = 'flex';
            articleModal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Mise à jour de l'URL et du titre de page
            const articleUrl = '?id=' + encodeURIComponent(article.id);
            if (window.location.search !== articleUrl) {
                window.history.pushState({ articleId: article.id }, article.title, articleUrl);
            }
            document.title = article.title + ' | N.I. CONSEILS-MANAGEMENTS';

            // Focus sur le titre de l'article pour l'accessibilité
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) {
                modalTitle.setAttribute('tabindex', '-1');
                modalTitle.focus();
            }
        };

        // Fermeture de la modale
        const closeArticleModal = () => {
            articleModal.style.display = 'none';
            articleModal.classList.remove('active');
            document.body.style.overflow = 'auto';
            // Restaurer le titre original de la page
            if (originalPageTitle) {
                document.title = originalPageTitle;
            }
        };

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', closeArticleModal);

            articleModal.addEventListener('click', (e) => {
                if (e.target === articleModal) {
                    closeArticleModal();
                }
            });
        }

        // Gestion du bouton retour du navigateur
        window.addEventListener('popstate', () => {
            if (articleModal.classList.contains('active')) {
                closeArticleModal();
            }
        });

        // Focus trap basique dans la modale
        articleModal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            const focusable = articleModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });

        // Vérification si un ID d'article est présent dans l'URL (?id=...)
        const checkUrlParamArticle = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const articleId = urlParams.get('id');
            if (articleId) {
                const targetArticle = allArticles.find(a => a.id === articleId);
                if (targetArticle) {
                    openArticleModal(targetArticle);
                }
            }
        };

        loadArticles();
    }
});

