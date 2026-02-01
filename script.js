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
});
