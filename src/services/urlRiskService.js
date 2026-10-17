const { submitScan, getScanResult, UrlScanError } = require("../providers/urlCheckProvider");

function sumRequests(ipStats) {
  return (ipStats || []).reduce((total, ip) => total + (ip.requests || 0), 0);
}

function extractDomainCategories(domainCategoriesData) {
  const names = new Set();
  for (const entry of domainCategoriesData || []) {
    const content = entry?.inherited?.content || [];
    const risks = entry?.inherited?.risks || [];
    for (const c of [...content, ...risks]) {
      if (c?.name) names.add(c.name);
    }
  }
  return Array.from(names);
}

function calculateRiskScore({ malicious, maliciousRequestCount, totalRequests, securePercentage }) {
  let score = malicious ? 60 : 0;

  if (totalRequests > 0) {
    const maliciousRatio = maliciousRequestCount / totalRequests;
    score += maliciousRatio * 25;
  }

  if (typeof securePercentage === "number") {
    const insecureRatio = (100 - securePercentage) / 100;
    score += insecureRatio * 15;
  }

  return Math.round(Math.min(score, 100));
}

function formatResult(result) {
  const overall = result?.verdicts?.overall || {};
  const page = result?.page || {};
  const task = result?.task || {};
  const stats = result?.stats || {};
  const ipStats = stats.ipStats || [];
  const phishingData = result?.meta?.processors?.phishing?.data || [];
  const domainCategoriesData = result?.meta?.processors?.domainCategories?.data || [];
  const radarRank = result?.meta?.processors?.radarRank?.data || [];

  const maliciousRequestCount = stats.malicious || 0;
  const totalRequests = sumRequests(ipStats);
  const domainRank = radarRank[0]?.rank ?? null;

  return {
    safe: !overall.malicious,
    malicious: overall.malicious || false,
    riskScore: calculateRiskScore({
      malicious: overall.malicious,
      maliciousRequestCount,
      totalRequests,
      securePercentage: stats.securePercentage,
    }),
    threat: {
      categories: overall.categories || [],
      tags: overall.tags || [],
      phishingType: phishingData,
      maliciousRequestCount,
    },
    domain: {
      name: page.domain || null,
      categories: extractDomainCategories(domainCategoriesData),
      rank: domainRank,
      country: page.country || null,
      ip: page.ip || null,
      asn: page.asnname || null,
    },
    page: {
      title: page.title || null,
      finalUrl: page.url || null,
      status: page.status || null,
      server: page.server || null,
    },
    tls: {
      issuer: page.tlsIssuer || null,
      validDays: page.tlsValidDays ?? null,
      ageDays: page.tlsAgeDays ?? null,
    },
    stats: {
      totalLinks: stats.totalLinks ?? null,
      uniqCountries: stats.uniqCountries ?? null,
      uniqASNs: stats.uniqASNs ?? null,
      totalRequests,
      secureRequests: stats.secureRequests ?? null,
      securePercentage: stats.securePercentage ?? null,
    },
    scan: {
      scannedAt: task.time || null,
      success: task.success ?? null,
    },
  };
}

async function startCheck(targetUrl) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new UrlScanError("Credenciais da Cloudflare nao configuradas", { code: "MISSING_API_KEY" });
  }

  if (typeof targetUrl !== "string" || !targetUrl.trim()) {
    throw new UrlScanError("Informe uma URL valida", { code: "INVALID_URL" });
  }

  const scanId = await submitScan(targetUrl.trim(), accountId, apiToken);
  return { scanId };
}

async function getCheckResult(scanId) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new UrlScanError("Credenciais da Cloudflare nao configuradas", { code: "MISSING_API_KEY" });
  }

  const { pending, result } = await getScanResult(scanId, accountId, apiToken);

  if (pending) {
    return { status: "pending" };
  }

  return { status: "ready", ...formatResult(result) };
}

module.exports = {
  startCheck,
  getCheckResult,
  UrlScanError,
};