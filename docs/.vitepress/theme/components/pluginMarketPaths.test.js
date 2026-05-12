import test from 'node:test'
import assert from 'node:assert/strict'

import {
  normalizePluginAssets,
  resolveWithBase,
} from './pluginMarketPaths.js'

test('resolveWithBase keeps root-relative paths in dev', () => {
  assert.equal(resolveWithBase('/', '/plugins/demo/v1.0.0.zip'), '/plugins/demo/v1.0.0.zip')
})

test('resolveWithBase prefixes production base once', () => {
  assert.equal(resolveWithBase('/x-lab/', '/plugins/demo/v1.0.0.zip'), '/x-lab/plugins/demo/v1.0.0.zip')
})

test('resolveWithBase does not double-prefix an already prefixed path', () => {
  assert.equal(resolveWithBase('/x-lab/', '/x-lab/plugins/demo/v1.0.0.zip'), '/x-lab/plugins/demo/v1.0.0.zip')
})

test('resolveWithBase keeps protocol-relative URLs untouched', () => {
  assert.equal(resolveWithBase('/x-lab/', '//cdn.example.com/demo.zip'), '//cdn.example.com/demo.zip')
})

test('normalizePluginAssets rewrites plugin resource fields and keeps unrelated data', () => {
  const plugin = {
    id: 'demo',
    name: 'Demo Plugin',
    download_url: '/plugins/demo/v1.0.0.zip',
    icon: '/plugins/demo/icon.png',
    preview: '/plugins/demo/preview.png',
    install_guide: 'unchanged',
  }

  assert.deepEqual(normalizePluginAssets(plugin, '/x-lab/'), {
    ...plugin,
    download_url: '/x-lab/plugins/demo/v1.0.0.zip',
    icon: '/x-lab/plugins/demo/icon.png',
    preview: '/x-lab/plugins/demo/preview.png',
  })
})
