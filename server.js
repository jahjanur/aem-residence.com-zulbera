/**
 * Hostinger entry file: starts the AEM Residence API (Express app).
 * The real app lives in apps/api; this file is required so Hostinger can run "node server.js".
 * Build must run first so that apps/api/dist/index.js exists.
 */
require('./apps/api/dist/index.js');
