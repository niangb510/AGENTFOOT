/**
 * N.I. CONSEILS-MANAGEMENTS - Cloud Database Manager
 * Handles syncing key-value data with Supabase backend.
 */
(function() {
    'use strict';

    // Helper to read configuration directly from localStorage to bootstrap
    function getStoredConfig() {
        try {
            const raw = localStorage.getItem('ni_site_custom_config');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    // Clés publiques Supabase intégrées par défaut.
    // La clé anon est conçue pour être publique (elle est déjà visible dans le
    // code du site). Grâce à ces valeurs par défaut, CHAQUE visiteur se connecte
    // automatiquement à la base cloud et voit les dernières modifications
    // (articles, joueurs, photos...) sans avoir à configurer quoi que ce soit.
    // NOTE MAINTENANCE : si la clé anon est régénérée dans le dashboard
    // Supabase, mettre à jour DEFAULT_SUPABASE_KEY ici, sinon le site se
    // déconnectera silencieusement du cloud.
    const DEFAULT_SUPABASE_URL = "https://sknyzontcxwohnjuvztb.supabase.co";
    const DEFAULT_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrbnl6b250Y3h3b2huanV2enRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3NDQ5MjQsImV4cCI6MjEwMTMyMDkyNH0.pxZMVD_TpFZstfzNtClv8nMPpPbQCCKb3LbDEKMhOOg";

    const cfg = getStoredConfig();
    const url = cfg.supabaseUrl || DEFAULT_SUPABASE_URL;
    const key = cfg.supabaseKey || DEFAULT_SUPABASE_KEY;

    let client = null;
    if (url && key && typeof supabase !== 'undefined') {
        try {
            client = supabase.createClient(url, key);
        } catch (e) {
            console.error('Erreur initialisation Supabase client:', e);
        }
    }

    window.SiteDatabase = {
        getClient: () => client,
        isEnabled: () => client !== null,
        
        init: (supabaseUrl, supabaseKey) => {
            const u = supabaseUrl || DEFAULT_SUPABASE_URL;
            const k = supabaseKey || DEFAULT_SUPABASE_KEY;
            if (u && k && typeof supabase !== 'undefined') {
                try {
                    client = supabase.createClient(u, k);
                    return true;
                } catch (e) {
                    console.error('Erreur init Supabase:', e);
                }
            }
            client = null;
            return false;
        },

        // Fetch all key-value rows from the site_data table
        fetchAll: async () => {
            if (!client) return null;
            try {
                const { data, error } = await client.from('site_data').select('key, value');
                if (error) throw error;
                return data;
            } catch (err) {
                console.error('Erreur fetchAll site_data:', err);
                return null;
            }
        },

        // Upsert a single key-value row into the site_data table
        setValue: async (rowKey, rowValue) => {
            if (!client) return false;
            try {
                const { data, error } = await client
                    .from('site_data')
                    .upsert({ key: rowKey, value: rowValue });
                if (error) throw error;
                return true;
            } catch (err) {
                console.error(`Erreur setValue pour [${rowKey}]:`, err);
                return false;
            }
        },

        // Push ALL site data currently stored locally to the cloud.
        // Used to upload pre-existing content (articles, players, services,
        // agent page, config) that was created before Supabase was configured.
        pushAll: async () => {
            if (!client) return { ok: false, pushed: 0, total: 0 };
            const keys = [
                'ni_site_custom_config',
                'custom_news_articles',
                'deleted_news_ids',
                'ni_site_players',
                'ni_site_services',
                'ni_site_agent'
            ];
            let pushed = 0;
            let total = 0;
            for (const k of keys) {
                try {
                    const raw = localStorage.getItem(k);
                    if (raw === null) continue;
                    total++;
                    const val = JSON.parse(raw);
                    const ok = await window.SiteDatabase.setValue(k, val);
                    if (ok) pushed++;
                } catch (err) {
                    console.warn(`pushAll skip [${k}]:`, err);
                }
            }
            return { ok: total > 0 && pushed === total, pushed, total };
        }
    };

    // Background Synchronization Engine
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.SiteDatabase.isEnabled()) {
            console.log('Base de données Supabase non configurée. Utilisation du stockage local.');
            return;
        }

        console.log('Base de données Supabase détectée. Synchronisation en cours...');
        window.SiteDatabase.fetchAll().then(data => {
            if (!data || !Array.isArray(data)) return;

            let needsReload = false;
            let configChanged = false;
            let dataChanged = false;

            data.forEach(row => {
                const oldVal = localStorage.getItem(row.key);
                const newValString = JSON.stringify(row.value);
                if (oldVal !== newValString) {
                    localStorage.setItem(row.key, newValString);
                    if (row.key === 'ni_site_custom_config') {
                        configChanged = true;
                    } else if (['ni_site_players', 'ni_site_services', 'ni_site_agent'].includes(row.key)) {
                        dataChanged = true;
                    } else {
                        needsReload = true; // Articles, news deletions, etc.
                    }
                }
            });

            // If config has changed, re-apply site configuration live
            if (configChanged && window.niCmsConfig) {
                console.log('Mise à jour de la configuration de design...');
                const defaultConfig = window.niCmsConfig.defaultConfig;
                const savedConfig = JSON.parse(localStorage.getItem('ni_site_custom_config') || '{}');
                const mergedConfig = Object.assign({}, defaultConfig, savedConfig);
                window.niCmsConfig.config = mergedConfig;
                window.niCmsConfig.applySiteConfig(mergedConfig);
            }

            // If players, services, or agent data has changed, re-render live
            if (dataChanged && window.SiteData) {
                console.log('Mise à jour des données (Joueurs/Services/Agent)...');
                window.SiteData.renderPlayers();
                window.SiteData.renderServices();
                window.SiteData.renderAgent();
            }

            // If actualites/article/admin is open and news articles changed, reload
            const hasNewsContainer = document.getElementById('news-container');
            const isArticlePage = window.location.pathname.includes('article.html');
            const isAdminPage = window.location.pathname.includes('admin.html');

            if ((needsReload || dataChanged) && (hasNewsContainer || isArticlePage) && !isAdminPage) {
                console.log('Nouvel article ou modification d\'article détecté. Rechargement de la page...');
                window.location.reload();
            }
        }).catch(err => {
            console.warn('Erreur lors de la synchronisation Supabase:', err);
        });
    });
})();
