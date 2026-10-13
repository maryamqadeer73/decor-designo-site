/* =====================================================================
   DECOR DESIGNO — site script (shared by all three pages)
   Products are read live from the WooCommerce Store API on
   decordesigno.com, so prices, photos and new products stay current.
   ===================================================================== */
(function(){
"use strict";
document.documentElement.classList.add("js");

const SITE = DD.site;
const API  = SITE + "/wp-json/wc/store/v1";
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- small helpers ---------- */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const decode = s => { const t = document.createElement("textarea"); t.innerHTML = s ?? ""; return t.value; };
const textOf = html => new DOMParser().parseFromString(html || "", "text/html").body.textContent.replace(/\s+/g," ").trim();
const money = n => "$" + Number(n).toLocaleString("en-US", {minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2});
const productHref = p => `product.html?id=${p.id}`;
const cartHref = (id, qty=1) => `${SITE}/cart/?add-to-cart=${id}&quantity=${qty}`;
const waHref = msg => `https://wa.me/${DD.phoneRaw}?text=${encodeURIComponent(msg)}`;

/* ---------- Store API ---------- */
async function api(path, params={}){
  const url = new URL(API + path);
  Object.entries(params).forEach(([k,v]) => { if (v !== "" && v != null) url.searchParams.set(k, v); });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try{
    const res = await fetch(url, {signal: ctrl.signal, headers:{Accept:"application/json"}});
    if (!res.ok) throw new Error("HTTP " + res.status);
    return {
      data: await res.json(),
      total: +res.headers.get("X-WP-Total") || null,
      pages: +res.headers.get("X-WP-TotalPages") || null
    };
  } finally { clearTimeout(timer); }
}
const LIST_FIELDS = "id,name,slug,permalink,prices,images,categories,on_sale";

function normalize(d){
  const pr = d.prices || {};
  const unit = Math.pow(10, pr.currency_minor_unit ?? 2);
  const price = pr.price ? +pr.price / unit : null;
  const regular = pr.regular_price ? +pr.regular_price / unit : null;
  const img = (d.images || [])[0] || {};
  return {
    id: d.id, name: decode(d.name), slug: d.slug, permalink: d.permalink,
    categories: (d.categories || []).map(c => ({id:c.id, name:decode(c.name), slug:c.slug})),
    price: price > 0 ? price : null,
    regular: regular > 0 ? regular : null,
    image: img.src || "", srcset: img.srcset || "",
    images: (d.images || []).map(i => ({src:i.src, srcset:i.srcset || "", alt:decode(i.alt || "")})),
    shortHtml: d.short_description || "", descHtml: d.description || ""
  };
}

/* ---------- Product card ---------- */
function priceHTML(p){
  if (p.price == null) return `<span class="ask">Price on request</span>`;
  const onSale = p.regular && p.regular > p.price;
  return `<span class="now">${money(p.price)}</span>${onSale ? `<span class="was">${money(p.regular)}</span>` : ""}`;
}
function cardHTML(p){
  const cat = p.categories[0];
  const srcset = p.srcset ? `srcset="${esc(p.srcset)}" sizes="(max-width:720px) 50vw, (max-width:1100px) 33vw, 300px"` : "";
  return `<article class="card">
    <a class="card-media" href="${productHref(p)}" aria-label="${esc(p.name)}">
      ${p.image ? `<img src="${esc(p.image)}" ${srcset} alt="${esc(p.name)}" loading="lazy" decoding="async">` : ""}
      <span class="card-view" aria-hidden="true">View product</span>
    </a>
    ${cat ? `<a class="card-cat" href="shop.html?cat=${encodeURIComponent(cat.slug)}">${esc(cat.name)}</a>` : ""}
    <h3 class="card-title"><a href="${productHref(p)}">${esc(p.name)}</a></h3>
    <div class="price">${priceHTML(p)}</div>
  </article>`;
}
const skeletons = n => Array.from({length:n}, () =>
  `<div class="card skeleton" aria-hidden="true"><div class="card-media"></div><div class="sk-line" style="width:40%"></div><div class="sk-line" style="width:85%"></div><div class="sk-line" style="width:30%"></div></div>`).join("");

/* =====================================================================
   SHARED: header, drawer, search, reveal
   ===================================================================== */
function initHeader(){
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 10);
  addEventListener("scroll", onScroll, {passive:true}); onScroll();

  // Drawer
  const body = document.body, open = $("#menuOpen"), close = $("#menuClose"), drawer = $("#drawer");
  const setDrawer = on => {
    body.classList.toggle("drawer-open", on);
    drawer.setAttribute("aria-hidden", String(!on));
    open.setAttribute("aria-expanded", String(on));
    body.style.overflow = on ? "hidden" : "";
    (on ? close : open).focus();
  };
  open.addEventListener("click", () => setDrawer(true));
  close.addEventListener("click", () => setDrawer(false));
  $("#drawerBg").addEventListener("click", () => { if (body.classList.contains("drawer-open")) setDrawer(false); });
  addEventListener("keydown", e => { if (e.key === "Escape" && body.classList.contains("drawer-open")) setDrawer(false); });

  // Search bar
  const sBtn = $("#searchToggle"), sBar = $("#searchBar");
  sBtn.addEventListener("click", () => {
    sBar.hidden = !sBar.hidden;
    sBtn.setAttribute("aria-expanded", String(!sBar.hidden));
    if (!sBar.hidden) $("#siteSearch").focus();
  });

  // Copy buttons
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    navigator.clipboard?.writeText(b.dataset.copy).then(() => { b.textContent = "Copied"; setTimeout(() => b.textContent = "Copy", 1500); }).catch(()=>{});
  });
}

