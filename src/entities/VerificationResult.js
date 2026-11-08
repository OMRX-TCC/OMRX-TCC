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

function calculateDomainAgeDays(createdDate) {
  if (!createdDate) return null;
  const created = new Date(createdDate);
  if (isNaN(created.getTime())) return null;
  const diffMs = Date.now() - created.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
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

class VerificationResult {
  constructor(result) {
    const overall = result?.verdicts?.overall || {};
    const page = result?.page || {};
    const task = result?.task || {};
    const stats = result?.stats || {};
    const ipStats = stats.ipStats || [];
    const phishingData = result?.meta?.processors?.phishing?.data || [];
    const domainCategoriesData = result?.meta?.processors?.domainCategories?.data || [];
    const radarRank = result?.meta?.processors?.radarRank?.data || [];
    const whoisData = result?.meta?.processors?.whois?.data || {};

    const maliciousRequestCount = stats.malicious || 0;
    const totalRequests = sumRequests(ipStats);
    const domainRank = radarRank[0]?.rank ?? null;

    this.safe = !overall.malicious;
    this.malicious = overall.malicious || false;
    this.riskScore = calculateRiskScore({
      malicious: overall.malicious,
      maliciousRequestCount,
      totalRequests,
      securePercentage: stats.securePercentage,
    });

    this.threat = {
      categories: overall.categories || [],
      tags: overall.tags || [],
      phishingType: phishingData,
      maliciousRequestCount,
    };

    this.domain = {
      name: page.domain || null,
      categories: extractDomainCategories(domainCategoriesData),
      rank: domainRank,
      country: page.country || null,
      ip: page.ip || null,
      asn: page.asnname || null,
      createdAt: whoisData.created_date || null,
      ageDays: calculateDomainAgeDays(whoisData.created_date),
    };

    this.page = {
      title: page.title || null,
      finalUrl: page.url || null,
      status: page.status || null,
      server: page.server || null,
    };

    this.tls = {
      issuer: page.tlsIssuer || null,
      validDays: page.tlsValidDays ?? null,
      ageDays: page.tlsAgeDays ?? null,
    };

    this.stats = {
      totalLinks: stats.totalLinks ?? null,
      uniqCountries: stats.uniqCountries ?? null,
      uniqASNs: stats.uniqASNs ?? null,
      totalRequests,
      secureRequests: stats.secureRequests ?? null,
      securePercentage: stats.securePercentage ?? null,
    };

    this.scan = {
      scannedAt: task.time || null,
      success: task.success ?? null,
    };
  }
}

module.exports = { VerificationResult };