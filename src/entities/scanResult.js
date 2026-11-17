const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function sumRequests(ipStats) {
  return ipStats.reduce((total, ipStat) => total + (ipStat.requests || 0), 0);
}

function extractDomainCategoryNames(domainCategories) {
  const categoryNames = new Set();

  for (const entry of domainCategories) {
    const contentCategories = entry?.inherited?.content || [];
    const riskCategories = entry?.inherited?.risks || [];

    for (const category of [...contentCategories, ...riskCategories]) {
      if (category?.name) categoryNames.add(category.name);
    }
  }

  return [...categoryNames];
}

function calculateAgeInDays(dateValue) {
  if (!dateValue) return null;

  const timestamp = new Date(dateValue).getTime();
  if (Number.isNaN(timestamp)) return null;

  return Math.floor((Date.now() - timestamp) / MILLISECONDS_PER_DAY);
}

function createThreat({ verdict, stats, processors }) {
  return {
    categories: verdict.categories || [],
    tags: verdict.tags || [],
    phishingType: processors.phishing?.data || [],
    maliciousRequestCount: stats.malicious || 0,
  };
}

function createDomain({ page, processors }) {
  const whois = processors.whois?.data || {};

  return {
    name: page.domain || null,
    categories: extractDomainCategoryNames(processors.domainCategories?.data || []),
    rank: processors.radarRank?.data?.[0]?.rank ?? null,
    country: page.country || null,
    ip: page.ip || null,
    asn: page.asnname || null,
    createdAt: whois.created_date || null,
    ageDays: calculateAgeInDays(whois.created_date),
  };
}

function createPage({ page }) {
  return {
    title: page.title || null,
    finalUrl: page.url || null,
    status: page.status || null,
    server: page.server || null,
  };
}

function createTls({ page }) {
  return {
    issuer: page.tlsIssuer || null,
    validDays: page.tlsValidDays ?? null,
    ageDays: page.tlsAgeDays ?? null,
  };
}

function createStats({ stats }) {
  return {
    totalLinks: stats.totalLinks ?? null,
    uniqCountries: stats.uniqCountries ?? null,
    uniqASNs: stats.uniqASNs ?? null,
    totalRequests: sumRequests(stats.ipStats || []),
    secureRequests: stats.secureRequests ?? null,
    securePercentage: stats.securePercentage ?? null,
  };
}

function createScanInfo({ task }) {
  return {
    scannedAt: task.time || null,
    success: task.success ?? null,
  };
}

function createScanResult(cloudflareResult) {
  const sections = {
    verdict: cloudflareResult?.verdicts?.overall || {},
    page: cloudflareResult?.page || {},
    task: cloudflareResult?.task || {},
    stats: cloudflareResult?.stats || {},
    processors: cloudflareResult?.meta?.processors || {},
  };

  return {
    safe: !sections.verdict.malicious,
    malicious: sections.verdict.malicious || false,
    threat: createThreat(sections),
    domain: createDomain(sections),
    page: createPage(sections),
    tls: createTls(sections),
    stats: createStats(sections),
    scan: createScanInfo(sections),
  };
}

module.exports = { createScanResult };
