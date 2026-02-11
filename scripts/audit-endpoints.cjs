const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();

const sharedEndpointsPath = path.join(repoRoot, 'packages', 'shared-api', 'src', 'endpoints.ts');
const routeRegistrarPath = path.join(repoRoot, 'apps', 'worker', 'src', 'core', 'route-registrar.ts');
const portalApiDir = path.join(repoRoot, 'apps', 'portal', 'src', 'lib', 'api');

function readFile(p) {
  return fs.readFileSync(p, 'utf8');
}

function parseSharedEndpoints(contents) {
  const endpoints = [];
  const regex = /method:\s*'([A-Z]+)'\s*,\s*path:\s*'([^']+)'/g;
  let match;
  while ((match = regex.exec(contents))) {
    endpoints.push({ method: match[1], path: match[2] });
  }
  return endpoints;
}

function parseRouteRegistrar(contents) {
  const importRegex = /import\s+\*\s+as\s+(\w+)\s+from\s+'([^']+)'/g;
  const imports = new Map();
  let match;
  while ((match = importRegex.exec(contents))) {
    imports.set(match[1], match[2]);
  }

  const routeRegex = /'([^']+)'\s*:\s*([A-Za-z0-9_]+)/g;
  const routes = [];
  while ((match = routeRegex.exec(contents))) {
    const routePath = match[1];
    const handlerName = match[2];
    if (!imports.has(handlerName)) continue;
    routes.push({ path: routePath, handler: handlerName, modulePath: imports.get(handlerName) });
  }

  return routes;
}

function resolveModulePath(fromFile, importPath) {
  const baseDir = path.dirname(fromFile);
  const resolved = path.resolve(baseDir, importPath) + '.ts';
  if (fs.existsSync(resolved)) return resolved;
  const resolvedIndex = path.resolve(baseDir, importPath, 'index.ts');
  if (fs.existsSync(resolvedIndex)) return resolvedIndex;
  return null;
}

function parseModuleMethods(contents) {
  const methods = new Set();
  const methodRegex = /export\s+const\s+onRequest(Get|Post|Put|Patch|Delete)\b/g;
  let match;
  while ((match = methodRegex.exec(contents))) {
    methods.add(match[1].toUpperCase());
  }
  return Array.from(methods);
}

function normalizePathPattern(p) {
  // keep as-is
  return p;
}

function mapWorkerEndpoints(routes) {
  const endpointMap = new Map();

  for (const route of routes) {
    const moduleFile = resolveModulePath(routeRegistrarPath, route.modulePath);
    if (!moduleFile) continue;
    const moduleContents = readFile(moduleFile);
    const methods = parseModuleMethods(moduleContents);
    const pathKey = normalizePathPattern(route.path);

    if (!endpointMap.has(pathKey)) endpointMap.set(pathKey, new Set());
    const methodSet = endpointMap.get(pathKey);
    for (const method of methods) {
      methodSet.add(method);
    }
  }

  const endpoints = [];
  for (const [p, methods] of endpointMap.entries()) {
    for (const method of methods) {
      endpoints.push({ method, path: p });
    }
  }

  return endpoints;
}