function initReveal(){
  const els = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)){ els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
  }), {rootMargin:"0px 0px -6% 0px"});
  els.forEach(e => io.observe(e));
}

/* =====================================================================
   HOME
   ===================================================================== */
async function initHome(){
  // Categories
  $("#catGrid").innerHTML = DD.homeCategories.map(([title, slug, img]) =>
    `<a class="cat-card reveal" href="shop.html?cat=${encodeURIComponent(slug)}">
       <img src="${esc(img)}" alt="${esc(title)} furniture from Decor Designo" loading="lazy">
       <div class="cat-card-label"><h3>${esc(title)}</h3><span>Shop now →</span></div>
     </a>`).join("");

  // New arrivals (live, newest first)
  const grid = $("#newGrid");
  grid.innerHTML = skeletons(8);
  try{
    const {data, total} = await api("/products", {per_page:8, orderby:"date", order:"desc", _fields:LIST_FIELDS});
    grid.innerHTML = data.map(normalize).map(cardHTML).join("");
    if (total) $$("[data-total]").forEach(el => el.textContent = total);
  }catch(_){
    grid.innerHTML = DD.backupProducts.slice(0,8).map(cardHTML).join("");
  }
}

/* =====================================================================
   SHOP
   ===================================================================== */
const SORTS = {
  "latest":     {orderby:"date",  order:"desc", label:"Newest first"},
  "price-asc":  {orderby:"price", order:"asc",  label:"Price: low to high"},
  "price-desc": {orderby:"price", order:"desc", label:"Price: high to low"},
  "name":       {orderby:"title", order:"asc",  label:"Name: A to Z"},
  "popular":    {orderby:"popularity", order:"desc", label:"Most popular"}
};

