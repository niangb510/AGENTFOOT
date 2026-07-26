/**
 * N.I. CONSEILS-MANAGEMENTS - Site Config & Dynamic CMS Loader
 * Permet la personnalisation dynamique du site depuis l'espace d'administration.
 */
(function() {
    // Configuration par défaut du site
    const defaultConfig = {
        logo: 'assets/images/logo.png',
        heroCover: 'assets/images/hero.png',
        fontFamily: "'Outfit', sans-serif",
        fontUrl: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;800&display=swap",
        primaryColor: "#0f172a",
        secondaryColor: "#d97706",
        agencyName: "N.I. CONSEILS-MANAGEMENTS",
        phone: "+226 74 80 60 22",
        whatsapp: "22674806022",
        email: "n.iconseilsmanagements.fr@gmail.com",
        facebook: "https://www.facebook.com/ibrahim.niang.7",
        instagram: "https://www.instagram.com/ibrahim_niang_10"
    };

    // Récupérer la configuration personnalisée enregistrée
    const savedConfig = JSON.parse(localStorage.getItem('ni_site_custom_config') || '{}');
    const config = { ...defaultConfig, ...savedConfig };

    // Appliquer la configuration au chargement du DOM
    document.addEventListener('DOMContentLoaded', () => {
        applySiteConfig(config);
    });

    window.applySiteConfig = function(cfg) {
        const root = document.documentElement;

        // 1. Couleurs principales
        if (cfg.primaryColor) root.style.setProperty('--primary-color', cfg.primaryColor);
        if (cfg.secondaryColor) root.style.setProperty('--secondary-color', cfg.secondaryColor);

        // 2. Police d'écriture
        if (cfg.fontFamily) {
            root.style.setProperty('--font-main', cfg.fontFamily);
            document.body.style.fontFamily = cfg.fontFamily;
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

        // 3. Logo (Navbar et Footer)
        if (cfg.logo) {
            document.querySelectorAll('.logo img').forEach(img => {
                img.src = cfg.logo;
            });
        }

        // 4. Photo de couverture / Hero Banner
        if (cfg.heroCover) {
            const heroElem = document.querySelector('.hero, .agent-hero');
            if (heroElem) {
                heroElem.style.backgroundImage = `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.9)), url('${cfg.heroCover}')`;
                heroElem.style.backgroundSize = 'cover';
                heroElem.style.backgroundPosition = 'center';
            }
        }

        // 5. Informations de contact
        if (cfg.phone) {
            document.querySelectorAll('.phone-number').forEach(el => el.innerText = cfg.phone);
        }
        if (cfg.whatsapp) {
            document.querySelectorAll('.whatsapp-float, a[href*="wa.me"]').forEach(el => {
                el.href = `https://wa.me/${cfg.whatsapp}?text=Bonjour%20Ibrahim,%20je%20vous%20contacte%20depuis%20votre%20site.`;
            });
        }
    };
})();