function parseFrontendUsage() {
  const used = [];
  const files = fs.readdirSync(portalApiDir)
    .filter((name) => name.endsWith('.ts') || name.endsWith('.tsx'))
    .map((name) => path.join(portalApiDir, name));

  for (const file of files) {
    const contents = readFile(file);

    const typedRegex = /typedAPI\.(\w+)\.(\w+)/g;
    let match;
    while ((match = typedRegex.exec(contents))) {
      used.push({ type: 'typed', group: match[1], name: match[2], file: path.relative(repoRoot, file) });
    }

    const apiRegex = /api\.(get|post|put|delete|patch)\s*<[^>]*>\s*\(\s*([`'])([^`']+)\2/gi;
    while ((match = apiRegex.exec(contents))) {
      used.push({ type: 'raw', method: match[1].toUpperCase(), path: match[3], file: path.relative(repoRoot, file) });
    }

    const apiRegexNoGeneric = /api\.(get|post|put|delete|patch)\s*\(\s*([`'])([^`']+)\2/gi;
    while ((match = apiRegexNoGeneric.exec(contents))) {
      used.push({ type: 'raw', method: match[1].toUpperCase(), path: match[3], file: path.relative(repoRoot, file) });
    }
  }

  return used;
}

function mapTypedUsageToEndpoints(typedUsage, sharedIndex) {
  const usedEndpoints = [];
  for (const entry of typedUsage) {
    const key = `${entry.group}.${entry.name}`;
    const endpoint = sharedIndex.get(key);
    if (!endpoint) {
      usedEndpoints.push({ ...entry, resolved: null });
      continue;
    }
    usedEndpoints.push({ ...entry, resolved: endpoint });
  }
  return usedEndpoints;
}

function buildSharedIndex(contents) {
  const groupRegex = /([a-zA-Z0-9_]+):\s*\{([\s\S]*?)\n\s*\}/g;
  const index = new Map();
  let match;
  while ((match = groupRegex.exec(contents))) {
    const groupName = match[1];
    const groupBody = match[2];

    const endpointRegex = /(\w+):\s*\{\s*method:\s*'([A-Z]+)'\s*,\s*path:\s*'([^']+)'\s*\}/g;
    let endpointMatch;
    while ((endpointMatch = endpointRegex.exec(groupBody))) {
      const name = endpointMatch[1];
      const method = endpointMatch[2];
      const pathValue = endpointMatch[3];
      index.set(`${groupName}.${name}`, { method, path: pathValue });
    }
  }
  return index;
}

function matchPathPattern(pathPattern, actualPath) {
  if (pathPattern === actualPath) return true;
  const regex = new RegExp('^' + pathPattern.replace(/:[^/]+/g, '[^/]+') + '$');
  return regex.test(actualPath);
}

function run() {
  const sharedContents = readFile(sharedEndpointsPath);
  const sharedEndpoints = parseSharedEndpoints(sharedContents);
  const sharedIndex = buildSharedIndex(sharedContents);

  const routeRegistrar = readFile(routeRegistrarPath);
  const routes = parseRouteRegistrar(routeRegistrar);
  const workerEndpoints = mapWorkerEndpoints(routes);

  const sharedSet = new Set(sharedEndpoints.map(e => `${e.method} ${e.path}`));
  const workerSet = new Set(workerEndpoints.map(e => `${e.method} ${e.path}`));

  const missingInWorker = sharedEndpoints.filter(e => !workerSet.has(`${e.method} ${e.path}`));
  const missingInShared = workerEndpoints.filter(e => !sharedSet.has(`${e.method} ${e.path}`));

  const frontendUsage = parseFrontendUsage();
  const typedUsage = frontendUsage.filter(u => u.type === 'typed');
  const rawUsage = frontendUsage.filter(u => u.type === 'raw');

  const typedResolved = mapTypedUsageToEndpoints(typedUsage, sharedIndex);
  const typedMissing = typedResolved.filter(u => !u.resolved);

  const rawUnmatched = [];
  for (const raw of rawUsage) {
    const matched = sharedEndpoints.some(e => e.method === raw.method && matchPathPattern(e.path, raw.path));
    if (!matched) {
      rawUnmatched.push(raw);
    }
  }

  const report = {
    sharedCount: sharedEndpoints.length,
    workerCount: workerEndpoints.length,
    missingInWorker,
    missingInShared,
    typedMissing,
    rawUnmatched,
  };

  console.log(JSON.stringify(report, null, 2));

  if (missingInWorker.length || missingInShared.length || typedMissing.length || rawUnmatched.length) {
    process.exitCode = 1;
  }
}

run();
