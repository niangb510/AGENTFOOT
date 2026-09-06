/**
 * N.I. CONSEILS-MANAGEMENTS - Cloud Database Manager
 * Handles syncing key-value data with Supabase backend.
 * Optimized with Meta Version Caching to reduce Supabase egress bandwidth by >99%.
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

    // Local helper for DB Meta Version tracking
    function getLocalMetaVersion() {
        try {
            const raw = localStorage.getItem('ni_db_meta_version');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function saveLocalMetaVersion(meta) {
        try {
            localStorage.setItem('ni_db_meta_version', JSON.stringify(meta));
        } catch (e) {}
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

        // Fetch a single key from site_data
        fetchKey: async (rowKey) => {
            if (!client) return null;
            try {
                const { data, error } = await client
                    .from('site_data')
                    .select('key, value')
                    .eq('key', rowKey)
                    .maybeSingle();
                if (error) throw error;
                return data ? data.value : null;
            } catch (err) {
                console.error(`Erreur fetchKey [${rowKey}]:`, err);
                return null;
            }
        },

        // Upsert a single key-value row into the site_data table and update meta version
        setValue: async (rowKey, rowValue) => {
            if (!client) return false;
            try {
                const { error } = await client
                    .from('site_data')
                    .upsert({ key: rowKey, value: rowValue });
                if (error) throw error;

                // Update _meta_version timestamp for this key
                const meta = getLocalMetaVersion();
                meta[rowKey] = Date.now();
                saveLocalMetaVersion(meta);

                // Asynchronously update _meta_version in cloud
                client.from('site_data')
                    .upsert({ key: '_meta_version', value: meta })
                    .then(() => {})
                    .catch(() => {});

                return true;
            } catch (err) {
                console.error(`Erreur setValue pour [${rowKey}]:`, err);
                return false;
            }
        },

        // Push ALL site data currently stored locally to the cloud.
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
            const meta = getLocalMetaVersion();
            const now = Date.now();

            for (const k of keys) {
                try {
                    const raw = localStorage.getItem(k);
                    if (raw === null) continue;
                    total++;
                    const val = JSON.parse(raw);
                    const { error } = await client.from('site_data').upsert({ key: k, value: val });
                    if (!error) {
                        pushed++;
                        meta[k] = now;
                    }
                } catch (err) {
                    console.warn(`pushAll skip [${k}]:`, err);
                }
            }

            if (pushed > 0) {
                saveLocalMetaVersion(meta);
                await client.from('site_data').upsert({ key: '_meta_version', value: meta });
            }

            return { ok: total > 0 && pushed === total, pushed, total };
        }
    };

    // Optimized Bandwidth-Saving Background Sync Engine
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.SiteDatabase.isEnabled()) {
            console.log('Base de données Supabase non configurée. Utilisation du stockage local.');
            return;
        }

        console.log('Base de données Supabase connectée. Vérification des mises à jour...');

        // 1. First fetch ONLY _meta_version (TINY payload ~100 bytes)
        window.SiteDatabase.fetchKey('_meta_version').then(async (remoteMeta) => {
            const localMeta = getLocalMetaVersion();

            // If remoteMeta exists, check if any key has a newer timestamp than localMeta
            if (remoteMeta && typeof remoteMeta === 'object') {
                let keysToFetch = [];
                Object.keys(remoteMeta).forEach(k => {
                    if (k === '_meta_version') return;
                    if (!localMeta[k] || remoteMeta[k] > localMeta[k]) {
                        keysToFetch.push(k);
                    }
                });

                // Also check if any vital key is missing from local storage
                const vitalKeys = ['ni_site_custom_config', 'custom_news_articles', 'deleted_news_ids', 'ni_site_players', 'ni_site_services', 'ni_site_agent'];
                vitalKeys.forEach(vk => {
                    if (localStorage.getItem(vk) === null && !keysToFetch.includes(vk)) {
                        keysToFetch.push(vk);
                    }
                });

                // IF NOTHING CHANGED & NO VITAL KEY MISSING -> STOP HERE! (0 Bandwidth Wasted)
                if (keysToFetch.length === 0) {
                    console.log('⚡ Données à jour (cache local utilisé, 0 octet téléchargé).');
                    return;
                }

                console.log(`Clés à mettre à jour depuis le cloud : ${keysToFetch.join(', ')}`);
                let configChanged = false;
                let dataChanged = false;
                let newsChanged = false;

                for (const keyToFetch of keysToFetch) {
                    const newValue = await window.SiteDatabase.fetchKey(keyToFetch);
                    if (newValue !== null) {
                        localStorage.setItem(keyToFetch, JSON.stringify(newValue));
                        localMeta[keyToFetch] = remoteMeta[keyToFetch] || Date.now();

                        if (keyToFetch === 'ni_site_custom_config') configChanged = true;
                        else if (['ni_site_players', 'ni_site_services', 'ni_site_agent'].includes(keyToFetch)) dataChanged = true;
                        else newsChanged = true;
                    }
                }

                saveLocalMetaVersion(localMeta);

                // Update UI elements dynamically
                if (configChanged && window.niCmsConfig) {
                    console.log('Mise à jour du design...');
                    const defaultConfig = window.niCmsConfig.defaultConfig;
                    const savedConfig = JSON.parse(localStorage.getItem('ni_site_custom_config') || '{}');
                    const mergedConfig = Object.assign({}, defaultConfig, savedConfig);
                    window.niCmsConfig.config = mergedConfig;
                    window.niCmsConfig.applySiteConfig(mergedConfig);
                }

                if (dataChanged && window.SiteData) {
                    console.log('Re-rendu des joueurs, services, agent...');
                    window.SiteData.renderPlayers();
                    window.SiteData.renderServices();
                    window.SiteData.renderAgent();
                }

                const hasNewsContainer = document.getElementById('news-container');
                const isArticlePage = window.location.pathname.includes('article.html');
                const isAdminPage = window.location.pathname.includes('admin.html');

                if ((newsChanged || dataChanged) && (hasNewsContainer || isArticlePage) && !isAdminPage) {
                    console.log('Mise à jour des actualités. Rechargement...');
                    window.location.reload();
                }

            } else {
                // Fallback: remoteMeta doesn't exist yet (first time initialization)
                console.log('Première synchronisation cloud complète (initialisation meta)...');
                const allData = await window.SiteDatabase.fetchAll();
                if (!allData || !Array.isArray(allData)) return;

                const newMeta = {};
                allData.forEach(row => {
                    if (row.key !== '_meta_version') {
                        localStorage.setItem(row.key, JSON.stringify(row.value));
                        newMeta[row.key] = Date.now();
                    }
                });
                saveLocalMetaVersion(newMeta);
                await window.SiteDatabase.setValue('_meta_version', newMeta);
            }
        }).catch(err => {
            console.warn('Erreur lors de la synchronisation Supabase:', err);
        });
    });
})();
