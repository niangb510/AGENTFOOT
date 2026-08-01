/**
 * N.I. CONSEILS-MANAGEMENTS - Site Config & Client-Side CMS Engine
 * Allows dynamic content customization from the admin panel using localStorage.
 * Note: localStorage is browser-specific. Use export/import to share settings.
 */
(function() {
    'use strict';

    // Default configuration
    const defaultConfig = {
        // Identity
        agencyName: "N.I. CONSEILS-MANAGEMENTS",
        agencyNameShort: "N.I. CONSEILS",
        footerText: "Votre partenaire de confiance pour une carrière au sommet.",

        // Branding
        logo: 'assets/images/logo.png',
        heroCover: 'assets/images/hero.webp',
        agentCover: 'assets/images/hero.webp',
        favicon: '',

        // Typography
        fontFamily: "'Outfit', sans-serif",
        fontUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;800&display=swap",

        // Colors
        primaryColor: "#0f172a",
        secondaryColor: "#d97706",
        accentColor: "#38bdf8",

        // Hero content
        heroTitle: "N.I. CONSEILS-MANAGEMENTS",
        heroSubtitle: "Gestion de carrière pour joueurs ambitieux",
        heroDescription: "Nous transformons le talent en succès durable. Une approche personnalisée pour atteindre les sommets du football mondial.",

        // Contact
        phone: "+226 74 80 60 22",
        phone2: "+226 75 08 73 16",
        whatsapp: "22674806022",
        email: "n.iconseilsmanagements.fr@gmail.com",
        address: "OUAGADOUGOU 02 BP 6041 OUAGA 02\nLOT: 25 section : 761, PARCELLE : 02, SECTEUR : 34\nBURKINA FASO",

        // Social
        facebook: "https://www.facebook.com/ibrahim.niang.7",
        instagram: "https://www.instagram.com/ibrahim_niang_10",
        twitter: "",

        // Legal
        rccm: "BF-OUA-01-2023-B12-05162",
        ifu: "00201348P",

        // Meta
        metaDescription: "Gestion de carrière pour joueurs de football ambitieux. Transferts, négociation, marketing.",

        // Page-specific sections (plain text only, no HTML for security)
        playersHeaderTitle: "Nos Talents",
        playersHeaderSubtitle: "Découvrez les joueurs qui nous font confiance.",
        servicesHeaderTitle: "Nos Services",
        servicesHeaderSubtitle: "Un accompagnement à 360° pour votre carrière.",
        contactHeaderTitle: "Contactez-nous",
        contactHeaderSubtitle: "Prêt à passer au niveau supérieur ?",
        newsHeaderTitle: "Actualités & Fil Info",
        newsHeaderSubtitle: "Suivez en direct les performances, signatures et l'actualité de nos talents.",
        agentHeaderTitle: "L'Agence & L'Agent",
        agentHeaderSubtitle: "Une expertise reconnue au service de votre réussite."
    };

    // Load saved configuration
    let savedConfig = {};
    try {
        savedConfig = JSON.parse(localStorage.getItem('ni_site_custom_config') || '{}');
    } catch (e) {
        console.warn('Erreur lecture config CMS:', e);
    }

    const config = { ...defaultConfig, ...savedConfig };

    /**
     * Apply the configuration to the current page
     */
    function applySiteConfig(cfg) {
        if (!cfg) return;

        const root = document.documentElement;

        // 1. Colors
        if (cfg.primaryColor) root.style.setProperty('--primary-color', cfg.primaryColor);
        if (cfg.secondaryColor) root.style.setProperty('--secondary-color', cfg.secondaryColor);
        if (cfg.accentColor) root.style.setProperty('--accent-color', cfg.accentColor);

        // 2. Font family
        if (cfg.fontFamily) {
            root.style.setProperty('--font-main', cfg.fontFamily);
            if (document.body) document.body.style.fontFamily = cfg.fontFamily;
        }
        if (cfg.fontUrl) {
            let fontLink = document.getElementById('dynamic-google-font');
            if (!fontLink) {
                fontLink = document.createElement('link');
                fontLink.id = 'dynamic-google-font';
                fontLink.rel = 'stylesheet';
                document.head.appendChild(fontLink);
            }
            fontLink.href = cfg.fontUrl;
        }

        // 3. Logo
        if (cfg.logo) {
            document.querySelectorAll('.logo img').forEach(img => {
                img.src = cfg.logo;
            });
        }

        // 3bis. Favicon
        if (cfg.favicon) {
            let faviconLink = document.querySelector('link[rel="icon"]');
            if (!faviconLink) {
                faviconLink = document.createElement('link');
                faviconLink.rel = 'icon';
                document.head.appendChild(faviconLink);
            }
            faviconLink.href = cfg.favicon;
        }

        // 4. Hero / Agent hero backgrounds
        if (cfg.heroCover) {
            document.querySelectorAll('.hero').forEach(hero => {
                hero.style.backgroundImage = `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.8)), url('${cfg.heroCover}')`;
            });
        }
        if (cfg.agentCover) {
            document.querySelectorAll('.agent-hero').forEach(hero => {
                hero.style.backgroundImage = `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url('${cfg.agentCover}')`;
            });
        }

        // 5. Social links
        updateSocialLinks(cfg);

        // 6. Meta description
        if (cfg.metaDescription) {
            document.querySelectorAll('meta[name="description"]').forEach(meta => {
                meta.setAttribute('content', cfg.metaDescription);
            });
            document.querySelectorAll('meta[property="og:description"]').forEach(meta => {
                meta.setAttribute('content', cfg.metaDescription);
            });
        }

        // 7. Generic data-cms bindings
        bindCmsText(cfg);
        bindCmsHref(cfg);
    }

    function updateSocialLinks(cfg) {
        if (cfg.facebook) {
            document.querySelectorAll('a[href*="facebook.com"]').forEach(el => {
                el.href = cfg.facebook;
            });
        }
        if (cfg.instagram) {
            document.querySelectorAll('a[href*="instagram.com"]').forEach(el => {
                el.href = cfg.instagram;
            });
        }
        if (cfg.twitter) {
            document.querySelectorAll('a[href*="twitter.com"], a[aria-label*="Twitter"]').forEach(el => {
                if (cfg.twitter) el.href = cfg.twitter;
            });
        }
        if (cfg.whatsapp) {
            document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
                el.href = `https://wa.me/${cfg.whatsapp}?text=Bonjour%20Ibrahim,%20je%20vous%20contacte%20depuis%20votre%20site.`;
            });
        }
    }

    function bindCmsText(cfg) {
        document.querySelectorAll('[data-cms]').forEach(el => {
            const key = el.getAttribute('data-cms');
            if (cfg[key] !== undefined && cfg[key] !== null) {
                el.textContent = cfg[key];
            }
        });

        // Multi-line text (preserves line breaks as <br> for display-only non-HTML content)
        document.querySelectorAll('[data-cms-lines]').forEach(el => {
            const key = el.getAttribute('data-cms-lines');
            if (cfg[key] !== undefined && cfg[key] !== null) {
                el.innerHTML = escapeHtml(cfg[key]).replace(/\n/g, '<br>');
            }
        });
    }

    function bindCmsHref(cfg) {
        document.querySelectorAll('[data-cms-href]').forEach(el => {
            const key = el.getAttribute('data-cms-href');
            if (cfg[key]) {
                el.href = cfg[key];
            }
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Expose globally
    window.niCmsConfig = {
        defaultConfig,
        config,
        applySiteConfig,
        save: function(cfg) {
            localStorage.setItem('ni_site_custom_config', JSON.stringify(cfg));
        },
        reset: function() {
            localStorage.removeItem('ni_site_custom_config');
        },
        export: function() {
            return JSON.stringify(config, null, 2);
        },
        import: function(jsonString) {
            const parsed = JSON.parse(jsonString);
            localStorage.setItem('ni_site_custom_config', JSON.stringify(parsed));
            return parsed;
        }
    };

    // Apply on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applySiteConfig(config));
    } else {
        applySiteConfig(config);
    }
})();
