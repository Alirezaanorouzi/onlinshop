const urls = [
  "https://qaim-magham.liara.run/",
  "https://qaim-magham.liara.run/collection/men",
  "https://qaim-magham.liara.run/api/health",
];

for (const url of urls) {
  const res = await fetch(url, { redirect: "follow" });
  const ct = res.headers.get("content-type") ?? "";
  const text = await res.text();
  console.log("\n===", url, res.status, ct, "len=", text.length);
  console.log(text.slice(0, 1200));
  const css = text.match(/href="([^"]*\.css[^"]*)"/);
  if (css) {
    const cssUrl = new URL(css[1], url).href;
    const cssRes = await fetch(cssUrl);
    console.log("CSS:", cssUrl, cssRes.status, cssRes.headers.get("content-type"));
    const cssBody = await cssRes.text();
    console.log("CSS sample:", cssBody.slice(0, 200));
  }
}
