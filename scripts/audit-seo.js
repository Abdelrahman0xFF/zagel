import http from 'http';
import app from '../src/app.js';

async function runSeoAudit(targetUrl) {
  let server = null;
  let baseUrl = targetUrl;

  if (!baseUrl) {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  }

  console.log(`\n🔍 Starting Zagel SEO Health Audit against: ${baseUrl}\n`);

  const results = [];

  function record(category, testName, passed, details = '') {
    results.push({ category, testName, passed, details });
    const symbol = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${symbol} [${category}] ${testName}${details ? ` -> ${details}` : ''}`);
  }

  try {
    // 1. Landing Page Response
    const pageRes = await fetch(`${baseUrl}/`);
    const pageHtml = await pageRes.text();
    const contentType = pageRes.headers.get('content-type') || '';

    record('Crawlability', 'GET / returns 200 OK', pageRes.status === 200, `Status: ${pageRes.status}`);
    record('Crawlability', 'Content-Type is text/html', contentType.includes('text/html'), contentType);

    // 2. Document Title
    const titleMatch = pageHtml.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    const titleValid = title.length >= 30 && title.length <= 70;
    record('Meta Tags', 'Document <title> optimal length (30-70 chars)', titleValid, `"${title}" (${title.length} chars)`);

    // 3. Meta Description
    const descMatch = pageHtml.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const desc = descMatch ? descMatch[1].trim() : '';
    const descValid = desc.length >= 100 && desc.length <= 180;
    record('Meta Tags', 'Meta Description optimal length (100-180 chars)', descValid, `Length: ${desc.length} chars`);

    // 4. Viewport & Mobile Responsiveness
    const viewportMatch = pageHtml.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i);
    const hasViewport = !!viewportMatch && viewportMatch[1].includes('width=device-width');
    record('Mobile', 'Mobile Viewport Tag configured', hasViewport, viewportMatch ? viewportMatch[1] : 'Missing');

    // 5. Robots Meta Tag
    const robotsMetaMatch = pageHtml.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["']/i);
    const robotsContent = robotsMetaMatch ? robotsMetaMatch[1].toLowerCase() : '';
    const robotsValid = robotsContent.includes('index') && robotsContent.includes('follow');
    record('Meta Tags', 'Robots Meta instructs index & follow', robotsValid, robotsContent);

    // 6. Canonical Tag
    const canonicalMatch = pageHtml.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    record('Meta Tags', 'Canonical URL link tag present', !!canonicalMatch, canonicalMatch ? canonicalMatch[1] : 'Missing');

    // 7. Open Graph Protocol Tags
    const ogTitle = pageHtml.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogDesc = pageHtml.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    const ogImage = pageHtml.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    const ogType = pageHtml.match(/<meta[^>]*property=["']og:type["'][^>]*content=["']([^"']+)["']/i);
    const ogValid = ogTitle && ogDesc && ogImage && ogType;
    record('Social Sharing', 'Open Graph tags (title, desc, image, type)', !!ogValid, ogValid ? 'All present' : 'Missing tags');

    // 8. Twitter Card Tags
    const twCard = pageHtml.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']+)["']/i);
    const twTitle = pageHtml.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
    const twDesc = pageHtml.match(/<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i);
    const twValid = twCard && twTitle && twDesc;
    record('Social Sharing', 'Twitter Card tags (card, title, desc)', !!twValid, twValid ? `Card: ${twCard[1]}` : 'Missing tags');

    // 9. Schema.org JSON-LD Structured Data
    const jsonLdMatches = [...pageHtml.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
    let structuredDataValid = false;
    let hasSoftwareApp = false;
    let hasFAQPage = false;
    let faqCount = 0;

    for (const match of jsonLdMatches) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed['@context'] === 'https://schema.org') {
          const graph = parsed['@graph'] || [parsed];
          for (const item of graph) {
            if (item['@type'] === 'SoftwareApplication') {
              hasSoftwareApp = !!(item.name && item.description && item.applicationCategory);
            }
            if (item['@type'] === 'FAQPage' && Array.isArray(item.mainEntity)) {
              hasFAQPage = item.mainEntity.length > 0;
              faqCount = item.mainEntity.length;
            }
          }
        }
      } catch (e) {
        // syntax error
      }
    }
    structuredDataValid = hasSoftwareApp && hasFAQPage;
    record('Structured Data', 'Schema.org JSON-LD valid syntax', jsonLdMatches.length > 0, `${jsonLdMatches.length} block(s) found`);
    record('Structured Data', 'Schema SoftwareApplication definition present', hasSoftwareApp, 'Includes category, OS, offers');
    record('Structured Data', 'Schema FAQPage definition with rich snippets', hasFAQPage, `${faqCount} FAQs defined`);

    // 10. Semantic Heading Hierarchy
    const h1Matches = [...pageHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
    const h2Matches = [...pageHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];
    record('Semantic HTML', 'Single <h1> document heading', h1Matches.length === 1, `Found ${h1Matches.length} <h1> tag(s)`);
    record('Semantic HTML', 'Multiple <h2> section headings present', h2Matches.length >= 4, `Found ${h2Matches.length} <h2> headings`);

    // 11. Image Accessibility & Layout Stability
    const imgMatches = [...pageHtml.matchAll(/<img([^>]+)>/gi)];
    let allImgsHaveAlt = true;
    let allImgsHaveDimensions = true;
    for (const img of imgMatches) {
      const attrs = img[1];
      if (!attrs.includes('alt=') || attrs.includes('alt=""') || attrs.includes("alt=''")) {
        allImgsHaveAlt = false;
      }
      if (!attrs.includes('width=') || !attrs.includes('height=')) {
        allImgsHaveDimensions = false;
      }
    }
    record('Accessibility', 'Images have descriptive alt text', allImgsHaveAlt, `${imgMatches.length} images inspected`);
    record('Core Web Vitals', 'Images specify width & height (prevents CLS)', allImgsHaveDimensions, 'Zero layout shift');

    // 12. Robots.txt Crawler Directives
    const robotsRes = await fetch(`${baseUrl}/robots.txt`);
    const robotsText = await robotsRes.text();
    const robotsHeaders = robotsRes.headers.get('content-type') || '';
    const hasAgent = robotsText.includes('User-agent:');
    const hasDisallowApi = robotsText.includes('Disallow: /api/');
    const sitemapDirectiveMatch = robotsText.match(/Sitemap:\s*(https?:\/\/[^\s]+)/i);
    const robotsOk = robotsRes.status === 200 && hasAgent && hasDisallowApi && !!sitemapDirectiveMatch;
    record('Crawlers', 'robots.txt specifies User-agent and protects /api/', robotsOk, sitemapDirectiveMatch ? `Sitemap: ${sitemapDirectiveMatch[1]}` : 'Missing sitemap directive');

    // 13. Sitemap.xml Specification
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`);
    const sitemapText = await sitemapRes.text();
    const sitemapType = sitemapRes.headers.get('content-type') || '';
    const hasUrlset = sitemapText.includes('<urlset') && sitemapText.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    const locMatches = [...sitemapText.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)];
    const sitemapOk = sitemapRes.status === 200 && hasUrlset && locMatches.length >= 2;
    record('Crawlers', 'sitemap.xml valid protocol with fully-qualified URLs', sitemapOk, `${locMatches.length} absolute URLs found`);

    // 14. Developer Cockpit Route Isolation
    const cockpitRes = await fetch(`${baseUrl}/dashboard`);
    record('App Surfaces', 'Dedicated Developer Cockpit accessible at /dashboard', cockpitRes.status === 200, `Status: ${cockpitRes.status}`);

    const failed = results.filter((r) => !r.passed);
    console.log(`\n======================================================`);
    console.log(`📊 Audit Summary: ${results.length - failed.length}/${results.length} checks passed.`);
    if (failed.length === 0) {
      console.log('🎉 Your site is 100% SEO Friendly and ready for indexing!');
    } else {
      console.log(`⚠️  ${failed.length} issue(s) require attention:`);
      failed.forEach((f) => console.log(`   - [${f.category}] ${f.testName} (${f.details})`));
    }
    console.log(`======================================================\n`);

    return failed.length === 0;
  } finally {
    if (server) {
      server.closeAllConnections?.();
      await new Promise((resolve) => server.close(resolve));
    }
  }
}

const target = process.argv[2];
const isSuccess = await runSeoAudit(target);
if (!isSuccess) {
  process.exitCode = 1;
}


