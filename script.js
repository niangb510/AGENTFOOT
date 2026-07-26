document.addEventListener('DOMContentLoaded', () => {
    // Restaurer les emails obfusqués
    const obfuscatedElements = document.querySelectorAll('.email-obfuscated');
    obfuscatedElements.forEach(el => {
        const text = el.innerText.replace(' [at] ', '@');
        el.innerHTML = `<a href="mailto:${text}">${text}</a>`;
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = hamburger.classList.contains('active') ? 'hidden' : 'auto';
        });
    }

    // Close menu when clicking a link
    if (navLinks) {
        document.querySelectorAll('.nav-links a').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        }));
    }

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

        // Filtres par catégorie
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const category = btn.dataset.category;
                if (category === 'all') {
                    renderNewsGrid(allArticles);
                } else {
                    const filtered = allArticles.filter(a => a.category === category);
                    renderNewsGrid(filtered);
                }
            });
        });

        // Recherche en temps réel
        const searchInput = document.getElementById('news-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                const filtered = allArticles.filter(a => 
                    a.title.toLowerCase().includes(query) ||
                    a.summary.toLowerCase().includes(query) ||
                    (a.player && a.player.toLowerCase().includes(query)) ||
                    (a.category && a.category.toLowerCase().includes(query))
                );
                renderNewsGrid(filtered);
            });
        }

        // Ouverture de la modale article & mise à jour SEO Schema.org
        const openArticleModal = (article) => {
            const mainImg = document.getElementById('modal-img');
            const gallerySec = document.getElementById('modal-gallery-sec');
            
            const photoList = (article.images && article.images.length > 0) ? article.images : (article.image ? [article.image] : []);

            if (photoList.length === 0) {
                mainImg.style.display = 'none';
                if (gallerySec) gallerySec.style.display = 'none';
            } else if (photoList.length === 1) {
                mainImg.src = photoList[0];
                mainImg.alt = article.title;
                mainImg.style.display = 'block';
                if (gallerySec) gallerySec.style.display = 'none';
            } else {
                // 2 ou plusieurs photos : affichage SIMULTANÉ côte à côte en grille
                mainImg.style.display = 'none';
                if (gallerySec) {
                    let gridCols = photoList.length === 2 ? 'grid-template-columns: repeat(2, 1fr);' : 'grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));';
                    let galleryHtml = `<div style="display: grid; ${gridCols} gap: 15px; margin-bottom: 15px;">`;
                    
                    photoList.forEach((src, index) => {
                        galleryHtml += `
                            <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.12); height: 260px; background: #0f172a; position: relative;">
                                <img src="${src}" alt="${article.title} - Photo ${index + 1}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer; transition: transform 0.3s ease;" onclick="window.open('${src}', '_blank')">
                            </div>
                        `;
                    });
                    galleryHtml += `</div>`;
                    gallerySec.innerHTML = galleryHtml;
                    gallerySec.style.display = 'block';
                }
            }

            document.getElementById('modal-title').innerText = article.title;
            document.getElementById('modal-date').innerHTML = `<i class="fa-regular fa-calendar"></i> ${article.dateFormatted || article.date}`;
            document.getElementById('modal-author').innerHTML = `<i class="fa-solid fa-user"></i> ${article.author || 'N.I. CONSEILS'}`;
            document.getElementById('modal-category').innerText = article.category;
            document.getElementById('modal-content').innerHTML = article.content;

            // Rendu Vidéo si présente
            const videoSec = document.getElementById('modal-video-sec');
            if (videoSec) {
                if (article.video && article.video.trim() !== '') {
                    const videoUrl = article.video.trim();
                    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                        let ytId = '';
                        if (videoUrl.includes('youtu.be/')) {
                            ytId = videoUrl.split('youtu.be/')[1].split('?')[0];
                        } else if (videoUrl.includes('v=')) {
                            ytId = videoUrl.split('v=')[1].split('&')[0];
                        }
                        videoSec.innerHTML = `<iframe width="100%" height="380" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15);"></iframe>`;
                    } else {
                        videoSec.innerHTML = `<video controls width="100%" style="max-height: 400px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); width: 100%;" src="${videoUrl}"></video>`;
                    }
                    videoSec.style.display = 'block';
                } else {
                    videoSec.innerHTML = '';
                    videoSec.style.display = 'none';
                }
            }

            // Liens de partage
            const currentUrl = window.location.origin + window.location.pathname + '?id=' + article.id;
            document.getElementById('share-whatsapp').href = `https://wa.me/?text=${encodeURIComponent(article.title + ' : ' + currentUrl)}`;
            document.getElementById('share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
            
            const copyBtn = document.getElementById('copy-link-btn');
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(currentUrl);
                alert('Lien de l\'article copié !');
            };

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
        };

        // Fermeture de la modale
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
                articleModal.style.display = 'none';
                articleModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });

            articleModal.addEventListener('click', (e) => {
                if (e.target === articleModal) {
                    articleModal.style.display = 'none';
                    articleModal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }

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