async function initShop(){
  const qs = new URLSearchParams(location.search);
  const state = {
    cat: qs.get("cat") || "",
    sort: SORTS[qs.get("sort")] ? qs.get("sort") : "latest",
    page: Math.max(1, +qs.get("page") || 1),
    search: qs.get("search") || "",
    live: true
  };
  let categories = [];       // [{id,name,slug,parent,count}]
  let requestId = 0;

  const grid = $("#shopGrid"), count = $("#resultCount"), pager = $("#pagination");
  const sortSel = $("#sortSelect"), searchIn = $("#shopSearch");
  sortSel.innerHTML = Object.entries(SORTS).map(([k,v]) => `<option value="${k}">${v.label}</option>`).join("");
  sortSel.value = state.sort;
  searchIn.value = state.search;

  // ---- categories sidebar
  try{
    const {data} = await api("/products/categories", {per_page:100});
    categories = data.filter(c => c.count > 0 && c.slug !== "uncategorized")
                     .map(c => ({id:c.id, name:decode(c.name), slug:c.slug, parent:c.parent, count:c.count}));
  }catch(_){
    categories = DD.backupCategories.map(([slug,name]) => ({slug, name, parent:0, count:null}));
  }
  renderCats();

  function renderCats(){
    const parents = categories.filter(c => !c.parent || !categories.some(p => p.id === c.parent));
    const kids = id => categories.filter(c => c.parent === id);
    const item = (c, child) => `<li class="${child?"child":""}"><button data-cat="${esc(c.slug)}" aria-pressed="${state.cat===c.slug}">
        <span>${esc(c.name)}</span>${c.count!=null?`<span class="count">${c.count}</span>`:""}</button></li>`;
    $("#catList").innerHTML =
      `<li><button data-cat="" aria-pressed="${!state.cat}"><span>All furniture</span><span class="count" data-total>${state.total || ""}</span></button></li>` +
      parents.sort((a,b)=>a.name.localeCompare(b.name)).map(p => item(p,false) + kids(p.id).sort((a,b)=>a.name.localeCompare(b.name)).map(k=>item(k,true)).join("")).join("");
  }
  $("#catList").addEventListener("click", e => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    state.cat = b.dataset.cat; state.page = 1;
    document.body.classList.remove("filters-open");
    load();
  });

  // ---- toolbar
  sortSel.addEventListener("change", () => { state.sort = sortSel.value; state.page = 1; load(); });
  let deb;
  searchIn.addEventListener("input", () => { clearTimeout(deb); deb = setTimeout(() => { state.search = searchIn.value.trim(); state.page = 1; load(); }, 450); });
  $("#shopSearchForm").addEventListener("submit", e => { e.preventDefault(); clearTimeout(deb); state.search = searchIn.value.trim(); state.page = 1; load(); });

  // mobile filter drawer
  const fOpen = $("#filterOpen"), fClose = $("#filterClose");
  fOpen.addEventListener("click", () => { document.body.classList.add("filters-open"); fClose.focus(); });
  fClose.addEventListener("click", () => { document.body.classList.remove("filters-open"); fOpen.focus(); });
  $("#drawerBg").addEventListener("click", () => document.body.classList.remove("filters-open"));

  pager.addEventListener("click", e => {
    const b = e.target.closest("[data-page]"); if (!b || b.disabled) return;
    state.page = +b.dataset.page; load(true);
  });
  $("#activeFilters").addEventListener("click", e => {
    const b = e.target.closest("[data-clear]"); if (!b) return;
    if (b.dataset.clear === "cat") state.cat = ""; else { state.search = ""; searchIn.value = ""; }
    state.page = 1; load();
  });
  addEventListener("popstate", () => location.reload());

  // ---- load products
  async function load(scroll=false){
    const id = ++requestId;
    syncUrl(); renderHeading(); renderActive();
    $$("#catList [data-cat]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cat === state.cat)));
    grid.innerHTML = skeletons(6); grid.setAttribute("aria-busy","true");
    if (scroll) $("#shopTop").scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block:"start"});

    let items = [], total = 0, pages = 1;
    if (state.live){
      try{
        const s = SORTS[state.sort];
        const r = await api("/products", {
          per_page: DD.productsPerPage, page: state.page, orderby: s.orderby, order: s.order,
          category: state.cat, search: state.search, _fields: LIST_FIELDS
        });
        items = r.data.map(normalize); total = r.total ?? items.length; pages = r.pages ?? 1;
        if (!state.cat && !state.search){ state.total = total; $$("[data-total]").forEach(el => el.textContent = total); }
      }catch(_){
        state.live = false;
        $("#offlineNotice").hidden = false;
      }
    }
    if (!state.live){
      let list = DD.backupProducts.filter(p =>
        (!state.cat || p.categories.some(c => c.slug === state.cat) || parentMatch(p)) &&
        (!state.search || p.name.toLowerCase().includes(state.search.toLowerCase())));
      const s = state.sort;
      if (s === "price-asc")  list = [...list].sort((a,b)=>(a.price??1e9)-(b.price??1e9));
      if (s === "price-desc") list = [...list].sort((a,b)=>(b.price??-1)-(a.price??-1));
      if (s === "name")       list = [...list].sort((a,b)=>a.name.localeCompare(b.name));
      total = list.length; pages = Math.max(1, Math.ceil(total / DD.productsPerPage));
      items = list.slice((state.page-1)*DD.productsPerPage, state.page*DD.productsPerPage);
    }
    if (id !== requestId) return; // a newer request replaced this one

    grid.removeAttribute("aria-busy");
    grid.innerHTML = items.length ? items.map(cardHTML).join("") :
      `<div class="empty"><h3 class="h3">No products found</h3><p>Try another category or search term.</p>
       <button class="btn btn-outline" type="button" id="resetAll">Show all furniture</button></div>`;
    $("#resetAll")?.addEventListener("click", () => { state.cat = ""; state.search = ""; searchIn.value = ""; state.page = 1; load(); });

    const from = total ? (state.page-1)*DD.productsPerPage + 1 : 0;
    const to = Math.min(total, state.page*DD.productsPerPage);
    count.textContent = total ? `Showing ${from}–${to} of ${total} products` : "0 products";
    renderPager(pages);
  }
  function parentMatch(p){
    // backup mode: "bedroom" should include bed-set etc.
    const map = {bedroom:["bedroom-set","bedroom-chairs","wardrobes"], "dining-room":["dining-set"], "sitting-room":["sofa-set","console-table"], almirah:["showcase","bookshelves-cabinets"], others:["swing-jholla","shoe-racks","baby-cart"]};
    return (map[state.cat] || []).some(s => p.categories.some(c => c.slug === s));
  }
  function renderPager(pages){
    if (pages <= 1){ pager.innerHTML = ""; return; }
    const cur = state.page, nums = new Set([1, pages, cur-1, cur, cur+1].filter(n => n>=1 && n<=pages));
    const sorted = [...nums].sort((a,b)=>a-b);
    let html = `<button data-page="${cur-1}" ${cur===1?"disabled":""} aria-label="Previous page">‹</button>`;
    sorted.forEach((n,i) => {
      if (i && n - sorted[i-1] > 1) html += `<span class="gap">…</span>`;
      html += `<button data-page="${n}" ${n===cur?'aria-current="page"':""}>${n}</button>`;
    });
    html += `<button data-page="${cur+1}" ${cur===pages?"disabled":""} aria-label="Next page">›</button>`;
    pager.innerHTML = html;
  }
  function catName(){ return categories.find(c => c.slug === state.cat)?.name || state.cat; }
  function renderHeading(){
    const name = state.cat ? catName() : "Shop All Furniture";
    $("#shopTitle").textContent = name;
    $("#crumbCurrent").textContent = state.cat ? name : "Shop";
    document.title = `${name} | Decor Designo`;
  }
  function renderActive(){
    const chips = [];
    if (state.cat) chips.push(`<span class="active-filter">${esc(catName())} <button data-clear="cat" aria-label="Remove category filter">×</button></span>`);
    if (state.search) chips.push(`<span class="active-filter">“${esc(state.search)}” <button data-clear="search" aria-label="Clear search">×</button></span>`);
    $("#activeFilters").innerHTML = chips.join("");
  }
  function syncUrl(){
    const q = new URLSearchParams();
    if (state.cat) q.set("cat", state.cat);
    if (state.search) q.set("search", state.search);
    if (state.sort !== "latest") q.set("sort", state.sort);
    if (state.page > 1) q.set("page", state.page);
    history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : ""));
  }

  load();
}

