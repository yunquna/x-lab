const EXTERNAL_URL_RE = /^(?:[a-z]+:|\/\/)/i

function normalizeBase(base = '/') {
  if (!base) {
    return '/'
  }

  return base.endsWith('/') ? base : `${base}/`
}

function joinPath(base, path) {
  return `${base}${path}`.replace(/\/+/g, '/')
}

export function resolveWithBase(base, path) {
  if (!path || EXTERNAL_URL_RE.test(path) || !path.startsWith('/')) {
    return path
  }

  const normalizedBase = normalizeBase(base)

  if (normalizedBase !== '/' && (path === normalizedBase.slice(0, -1) || path.startsWith(normalizedBase))) {
    return path
  }

  return joinPath(normalizedBase, path)
}

export function normalizePluginAssets(plugin, base) {
  return {
    ...plugin,
    download_url: resolveWithBase(base, plugin.download_url),
    icon: resolveWithBase(base, plugin.icon),
    preview: resolveWithBase(base, plugin.preview),
  }
}
