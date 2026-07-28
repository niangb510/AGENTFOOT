document.addEventListener('DOMContentLoaded', async () => {
    const articleContainer = document.getElementById('article-container');

    // Nettoyage basique du contenu (supprime les styles inline pour respecter le design éditorial)
    const prepareArticleContent = (html) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        wrapper.querySelectorAll('p, h3, h4, h5, h6, blockquote').forEach(el => {
            el.removeAttribute('style');
        });
        return wrapper.innerHTML;
    };

    const renderMedia = (article) => {
        const photoList = (article.images && article.images.length > 0)
            ? article.images
            : (article.image ? [article.image] : []);

        let mediaHtml = '';

        if (photoList.length === 0) {
            return mediaHtml;
        }

        if (photoList.length === 1) {
            mediaHtml += `
                <div class="post-media">
                    <img src="${photoList[0]}" alt="${article.title}" id="modal-img" loading="lazy" decoding="async">
                </div>
            `;
        } else {
            let galleryHtml = `<div class="post-media"><div class="gallery-grid">`;
            photoList.forEach((src, index) => {
                galleryHtml += `
                    <div class="gallery-item">
                        <img src="${src}" alt="${article.title} - Photo ${index + 1}" loading="lazy" decoding="async" onclick="window.open('${src}', '_blank')">
                    </div>
                `;
            });
            galleryHtml += `</div></div>`;
            mediaHtml += galleryHtml;
        }

        return mediaHtml;
    };

    const renderVideo = (article) => {
        if (!article.video || article.video.trim() === '') {
            return '';
        }

        const videoUrl = article.video.trim();
        let videoHtml = '<div class="post-media" id="article-video">';

        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|[^\/]+\/|(?:v|embed|shorts)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = videoUrl.match(ytRegex);
            const ytId = match && match[1] ? match[1] : '';

            if (ytId) {
                videoHtml += `<iframe src="https://www.youtube.com/embed/${ytId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            } else {
                videoHtml += `<p style="color:#64748b;"><i class="fa-brands fa-youtube"></i> <a href="${videoUrl}" target="_blank" rel="noopener noreferrer">Voir la vidéo sur YouTube</a></p>`;
            }
        } else {
            videoHtml += `<video controls src="${videoUrl}"></video>`;
        }

        videoHtml += '</div>';
        return videoHtml;
    };

    const renderRelated = (article, allArticles) => {
        if (!window.NewsData || typeof window.NewsData.getRelatedArticles !== 'function') {
            return '';
        }

        const related = window.NewsData.getRelatedArticles(allArticles, article, 2);
        if (!related || related.length === 0) {
            return '';
        }

        let html = `<aside class="post-related"><h3>À lire aussi</h3><div class="related-grid">`;

        related.forEach(relArticle => {
            html += `
                <a href="article.html?id=${encodeURIComponent(relArticle.id)}" class="related-card" aria-label="Lire l'article : ${relArticle.title}">
                    <img src="${relArticle.image}" alt="" loading="lazy" decoding="async">
                    <div class="related-body">
                        <span class="related-tag">${relArticle.category}</span>
                        <h4>${relArticle.title}</h4>
                        <span class="related-date"><i class="fa-regular fa-calendar"></i> ${relArticle.dateFormatted || relArticle.date}</span>
                    </div>
                </a>
            `;
        });

        html += `</div></aside>`;
        return html;
    };

    const updateSeoSchema = (article) => {
        const schemaTag = document.getElementById('seo-news-schema');
        if (!schemaTag) return;

        const currentUrl = window.location.origin + window.location.pathname + '?id=' + encodeURIComponent(article.id);

        schemaTag.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": currentUrl
            },
            "headline": article.title,
            "image": [window.location.origin + '/' + article.image],
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
    };

    const renderArticle = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');

        // Si aucun ID n'est fourni, rediriger vers la liste des actualités
        if (!articleId) {
            window.location.href = 'actualites.html';
            return;
        }

        let allArticles = [];

        if (window.NewsData && typeof window.NewsData.loadArticles === 'function') {
            allArticles = await window.NewsData.loadArticles();
        } else {
            console.error('news-data.js n\'est pas chargé.');
            articleContainer.innerHTML = `
                <div style="text-align:center; padding:60px 20px; color:#64748b;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; margin-bottom:15px; display:block;"></i>
                    <p>Impossible de charger les articles. Veuillez réessayer plus tard.</p>
                    <a href="actualites.html" class="btn btn-primary" style="margin-top:20px;">Retour aux actualités</a>
                </div>
            `;
            return;
        }

        const article = allArticles.find(a => a.id === articleId);

        if (!article) {
            articleContainer.innerHTML = `
                <div style="text-align:center; padding:60px 20px; color:#64748b;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size:2rem; margin-bottom:15px; display:block;"></i>
                    <p>Article introuvable.</p>
                    <a href="actualites.html" class="btn btn-primary" style="margin-top:20px;">Retour aux actualités</a>
                </div>
            `;
            return;
        }

        const rawContent = window.DOMPurify
            ? DOMPurify.sanitize(article.content, { USE_PROFILES: { html: true } })
            : article.content;

        const currentUrl = window.location.origin + window.location.pathname + '?id=' + encodeURIComponent(article.id);

        // Injection du contenu complet
        articleContainer.innerHTML = `
            <header class="post-header">
                <span class="post-date">${article.dateFormatted || article.date}</span>
                <h1 class="post-title">${article.title}</h1>
                <ul class="post-categories">
                    <li>${article.category}</li>
                </ul>
            </header>

            ${renderMedia(article)}
            ${renderVideo(article)}

            <div class="post-content wysiwyg">
                ${prepareArticleContent(rawContent)}
            </div>

            <div class="post-share">
                <span class="share-label">Partager cet article</span>
                <div class="social-links">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}" target="_blank" class="social-btn facebook" aria-label="Partager sur Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                    <a href="https://wa.me/?text=${encodeURIComponent(article.title + ' : ' + currentUrl)}" target="_blank" class="social-btn whatsapp" aria-label="Partager sur WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                    <button id="copy-link-btn" class="social-btn link" title="Copier le lien" aria-label="Copier le lien"><i class="fa-solid fa-link"></i></button>
                </div>
            </div>

            ${renderRelated(article, allArticles)}
        `;

        // Gestion du bouton copier le lien
        const copyBtn = document.getElementById('copy-link-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(currentUrl);
                alert('Lien de l\'article copié !');
            });
        }

        // Mise à jour du titre de la page et du SEO
        document.title = article.title + ' | N.I. CONSEILS-MANAGEMENTS';
        updateSeoSchema(article);
    };

    try {
        await renderArticle();
    } catch (error) {
        console.error('Erreur lors du rendu de l\'article:', error);
        if (articleContainer) {
            articleContainer.innerHTML = `
                <div style="text-align:center; padding:60px 20px; color:#64748b;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; margin-bottom:15px; display:block;"></i>
                    <p>Une erreur est survenue lors du chargement de l'article.</p>
                    <a href="actualites.html" class="btn btn-primary" style="margin-top:20px;">Retour aux actualités</a>
                </div>
            `;
        }
    }
});
