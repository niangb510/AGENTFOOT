/* ==========================================
   SITE DATA - Moteur CMS complet (localStorage)
   Gère : joueurs, services, page agence, articles, config
   + Export / Import GLOBAL (tout le site)
   ========================================== */
(function () {
    'use strict';

    const LS_PLAYERS = 'ni_site_players';
    const LS_SERVICES = 'ni_site_services';
    const LS_AGENT = 'ni_site_agent';

    /* ------------------ DONNÉES PAR DÉFAUT ------------------ */

    const defaultPlayers = [
        {
            id: 'cyriaque-irie',
            name: 'Cyriaque Irié',
            badge: 'INTERNATIONAL',
            badgeColor: '',
            position: 'Ailier / Attaquant',
            age: '21 ans',
            club: 'SC Fribourg (Bundesliga)',
            clubLogo: '',
            nationality: 'International Burkinabé',
            extraLines: ['Pied Gauche'],
            bio: "Explosif et percutant. Révélation à Dijon, confirmé à Troyes et désormais en Bundesliga avec Fribourg, où il a déjà marqué lors d'un amical.",
            statsTitle: 'Stats Clés :',
            statsLines: [
                'Dijon (N1) : 26 matchs, 7 buts',
                'Troyes (L2) : 14 matchs, 2 buts',
                'Fribourg (amical 24/07/2026) : 1 but décisif'
            ],
            image: 'assets/images/cyriaque.webp',
            videoUrl: 'https://www.youtube.com/results?search_query=Cyriaque+Iri%C3%A9+highlights'
        },
        {
            id: 'kelvin-kwasi-adamtay',
            name: 'Kelvin Kwasi Adamtay',
            badge: 'NOUVEAU',
            badgeColor: '#d97706',
            position: 'Avant-centre / Ailier',
            age: '18 ans',
            club: 'Dijon FCO',
            clubLogo: 'assets/images/dijon.webp',
            nationality: 'Origine ghanéenne',
            extraLines: ['Académie Afca Burkina'],
            bio: "Avant-centre moderne et polyvalent. Formé à l'Académie Afca Burkina, il signe son premier contrat professionnel au Dijon FCO à 18 ans.",
            statsTitle: 'Parcours :',
            statsLines: [
                'Académie Afca Burkina',
                'Dijon FCO : 1er contrat pro (2026)'
            ],
            image: 'assets/images/player1.webp',
            videoUrl: 'https://www.youtube.com/results?search_query=Kelvin+Kwasi+Adamtay+highlights'
        },
        {
            id: 'bayala-joel',
            name: 'Bayala Joël',
            badge: 'NOUVEAU',
            badgeColor: '#d97706',
            position: 'Milieu de terrain',
            age: '19 ans',
            club: 'Dijon FCO',
            clubLogo: 'assets/images/dijon.webp',
            nationality: 'International Espoir Burkinabé',
            extraLines: ['Sporting Club de Tenakourou'],
            bio: "Milieu récupérateur et organisateur au talent pur. Issu du Sporting Club de Tenakourou, il rejoint le Dijon FCO après une saison remarquée en Fasofoot.",
            statsTitle: 'Parcours :',
            statsLines: [
                'Sporting Club de Tenakourou (Fasofoot)',
                'Dijon FCO : contrat pro (2026)'
            ],
            image: 'assets/images/player1.webp',
            videoUrl: 'https://www.youtube.com/results?search_query=Bayala+Jo%C3%ABl+highlights'
        }
    ];

    const defaultServices = [
        {
            id: 'gestion-carriere',
            icon: 'fa-solid fa-chess-knight',
            title: 'Gestion de Carrière',
            description: "Nous définissons ensemble un plan de carrière clair et ambitieux. Chaque choix est stratégique pour vous permettre d'atteindre vos objectifs sportifs.",
            points: [
                'Planification à court, moyen et long terme',
                'Analyse des opportunités sportives',
                'Suivi des performances et débriefing'
            ]
        },
        {
            id: 'transferts-negociation',
            icon: 'fa-solid fa-file-signature',
            title: 'Transferts & Négociation',
            description: "Notre expertise juridique et notre réseau nous permettent de négocier les meilleurs contrats pour vous, en protégeant vos intérêts avant tout.",
            points: [
                'Négociation salariale et primes',
                'Clauses libératoires et bonus',
                'Gestion des transferts internationaux'
            ]
        },
        {
            id: 'marketing-sponsoring',
            icon: 'fa-solid fa-bullhorn',
            title: 'Marketing & Sponsoring',
            description: "Votre image est un atout précieux. Nous vous aidons à la développer et à la monétiser auprès de marques prestigieuses.",
            points: [
                'Gestion des réseaux sociaux',
                'Recherche de sponsors et partenariats',
                'Relations presse et media training'
            ]
        },
        {
            id: 'accompagnement-vie-privee',
            icon: 'fa-solid fa-house-user',
            title: 'Accompagnement Vie Privée',
            description: "Pour que vous puissiez vous concentrer à 100% sur le terrain, nous vous assistons dans la gestion de votre quotidien.",
            points: [
                'Gestion de patrimoine et fiscalité',
                'Conciergerie de luxe',
                'Soutien à la famille'
            ]
        }
    ];

    const defaultAgent = {
        heroTitle: '',
        heroSubtitle: '',
        name: 'Ibrahim Niang',
        image: 'assets/images/agent/unnamed.webp',
        intro: "Fondée par Ibrahim Niang, un passionné du ballon rond originaire de Niangoloko au Burkina Faso, N.I. CONSEILS-MANAGEMENTS est le fruit d'un parcours riche et authentique. Installé dans la Nièvre depuis plus de 10 ans, Ibrahim a su transformer son expérience de joueur en une expertise de conseil reconnue.",
        visionTitle: 'Une Vision de Terrain',
        visionText: "Passé par de nombreux clubs (Burkina Faso, Sénégal, Algérie, Maroc) avant de s'installer en France, Ibrahim Niang possède une compréhension unique des défis auxquels font face les joueurs. Agent officiellement reconnu par la FIFA, il met aujourd'hui son réseau et son carnet d'adresses au service des talents de demain.",
        stat1Number: '10+',
        stat1Label: 'Clubs fréquentés',
        stat2Number: 'FIFA',
        stat2Label: 'Agent Licencié',
        timelineTitle: 'Mon Parcours',
        timelineSubtitle: "De la passion du terrain à l'expertise du management, découvrez les étapes clés de ma carrière.",
        timeline: [
            {
                date: 'Origines',
                title: "De Niangoloko à l'International",
                text: "Né au Burkina Faso, Ibrahim Niang forge son caractère et son talent sur les terrains du pays, puis s'exporte au Sénégal, en Algérie et au Maroc."
            },
            {
                date: '2014 - 2023',
                title: "L'Ancrage en France",
                text: "Arrivée dans la Nièvre. Joueur emblématique au SNID, RC Nevers-Challuy, US Cercy, La Machine et l'AS Charrin. Une connaissance parfaite du football régional et national français."
            },
            {
                date: 'Formation',
                title: 'La Transition',
                text: "Décision de mettre son expérience au profit des autres. Suivi de cours spécialisés et mentorat auprès d'agents expérimentés comme Pierre-Jean Mairesse."
            },
            {
                date: "Aujourd'hui",
                title: 'Agent Licencié FIFA',
                text: "Reconnaissance officielle par la FIFA. Lancement de N.I. CONSEILS-MANAGEMENTS pour faire éclore les carrières avec intégrité et professionnalisme."
            }
        ],
        galleryTitle: 'En Action',
        gallerySubtitle: "Quelques moments forts de mon parcours et de mes rencontres dans le milieu du football.",
        gallery: [
            'assets/images/agent/481247977_9177634898940919_2701165290340722272_n.webp',
            'assets/images/agent/486574011_9306001556104252_7275843342198295934_n.jpg',
            'assets/images/agent/506443391_9893369584034110_5142201735972524058_n.webp',
            'assets/images/agent/463658277_8403962779641472_2898967800483370328_n.webp',
            'assets/images/agent/492537016_9517619501609122_2719008199893929919_n.jpg',
            'assets/images/agent/492547691_9523694034335002_961695162708248134_n.jpg',
            'assets/images/agent/597570804_1983761392480548_4239413806129994270_n.webp'
        ]
    };

    /* ------------------ HELPERS STORAGE ------------------ */

    function readLS(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            const parsed = JSON.parse(raw);
            return parsed === null || parsed === undefined ? fallback : parsed;
        } catch (e) {
            console.warn('Erreur lecture localStorage', key, e);
            return fallback;
        }
    }

    function writeLS(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (err) {
            console.error('Erreur stockage localStorage [' + key + ']:', err);
            if (typeof alert === 'function') {
                alert('⚠️ Stockage du navigateur plein. Vos photos sont trop lourdes : supprimez d\'anciens contenus ou utilisez des images plus légères.');
            }
            return false;
        }
    }

    /* ------------------ GETTERS / SETTERS ------------------ */

    function getPlayers() {
        return readLS(LS_PLAYERS, defaultPlayers);
    }
    function savePlayers(list) {
        return writeLS(LS_PLAYERS, list);
    }

    function getServices() {
        return readLS(LS_SERVICES, defaultServices);
    }
    function saveServices(list) {
        return writeLS(LS_SERVICES, list);
    }

    function getAgent() {
        const saved = readLS(LS_AGENT, {});
        return Object.assign({}, defaultAgent, saved);
    }
    function saveAgent(obj) {
        return writeLS(LS_AGENT, obj);
    }

    /* ------------------ RENDU PAGES PUBLIQUES ------------------ */

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    function renderPlayers() {
        const grid = document.getElementById('player-grid');
        if (!grid) return;

        const players = getPlayers();
        if (!players.length) {
            grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#64748b;">Aucun joueur pour le moment.</p>';
            return;
        }

        // Fallback image via addEventListener (les handlers inline onerror sont bloqués par la CSP)
        grid.addEventListener('error', (e) => {
            const img = e.target;
            if (img.tagName === 'IMG' && img.dataset.fallback && !img.dataset.fallbackUsed) {
                img.dataset.fallbackUsed = '1';
                img.src = img.dataset.fallback;
            }
        }, true);

        grid.innerHTML = players.map((p, i) => `
            <div class="player-card reveal tilt-card shine-card js-reveal">
                ${p.badge ? `<div class="player-badge pulse-badge"${p.badgeColor ? ` style="background:${p.badgeColor};"` : ''}>${escapeHtml(p.badge)}</div>` : ''}
                <div class="player-img-container">
                    <img src="${p.image}" alt="${escapeHtml(p.name)}" class="player-img"
                        data-fallback="assets/images/player1.webp" loading="lazy" decoding="async">
                </div>
                <div class="player-info">
                    <h3 class="player-name">${escapeHtml(p.name)}</h3>
                    <div class="player-meta">
                        <span><i class="fa-solid fa-bolt"></i> ${escapeHtml(p.position)}</span>
                        <span>${escapeHtml(p.age)}</span>
                    </div>
                    <div class="player-club">
                        ${p.clubLogo ? `<img src="${p.clubLogo}" alt="${escapeHtml(p.club)}" class="club-logo-mini">` : ''}
                        ${escapeHtml(p.club)}
                    </div>
                    <div class="js-reveal stagger-1" style="margin-top: 10px; font-size: 0.85rem; color: #64748b;">
                        <p><i class="fa-solid fa-flag"></i> ${escapeHtml(p.nationality)}</p>
                        ${(p.extraLines || []).map(l => `<p><i class="fa-solid fa-shoe-prints"></i> ${escapeHtml(l)}</p>`).join('')}
                    </div>
                    <p class="js-reveal stagger-2" style="font-size: 0.9rem; margin-top: 10px;">${escapeHtml(p.bio)}</p>
                    <div class="js-reveal stagger-3"
                        style="background: #f8fafc; padding: 10px; border-radius: 8px; margin-top: 10px; font-size: 0.8rem;">
                        <strong>${escapeHtml(p.statsTitle)}</strong><br>
                        ${(p.statsLines || []).map(l => escapeHtml(l)).join('<br>')}
                    </div>
                    ${p.videoUrl ? `<a href="${p.videoUrl}" target="_blank" rel="noopener noreferrer" class="video-btn"><i class="fa-brands fa-youtube"></i> Voir Highlights</a>` : ''}
                </div>
            </div>
        `).join('');
    }

    function renderServices() {
        const container = document.getElementById('services-container');
        if (!container) return;

        const services = getServices();
        if (!services.length) {
            container.innerHTML = '<p style="text-align:center; color:#64748b;">Aucun service pour le moment.</p>';
            return;
        }

        container.innerHTML = services.map((s, i) => `
            <div class="service-row ${i % 2 === 0 ? 'js-reveal-left' : 'js-reveal-right'}">
                <div class="service-text">
                    <h2>${escapeHtml(s.title)}</h2>
                    <p>${escapeHtml(s.description)}</p>
                    <ul class="service-list">
                        ${(s.points || []).map(pt => `<li><i class="fa-solid fa-check"></i> ${escapeHtml(pt)}</li>`).join('')}
                    </ul>
                </div>
                <div class="service-icon-large">
                    <i class="${s.icon || 'fa-solid fa-star'}"></i>
                </div>
            </div>
        `).join('');
    }

    function renderAgent() {
        const agent = getAgent();

        // Hero
        const heroTitle = document.getElementById('agent-hero-title');
        const heroSubtitle = document.getElementById('agent-hero-subtitle');
        if (heroTitle) heroTitle.textContent = agent.heroTitle;
        if (heroSubtitle) heroSubtitle.textContent = agent.heroSubtitle;

        // Contenu principal
        const content = document.getElementById('agent-content');
        if (content) {
            content.innerHTML = `
                <div class="agent-img reveal float-image js-reveal">
                    <img src="${agent.image}" alt="${escapeHtml(agent.name)} - Agent FIFA"
                        style="width: 100%; height: auto; border-radius: 20px; display: block;" loading="lazy" decoding="async">
                </div>
                <div class="agent-text">
                    <h2 style="color: var(--primary-color);">${escapeHtml(agent.name)}</h2>
                    <p>${escapeHtml(agent.intro)}</p>
                    <h3>${escapeHtml(agent.visionTitle)}</h3>
                    <p>${escapeHtml(agent.visionText)}</p>
                    <div class="stat-grid">
                        <div class="stat-box js-reveal stagger-1">
                            <div class="stat-number">${escapeHtml(agent.stat1Number)}</div>
                            <div>${escapeHtml(agent.stat1Label)}</div>
                        </div>
                        <div class="stat-box js-reveal stagger-2">
                            <div class="stat-number">${escapeHtml(agent.stat2Number)}</div>
                            <div>${escapeHtml(agent.stat2Label)}</div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Titres sections
        const tlTitle = document.getElementById('agent-timeline-title');
        const tlSubtitle = document.getElementById('agent-timeline-subtitle');
        if (tlTitle) tlTitle.textContent = agent.timelineTitle;
        if (tlSubtitle) tlSubtitle.textContent = agent.timelineSubtitle;

        const galTitle = document.getElementById('agent-gallery-title');
        const galSubtitle = document.getElementById('agent-gallery-subtitle');
        if (galTitle) galTitle.textContent = agent.galleryTitle;
        if (galSubtitle) galSubtitle.textContent = agent.gallerySubtitle;

        // Timeline
        const timeline = document.getElementById('agent-timeline');
        if (timeline) {
            timeline.innerHTML = (agent.timeline || []).map((item, i) => `
                <div class="timeline-item ${i % 2 === 0 ? 'left js-reveal-left' : 'right js-reveal-right'} stagger-${(i % 4) + 1}">
                    <div class="timeline-content">
                        <span>${escapeHtml(item.date)}</span>
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.text)}</p>
                    </div>
                </div>
            `).join('');
        }

        // Galerie
        const gallery = document.getElementById('agent-gallery');
        if (gallery) {
            gallery.innerHTML = (agent.gallery || []).map((img, i) => `
                <div class="feature-card js-reveal stagger-${(i % 4) + 1}" style="padding: 10px; overflow: hidden;">
                    <img src="${img}" alt="${escapeHtml(agent.name)}" class="agent-gallery-img"
                        style="width: 100%; height: auto; border-radius: 10px;" loading="lazy" decoding="async">
                </div>
            `).join('');
        }
    }

    /* ------------------ EXPORT / IMPORT GLOBAL ------------------ */

    function getConfig() {
        if (window.niCmsConfig && window.niCmsConfig.config) {
            return window.niCmsConfig.config;
        }
        try {
            return JSON.parse(localStorage.getItem('ni_site_custom_config') || '{}');
        } catch (e) {
            return {};
        }
    }

    function exportAll() {
        return {
            meta: { app: 'NI-CMS', version: 1, exportedAt: new Date().toISOString() },
            config: getConfig(),
            articles: readLS('custom_news_articles', []),
            deletedArticleIds: readLS('deleted_news_ids', []),
            players: getPlayers(),
            services: getServices(),
            agent: getAgent()
        };
    }

    function importAll(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Données invalides');
        }

        if (data.config) {
            localStorage.setItem('ni_site_custom_config', JSON.stringify(data.config));
            if (window.niCmsConfig) {
                window.niCmsConfig.config = data.config;
                window.niCmsConfig.applySiteConfig(data.config);
            }
        }
        if (Array.isArray(data.articles)) {
            localStorage.setItem('custom_news_articles', JSON.stringify(data.articles));
        }
        if (Array.isArray(data.deletedArticleIds)) {
            localStorage.setItem('deleted_news_ids', JSON.stringify(data.deletedArticleIds));
        }
        if (Array.isArray(data.players)) {
            savePlayers(data.players);
        }
        if (Array.isArray(data.services)) {
            saveServices(data.services);
        }
        if (data.agent && typeof data.agent === 'object') {
            saveAgent(data.agent);
        }
    }

    function downloadAll() {
        const blob = new Blob([JSON.stringify(exportAll(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ni-cms-sauvegarde-complete.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /* ------------------ EXPOSITION ------------------ */

    window.SiteData = {
        defaultPlayers,
        defaultServices,
        defaultAgent,
        getPlayers,
        savePlayers,
        getServices,
        saveServices,
        getAgent,
        saveAgent,
        renderPlayers,
        renderServices,
        renderAgent,
        exportAll,
        importAll,
        downloadAll
    };

    // Rendu automatique sur les pages publiques
    document.addEventListener('DOMContentLoaded', () => {
        renderPlayers();
        renderServices();
        renderAgent();
    });
})();
