// Tests de DEC-006 (DEV sin Analytics). Corren con: node --test tests/*.test.cjs
// - index.html: Google Analytics se carga solo en el host de producción.
// - github-metrics-to-ga4.yml: el envío de métricas solo corre en el repo de producción.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const GA_ID = 'G-LB782QT9TR';

function loaderSource() {
  const m = html.match(/<script id="ga-loader">([\s\S]*?)<\/script>/);
  assert.ok(m, 'falta <script id="ga-loader"> en index.html');
  return m[1];
}

// Ejecuta el cargador como lo haría el navegador en una URL dada.
function runAt(url) {
  const u = new URL(url);
  const appended = [];
  const ctx = {
    location: { hostname: u.hostname, pathname: u.pathname },
    document: {
      createElement: (tag) => ({ tag }),
      head: { appendChild: (el) => appended.push(el) },
    },
    Date,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(loaderSource(), ctx);
  // Array.from copia al realm del test (los arrays del contexto vm no son deepEqual).
  const commands = Array.from(ctx.dataLayer, (args) => Array.from(args));
  return { appended, commands, enabled: ctx.__gaEnabled, gtag: ctx.gtag };
}

test('producción carga gtag.js y configura el ID de GA', () => {
  for (const url of [
    'https://pablosnchz.github.io/gw2-wallet-ligero/',
    'https://pablosnchz.github.io/gw2-wallet-ligero/index.html#wallet',
    'https://pablosnchz.github.io/gw2-wallet-ligero',
  ]) {
    const r = runAt(url);
    assert.equal(r.enabled, true, url);
    assert.equal(r.appended.length, 1, url);
    assert.equal(r.appended[0].src, 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID);
    assert.equal(r.appended[0].async, true);
    assert.deepEqual(r.commands.map((c) => c[0]), ['js', 'config']);
    assert.equal(r.commands[1][1], GA_ID);
  }
});

test('DEV, previews y local no cargan GA ni configuran nada', () => {
  for (const url of [
    'https://pablosnchz.github.io/gw2-factory-dev/',
    'https://pablosnchz.github.io/gw2-wallet-agents/',
    'https://pablosnchz.github.io/gw2-wallet-ligero-dev/',
    'https://pablosnchz.github.io/otro/gw2-wallet-ligero/',
    'https://gw2-factory-dev.vercel.app/',
    'https://gw2-factory-dev-git-feature-x-pablo.vercel.app/gw2-wallet-ligero/',
    'http://localhost:8080/',
    'http://127.0.0.1:5500/index.html',
  ]) {
    const r = runAt(url);
    assert.equal(r.enabled, false, url);
    assert.equal(r.appended.length, 0, url);
    assert.deepEqual(r.commands, [], url);
  }
});

test('gtag existe siempre, así js/analytics.js no rompe en DEV', () => {
  const r = runAt('https://pablosnchz.github.io/gw2-factory-dev/');
  assert.equal(typeof r.gtag, 'function');
});

test('index.html no carga gtag.js por fuera del cargador', () => {
  const outside = html.replace(/<script id="ga-loader">[\s\S]*?<\/script>/, '');
  assert.ok(!/googletagmanager\.com/.test(outside), 'gtag.js aparece fuera del cargador');
  assert.ok(!outside.includes(GA_ID), 'el ID de GA aparece fuera del cargador');
});

test('el workflow de métricas GA4 solo corre en el repo de producción', () => {
  const yml = fs.readFileSync(path.join(ROOT, '.github/workflows/github-metrics-to-ga4.yml'), 'utf8');
  const job = yml.split(/\n  send-metrics:\n/)[1];
  assert.ok(job, 'falta el job send-metrics');
  const header = job.split(/\n    steps:\n/)[0];
  assert.match(header, /^    if: github\.repository == 'PabloSnchz\/gw2-wallet-ligero'$/m);
});