/* =====================================================================
   PRODUCT
   ===================================================================== */
// Keep only safe, readable tags from the store's product description,
// and drop internal SEO sections that shouldn't be shown to shoppers.
function cleanDescription(html){
  const src = new DOMParser().parseFromString(html || "", "text/html").body;
  const KEEP = new Set(["H2","H3","H4","P","UL","OL","LI","STRONG","B","EM","TABLE","THEAD","TBODY","TR","TH","TD","BR"]);
  const DROP = new Set(["IMG","FIGURE","SCRIPT","STYLE","IFRAME","FORM","INPUT","BUTTON","SVG","VIDEO"]);
  const HIDE_SECTION = /semantic|review summary|trust signals|related search|internal link/i;
  const out = document.createElement("div");
  let skipping = false;

  const copy = (node, parent) => {
    node.childNodes.forEach(n => {
      if (n.nodeType === 3){ if (n.textContent.trim() || parent.tagName !== "DIV") parent.appendChild(document.createTextNode(n.textContent)); return; }
      if (n.nodeType !== 1 || DROP.has(n.tagName)) return;
      if (KEEP.has(n.tagName)){ const el = document.createElement(n.tagName.toLowerCase()); copy(n, el); parent.appendChild(el); }
      else copy(n, parent); // unwrap links, spans, divs
    });
  };
  [...src.childNodes].forEach(n => {
    if (n.nodeType === 1 && /^H[1-3]$/.test(n.tagName)) skipping = HIDE_SECTION.test(n.textContent);
    if (n.nodeType === 1 && n.tagName === "H1"){ const h = document.createElement("h2"); h.textContent = n.textContent; if (!skipping) out.appendChild(h); return; }
    if (skipping) return;
    const tmp = document.createElement("div"); tmp.appendChild(n.cloneNode(true));
    copy(tmp, out);
  });
  out.querySelectorAll("table").forEach(t => { const w = document.createElement("div"); w.className = "table-wrap"; t.replaceWith(w); w.appendChild(t); });
  out.querySelectorAll("p,li,h2,h3,h4").forEach(el => { if (!el.textContent.trim()) el.remove(); });
  // Drop the first heading if it repeats the product name
  return out.innerHTML;
}
function extractSpecs(html){
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  for (const table of doc.querySelectorAll("table")){
    const rows = [...table.querySelectorAll("tr")].map(tr => [...tr.children].map(c => c.textContent.trim()));
    if (rows.length && rows[0].length === 2 && /spec|feature|detail/i.test(rows[0].join(" "))) rows.shift();
    const good = rows.filter(r => r.length === 2 && r[0] && r[1]);
    if (good.length >= 3) return good;
  }
  return [];
}

