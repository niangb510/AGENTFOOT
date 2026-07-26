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

        // Charger articles depuis news.json et localStorage
        const loadArticles = async () => {
            let jsonArticles = [];
            try {
                const response = await fetch('news.json');
                if (response.ok) {
                    jsonArticles = await response.json();
                }
            } catch (err) {
                console.log('Fichier news.json non trouvé ou erreur de lecture:', err);
            }

            const localArticles = JSON.parse(localStorage.getItem('custom_news_articles') || '[]');
            allArticles = [...localArticles, ...jsonArticles];

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
            document.getElementById('modal-img').src = article.image;
            document.getElementById('modal-img').alt = article.title;
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

