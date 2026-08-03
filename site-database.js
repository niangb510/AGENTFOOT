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

    const cfg = getStoredConfig();
    const url = cfg.supabaseUrl || "";
    const key = cfg.supabaseKey || "";

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
            if (supabaseUrl && supabaseKey && typeof supabase !== 'undefined') {
                try {
                    client = supabase.createClient(supabaseUrl, supabaseKey);
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