async function initProduct(){
  const id = +new URLSearchParams(location.search).get("id");
  const root = $("#productRoot");
  if (!id){ root.innerHTML = notFound(); return; }

  let p;
  try{
    const {data} = await api(`/products/${id}`);
    p = normalize(data);
  }catch(_){
    p = DD.backupProducts.find(x => x.id === id);
    if (!p){ root.innerHTML = notFound(true); return; }
    p = {...p, images:[{src:p.image, srcset:"", alt:p.name}], backup:true};
  }
  renderProduct(p);
  loadRelated(p);
}
function notFound(offline){
  return `<div class="container pdp-loading"><h1 class="h2">${offline ? "We couldn't load this product" : "Product not found"}</h1>
    <p style="margin:16px 0 24px">${offline ? "The store isn't responding right now." : "This product link is incomplete."}</p>
    <a class="btn btn-primary" href="shop.html">Back to the shop</a></div>`;
}

function renderProduct(p){
  const cat = p.categories[0];
  const imgs = p.images.length ? p.images : [{src:p.image, srcset:"", alt:p.name}];
  const specs = extractSpecs(p.descHtml);
  const desc = cleanDescription(p.descHtml);
  const short = textOf(p.shortHtml);
  const onSale = p.regular && p.price && p.regular > p.price;
  document.title = `${p.name} | Decor Designo`;
  $('meta[name="description"]')?.setAttribute("content", short || p.name);

  // Breadcrumb
  $("#crumbs").innerHTML = `<a href="index.html">Home</a><span aria-hidden="true">/</span><a href="shop.html">Shop</a>` +
    (cat ? `<span aria-hidden="true">/</span><a href="shop.html?cat=${encodeURIComponent(cat.slug)}">${esc(cat.name)}</a>` : "") +
    `<span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span>`;

  $("#productRoot").innerHTML = `
  <div class="container">
    <div class="pdp">
      <div class="gallery">
        <div class="gallery-main">
          <img id="mainImg" src="${esc(imgs[0].src)}" ${imgs[0].srcset?`srcset="${esc(imgs[0].srcset)}" sizes="(max-width:960px) 100vw, 640px"`:""} alt="${esc(imgs[0].alt || p.name)}">
          ${imgs.length > 1 ? `
          <button class="gal-nav gal-prev" type="button" aria-label="Previous photo"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button class="gal-nav gal-next" type="button" aria-label="Next photo"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>` : ""}
        </div>
        ${imgs.length > 1 ? `<div class="thumbs">${imgs.slice(0,10).map((im,i) =>
          `<button type="button" data-i="${i}" aria-label="Photo ${i+1}" aria-current="${i===0}"><img src="${esc(im.src)}" ${im.srcset?`srcset="${esc(im.srcset)}" sizes="100px"`:""} alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      </div>

      <div class="pdp-info">
        ${cat ? `<a class="overline" href="shop.html?cat=${encodeURIComponent(cat.slug)}">${esc(cat.name)}</a>` : ""}
        <h1 class="h1">${esc(p.name)}</h1>
        <div>
          <div class="price">${priceHTML(p)}</div>
          ${onSale ? `<div class="save">You save ${money(p.regular - p.price)}</div>` : ""}
        </div>
        ${short ? `<p class="pdp-short">${esc(short)}</p>` : ""}

        <div class="buy">
          <div class="qty">
            <button type="button" id="qtyDown" aria-label="Decrease quantity">−</button>
            <label for="qty" class="sr-only">Quantity</label>
            <input id="qty" type="number" min="1" max="20" value="1" inputmode="numeric">
            <button type="button" id="qtyUp" aria-label="Increase quantity">+</button>
          </div>
          <a class="btn btn-primary" id="addToCart" href="${cartHref(p.id)}" target="_blank" rel="noopener">Add to cart</a>
          <a class="btn btn-outline" href="${waHref(`Hello Decor Designo, I'm interested in "${p.name}" ${p.permalink}`)}" target="_blank" rel="noopener">Ask on WhatsApp</a>
        </div>

        <div class="pdp-meta">
          <div>Categories: ${p.categories.map(c => `<a href="shop.html?cat=${encodeURIComponent(c.slug)}">${esc(c.name)}</a>`).join(", ") || "—"}</div>
          <div>Checkout is completed securely on <b>decordesigno.com</b>.</div>
        </div>

        <div class="assurance">
          <div><svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3"/></svg><span><b>Customisation</b>Size and finish can be discussed before production on selected designs.</span></div>
          <div><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0zm6-1l2 2 4-4"/></svg><span><b>Questions?</b>Call or WhatsApp ${esc(DD.phone)}</span></div>
        </div>
      </div>
    </div>

    <section class="tabs" aria-label="Product information">
      <div class="tab-list" role="tablist">
        ${desc ? `<button role="tab" id="tab-desc" aria-controls="panel-desc" aria-selected="true">Description</button>` : ""}
        ${specs.length ? `<button role="tab" id="tab-spec" aria-controls="panel-spec" aria-selected="${!desc}">Specifications</button>` : ""}
        <button role="tab" id="tab-order" aria-controls="panel-order" aria-selected="${!desc && !specs.length}">Ordering</button>
      </div>
      ${desc ? `<div role="tabpanel" id="panel-desc" aria-labelledby="tab-desc" class="prose">${desc}</div>` : ""}
      ${specs.length ? `<div role="tabpanel" id="panel-spec" aria-labelledby="tab-spec" ${desc?"hidden":""}><div class="prose"><div class="table-wrap"><table class="spec-table"><tbody>
        ${specs.map(r => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join("")}</tbody></table></div></div></div>` : ""}
      <div role="tabpanel" id="panel-order" aria-labelledby="tab-order" class="prose" ${desc || specs.length ? "hidden" : ""}>
        <p>Add this piece to your cart to check out on decordesigno.com, or message the team on WhatsApp at ${esc(DD.phone)} to confirm size, finish and delivery before you order.</p>
        <p>Showroom: ${esc(DD.address)}.</p>
        <p><span class="tag-todo" style="background:var(--ivory);color:var(--gold-text)">Owner to confirm</span> Delivery areas, timings and returns policy.</p>
        ${p.backup ? `<p>Full details: <a href="${esc(p.permalink)}" target="_blank" rel="noopener">view this product on decordesigno.com</a>.</p>` : ""}
      </div>
    </section>
  </div>`;

  // Gallery
  let cur = 0;
  const main = $("#mainImg");
  const show = i => {
    cur = (i + imgs.length) % imgs.length;
    main.src = imgs[cur].src;
    if (imgs[cur].srcset) main.srcset = imgs[cur].srcset; else main.removeAttribute("srcset");
    $$(".thumbs button").forEach((b,j) => b.setAttribute("aria-current", String(j===cur)));
  };
  $(".thumbs")?.addEventListener("click", e => { const b = e.target.closest("[data-i]"); if (b) show(+b.dataset.i); });
  $(".gal-prev")?.addEventListener("click", () => show(cur-1));
  $(".gal-next")?.addEventListener("click", () => show(cur+1));

  // Quantity → cart link
  const qty = $("#qty"), cart = $("#addToCart");
  const setQty = v => { qty.value = Math.max(1, Math.min(20, v || 1)); cart.href = cartHref(p.id, qty.value); };
  $("#qtyDown").addEventListener("click", () => setQty(+qty.value - 1));
  $("#qtyUp").addEventListener("click", () => setQty(+qty.value + 1));
  qty.addEventListener("change", () => setQty(+qty.value));

  // Tabs
  const tabs = $$('[role="tab"]');
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(x => { x.setAttribute("aria-selected", String(x===t)); $("#"+x.getAttribute("aria-controls")).hidden = x !== t; });
  }));

  // Structured data for search engines
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  ld.textContent = JSON.stringify({
    "@context":"https://schema.org", "@type":"Product", name:p.name, image:imgs.map(i=>i.src), description:short || undefined,
    brand:{"@type":"Brand", name:"Decor Designo Furniture"}, url:p.permalink,
    offers: p.price ? {"@type":"Offer", price:p.price, priceCurrency:"USD", url:p.permalink, availability:"https://schema.org/InStock"} : undefined
  });
  document.head.appendChild(ld);
}

async function loadRelated(p){
  const grid = $("#relatedGrid"); if (!grid) return;
  const cat = p.categories[0];
  grid.innerHTML = skeletons(4);
  try{
    const {data} = await api("/products", {per_page:5, category:cat?.slug, orderby:"date", order:"desc", _fields:LIST_FIELDS});
    const list = data.map(normalize).filter(x => x.id !== p.id).slice(0,4);
    if (!list.length) throw 0;
    grid.innerHTML = list.map(cardHTML).join("");
  }catch(_){
    const list = DD.backupProducts.filter(x => x.id !== p.id && (!cat || x.categories.some(c => c.slug === cat.slug)));
    grid.innerHTML = (list.length >= 2 ? list : DD.backupProducts.filter(x => x.id !== p.id)).slice(0,4).map(cardHTML).join("");
  }
}

/* =====================================================================
   START
   ===================================================================== */
initHeader();
const page = document.body.dataset.page;
if (page === "home") initHome();
if (page === "shop") initShop();
if (page === "product") initProduct();
initReveal();
})();
