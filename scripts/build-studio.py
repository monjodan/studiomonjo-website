#!/usr/bin/env python3
"""Rebuild the three static studio pages from reviewed locale copy. No server dependencies."""
from pathlib import Path
from html import escape
import json
import re
from seo import metadata, structured_data, write_discovery

ROOT = Path(__file__).resolve().parents[1]
MEDIA = '/media/web/studio/'
LOCALES = {'en': 'English', 'fr': 'Français', 'ko': '한국어'}

def e(s): return escape(str(s), quote=True)
def lines(s): return e(s).replace('\n', '<br>')
def paras(items): return ''.join(f'<p>{e(p)}</p>' for p in items)
def external(url, label, cls='text-link'):
    return f'<a class="{cls}" href="{e(url)}" target="_blank" rel="noopener noreferrer">{e(label)} <span aria-hidden="true">↗</span></a>'
def image(name, alt, cls='', eager=False):
    dims = {'jordan-workbench':(1600,900), 'jordan-market':(1125,1500), 'jordan-signing':(1200,1500), 'maison-market':(1200,1803), 'page-guides':(1600,1065), 'blank-spread':(1600,1067), 'company-cover':(1600,1066), 'company-dedication':(1600,1066), 'company-brand':(1600,1066), 'company-illustration':(1600,1066), 'binding-detail':(1600,1066), 'yeobaek':(1000,666), 'hanji-calligraphy':(1000,666), 'photo-panel':(750,1000)}
    w,h=dims.get(name,(1000,1000))
    return f'<img class="{cls}" src="{MEDIA}{name}.webp" width="{w}" height="{h}" alt="{e(alt)}" loading="{"eager" if eager else "lazy"}" decoding="async">'
def buy_link(label, locale, name='', img='', unique=False, cls='button'):
    attrs = f' data-buy data-product="{e(name)}" data-product-image="{MEDIA + img + ".webp" if img else ""}"'
    if unique: attrs += ' data-buy-kind="unique"'
    return f'<a class="{cls}" href="/{locale}/notebooks/#order"{attrs}>{e(label)} <span aria-hidden="true">↗</span></a>'

def head(locale, page, t):
    stylesheet = 'monjo' if page == 'home' else 'studio'
    return f'''<!doctype html>
<html lang="{locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{metadata(locale,page,t)}
<link rel="icon" type="image/png" sizes="32x32" href="/media/web/branding/favicon-32.png">
<link rel="apple-touch-icon" href="/media/web/branding/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/StudioSerif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/{stylesheet}.css?v=20260922-5">
<link rel="stylesheet" href="/css/buy.css?v=20260922-5">
</head>
<body class="studio-site page-{page}">
'''

def header(locale,page,t):
    route=page if page!='company' else 'company-editions'
    nav=''.join(f'<a href="/{locale}/{r}/"'+(' aria-current="page"' if key==page else '')+f'>{e(t["nav"][key])}</a>' for key,r in [('notebooks','notebooks'),('about','about'),('company','company-editions')])
    langs=''.join(f'<a href="/{l}/{route}/" lang="{l}" hreflang="{l}" data-language="{l}"'+(' aria-current="true"' if l==locale else '')+f'>{name}</a>' for l,name in LOCALES.items())
    return f'''<a class="skip-link" href="#main">{e(t['nav']['skip'])}</a>
<header class="site-header">
<a class="wordmark" href="/{locale}/" aria-label="Studio Monjo · {e(t['nav']['home'])}"><img src="/media/web/branding/monjo-mark-256.png" alt="" width="28" height="28"><span>Studio Monjo</span></a>
<nav class="site-nav" aria-label="{e(t['nav']['menu'])}">{nav}</nav>
<div class="site-tools"><details class="language-picker"><summary aria-label="{e(t['nav']['language'])}">{locale.upper()} <span aria-hidden="true">⌄</span></summary><div>{langs}</div></details>{buy_link(t['nav']['buy'],locale,cls='header-buy')}</div>
</header>'''

def footer(locale,t):
    return f'''<footer class="site-footer wrap"><div><a class="footer-brand" href="/{locale}/">Studio Monjo</a><p class="footer-motto">{e(t['footer']['line'])}</p><p class="small">{e(t['footer']['place'])}</p></div><nav aria-label="{e(t['nav']['menu'])}"><a href="/{locale}/notebooks/">{e(t['nav']['notebooks'])}</a><a href="/{locale}/about/">{e(t['nav']['about'])}</a><a href="/{locale}/company-editions/">{e(t['nav']['company'])}</a></nav><div class="footer-contact">{external('https://www.instagram.com/studio.monjo',t['footer']['social'])}{external('https://smartstore.naver.com/studiomonjo',t['footer']['shop'])}<span class="small">© Studio Monjo</span></div></footer>'''

def buying(locale,t):
    b=t['buy']
    return f'''<dialog class="buy-dialog" aria-labelledby="buy-title" aria-describedby="buy-intro" data-buy-dialog data-default-product="{e(b['generic'])}" data-unique-title="{e(b['uniqueTitle'])}" data-unique-text="{e(b['uniqueText'])}" data-unique-link="{e(b['uniqueLink'])}">
<button class="buy-close" type="button" data-buy-close aria-label="{e(b['close'])}" autofocus>×</button>
<div class="buy-content"><p class="buy-eyebrow">Studio Monjo</p><h2 id="buy-title">{e(b['title'])}</h2><p id="buy-intro">{e(b['intro'])}</p>
<div class="buy-selection" data-buy-selection hidden><img data-buy-image alt="" width="84" height="84"><p><span>{e(b['selected'])}</span><strong data-buy-product></strong></p></div>
<div class="buy-choices" aria-label="{e(b['intro'])}">
<button type="button" data-buy-route="korea" aria-controls="buy-korea" aria-pressed="true">{e(b['korea'])}</button><button type="button" data-buy-route="international" aria-controls="buy-international" aria-pressed="false">{e(b['international'])}</button><button type="button" data-buy-route="business" aria-controls="buy-business" aria-pressed="false">{e(b['business'])}</button>
</div>
<section id="buy-korea" class="buy-route" data-buy-panel="korea"><h3>{e(b['koreaTitle'])}</h3><p>{e(b['koreaText'])}</p>{external('https://smartstore.naver.com/studiomonjo',b['koreaLink'],'buy-action')}</section>
<section id="buy-international" class="buy-route" data-buy-panel="international" hidden><h3>{e(b['internationalTitle'])}</h3><p>{e(b['internationalText'])}</p>{external('https://ig.me/m/studio.monjo',b['internationalLink'],'buy-action')}</section>
<section id="buy-business" class="buy-route" data-buy-panel="business" hidden><h3>{e(b['businessTitle'])}</h3><p>{e(b['businessText'])}</p><a class="buy-action" data-buy-dismiss href="/{locale}/company-editions/#company-brief">{e(b['businessLink'])} <span aria-hidden="true">→</span></a>{external('https://www.linkedin.com/company/studiomonjo/',b['linkedin'],'buy-link')}</section>
<p class="buy-note">{e(b['availability'])}</p></div>
</dialog>'''

def notebooks(locale,t):
    n=t['notebooks']
    faq_items=''.join(f'<div><h3>{e(item["question"])}</h3><p>{e(item["answer"])}</p></div>' for item in n['faq'])
    faq=f'<section class="notebook-faq wrap section-space" id="questions" aria-labelledby="questions-title"><h2 id="questions-title">{e(n["faqTitle"])}</h2><div class="faq-grid">{faq_items}</div><a class="text-link" href="/{locale}/company-editions/">{e(t["nav"]["company"])} <span aria-hidden="true">→</span></a></section>'
    cards=''
    for i,p in enumerate(n['products'],1):
        name=f'Robey {i:03d} · {p["name"]}'
        cards+=f'''<article class="notebook-card" id="robey-{i:03d}"><a class="notebook-photo" href="/{locale}/notebooks/#order" data-buy data-product="{e(name)}" data-product-image="{MEDIA}robey-{i:03d}-cover.webp" aria-label="{e(n['choose'])} · {e(name)}">{image(f'robey-{i:03d}-cover',p['alt'],eager=i<=3)}<span class="photo-action" aria-hidden="true">↗</span></a><div class="notebook-info"><p class="edition-number">{e(n['edition'])} / {i:03d}</p><h3><a href="/{locale}/notebooks/#order" data-buy data-product="{e(name)}" data-product-image="{MEDIA}robey-{i:03d}-cover.webp">{e(p['name'])}</a></h3><p class="notebook-scene">{e(p['scene'])}</p></div></article>'''
    unique=''
    for p,img in zip(n['uniqueProducts'],['yeobaek','hanji-calligraphy','photo-panel']):
        unique+=f'''<article class="unique-card"><a href="/{locale}/notebooks/#order" data-buy data-buy-kind="unique" data-product="{e(p['name'])}" data-product-image="{MEDIA}{img}.webp" aria-label="{e(n['uniqueAsk'])} · {e(p['name'])}">{image(img,p['alt'])}</a><h3>{e(p['name'])}</h3><p>{e(p['line'])}</p></article>'''
    return f'''<main id="main">
<header class="collection-hero wrap"><div><p class="eyebrow">{e(n['eyebrow'])}</p><h1>{lines(n['heading'])}</h1></div><div class="collection-intro"><p>{e(n['intro'])}</p><nav class="section-links" aria-label="{e(n['title'])}"><a href="#collection">{e(n['robeyNav'])} ↓</a><a href="#one-of-a-kind">{e(n['uniqueNav'])} ↓</a><a href="#inside">{e(n['insideNav'])} ↓</a></nav></div></header>
<section class="collection wrap" id="collection" aria-labelledby="collection-title"><div class="collection-heading"><div><h2 id="collection-title">{e(n['collection'])}</h2><p>{e(n['collectionIntro'])}</p></div><div class="collection-prices"><p>{e(n['price'])}</p><small>{e(n['priceNote'])}</small></div></div><div class="notebook-grid">{cards}</div></section>
<section class="writing-section navy" id="inside" aria-labelledby="inside-title"><div class="wrap writing-grid"><figure class="writing-film"><video controls autoplay playsinline muted loop preload="metadata" poster="{MEDIA}writing-poster.webp" width="720" height="1280" aria-label="{e(n['videoAlt'])}"><source src="{MEDIA}writing-on-navy.mp4" type="video/mp4"></video><figcaption>{e(n['videoCaption'])}</figcaption></figure><div class="writing-copy"><p class="eyebrow">{e(n['insideKicker'])}</p><h2 id="inside-title">{lines(n['insideTitle'])}</h2><p class="lead">{e(n['insideText'])}</p><dl class="detail-list"><div><dt>{e(n['paperTitle'])}</dt><dd>{e(n['paperText'])}</dd></div><div><dt>{e(n['guidesTitle'])}</dt><dd>{e(n['guidesText'])}</dd></div><div><dt>{e(n['bindingTitle'])}</dt><dd>{e(n['bindingText'])}</dd></div></dl><figure class="writing-pages"><div>{image('blank-spread',n['blankAlt'])}{image('page-guides',n['guideAlt'])}</div><figcaption>{e(n['guideCaption'])}</figcaption></figure></div></div></section>
<section class="unique-section wrap section-space" id="one-of-a-kind" aria-labelledby="unique-title"><div class="section-heading"><div><p class="eyebrow">{e(n['uniqueKicker'])}</p><h2 id="unique-title">{e(n['uniqueTitle'])}</h2></div><p>{e(n['uniqueText'])}</p></div><div class="unique-grid">{unique}</div><div class="availability-line"><p>{e(n['uniqueNote'])}</p>{buy_link(n['uniqueAsk'],locale,unique=True,cls='text-link')}</div></section>
<section class="story-invitation wrap"><div><p class="eyebrow">{e(n['storyKicker'])}</p><h2>{e(n['storyTitle'])}</h2><p>{e(n['storyText'])}</p><a class="text-link" href="/{locale}/about/">{e(n['storyLink'])} <span aria-hidden="true">→</span></a></div>{image('jordan-signing',t['about']['signingAlt'])}</section>
{faq}
<section class="order-section navy" id="order" aria-labelledby="order-title"><div class="wrap"><div><p class="eyebrow">{e(t['buy']['fallbackTitle'])}</p><h2 id="order-title">{e(n['orderTitle'])}</h2><p>{e(n['orderText'])}</p></div>{buy_link(n['orderButton'],locale,cls='button button-white')}<div class="order-direct">{external('https://smartstore.naver.com/studiomonjo',t['buy']['korea']+' · Naver')}{external('https://ig.me/m/studio.monjo',t['buy']['international']+' · Instagram')}</div></div></section>
</main>'''

def about(locale,t):
    a=t['about']
    return f'''<main id="main">
<header class="about-hero wrap"><div class="about-hero-copy"><p class="eyebrow">{e(a['eyebrow'])}</p><h1>{lines(a['heading'])}</h1><p class="lead">{e(a['intro'])}</p></div><figure>{image('jordan-market',a['portraitAlt'],eager=True)}<figcaption>{e(a['portraitCaption'])}</figcaption></figure></header>
<div class="founder-letter wrap"><aside class="letter-aside"><p>Studio Monjo</p><span>{e(t['footer']['line'])}</span><img src="/media/web/branding/monjo-mark-256.png" width="64" height="64" alt=""></aside><div class="letter-body"><section><h2>{e(a['originTitle'])}</h2>{paras(a['origin'])}</section><section><h2>{e(a['makingTitle'])}</h2>{paras(a['making'])}</section></div></div>
<div class="maker-statement navy"><div class="wrap"><p>{lines(a['pull'])}</p><span>Studio Monjo</span></div></div>
<section class="robey-story wrap section-space"><figure>{image('robey-003-cover',t['notebooks']['products'][2]['alt'])}</figure><div><p class="eyebrow">Robey</p><h2>{e(a['robeyTitle'])}</h2>{paras(a['robey'])}<a class="text-link" href="/{locale}/notebooks/#collection">{e(t['notebooks']['collection'])} <span aria-hidden="true">→</span></a></div></section>
<section class="market-story wrap"><div><p class="eyebrow">{e(a['marketKicker'])}</p><h2>{e(a['marketTitle'])}</h2>{paras(a['market'])}<p class="signature">{e(a['signature'])}<span>{e(a['signatureDetail'])}</span></p></div><figure>{image('maison-market',a['marketAlt'])}<figcaption>{e(a['marketCaption'])}</figcaption></figure></section>
<section class="simple-close wrap"><h2>{e(a['close'])}</h2><a class="button" href="/{locale}/notebooks/">{e(a['closeLink'])} <span aria-hidden="true">→</span></a></section>
</main>'''

def company(locale,t):
    c=t['company']
    facts=''.join(f'<div><strong>{e(a)}</strong><span>{e(b)}</span></div>' for a,b in c['facts'])
    details=''.join(f'<div><dt>{e(a)}</dt><dd>{e(b)}</dd></div>' for a,b in c['details'])
    process=''.join(f'<li><span class="step-number">0{i}</span><h3>{e(a)}</h3><p>{e(b)}</p></li>' for i,(a,b) in enumerate(c['process'],1))
    def field(key, name, type='text', attrs='', wide=False):
        return f'<label class="form-field{ " field-wide" if wide else ""}"><span>{e(c[key])}</span><input type="{type}" name="{name}" {attrs}></label>'
    form=field('name','name',attrs='autocomplete="name" required')+field('workEmail','email','email','autocomplete="email" required')+field('organization','company',attrs='autocomplete="organization" required')+field('country','delivery_country',attrs='autocomplete="country-name" required')+field('quantity','quantity','number','min="20" max="2000" inputmode="numeric" placeholder="20–2,000" required')
    form+=f'''<label class="form-field"><span>{e(c['edition'])}</span><select name="edition" required><option value="" disabled selected>{e(c['choose'])}</option><option value="Brand Edition">{e(c['brand'])}</option><option value="Illustration Edition">{e(c['illustration'])}</option><option value="Not sure yet">{e(c['unsure'])}</option></select></label><label class="form-field field-wide"><span>{e(c['story'])}</span><textarea name="occasion_and_story" rows="4" required></textarea></label>'''
    form+=field('date','desired_date',attrs=f'placeholder="{e(c["dateHint"])}"',wide=True)
    return f'''<main id="main">
<header class="company-hero navy"><div class="company-hero-copy"><p class="eyebrow">{e(c['eyebrow'])}</p><h1>{lines(c['heading'])}</h1><p class="lead">{e(c['intro'])}</p><a class="button button-white" href="#company-brief">{e(t['nav']['project'])} <span aria-hidden="true">→</span></a></div><figure>{image('company-cover',c['heroAlt'],eager=True)}<figcaption>{e(c['heroCaption'])}</figcaption></figure></header>
<div class="company-facts wrap">{facts}</div>
<section class="edition-options wrap section-space" aria-labelledby="options-title"><p class="eyebrow">{e(c['optionsKicker'])}</p><h2 id="options-title">{lines(c['optionsTitle'])}</h2><div class="edition-grid"><article>{image('company-brand',c['brandAlt'])}<div class="edition-copy"><p class="eyebrow">{e(c['brandLabel'])}</p><h3>{lines(c['brandTitle'])}</h3><p>{e(c['brandText'])}</p><div class="edition-commercial"><strong>{e(c['brandPrice'])}</strong><span>{e(c['brandTime'])}</span></div><a class="text-link" data-edition="Brand Edition" href="#company-brief">{e(c['optionLink'])} <span aria-hidden="true">→</span></a></div></article><article>{image('company-illustration',c['illustrationAlt'])}<div class="edition-copy"><p class="eyebrow">{e(c['illustrationLabel'])}</p><h3>{lines(c['illustrationTitle'])}</h3><p>{e(c['illustrationText'])}</p><div class="edition-commercial"><strong>{e(c['illustrationPrice'])}</strong><span>{e(c['illustrationTime'])}</span></div><a class="text-link" data-edition="Illustration Edition" href="#company-brief">{e(c['optionLink'])} <span aria-hidden="true">→</span></a></div></article></div><p class="pricing-note">{e(c['pricingNote'])} {e(c['illustrationCaption'])}</p></section>
<section class="edition-detail navy"><div class="wrap edition-detail-grid"><figure>{image('company-dedication',c['detailsAlt'])}<figcaption>{e(c['detailsCaption'])}</figcaption></figure><div><p class="eyebrow">{e(c['detailsKicker'])}</p><h2>{lines(c['detailsTitle'])}</h2><p>{e(c['detailsText'])}</p><dl class="detail-list">{details}</dl></div></div></section>
<section class="edition-process wrap section-space"><h2>{lines(c['processTitle'])}</h2><ol>{process}</ol><p class="delivery-note">{e(c['delivery'])}</p></section>
<section class="company-contact wrap" id="company-brief" aria-labelledby="brief-title"><div class="brief-intro"><p class="eyebrow">{e(c['briefKicker'])}</p><h2 id="brief-title">{lines(c['briefTitle'])}</h2><p>{e(c['briefText'])}</p>{external('https://www.linkedin.com/company/studiomonjo/',c['linkedin'])}</div>
<div><form class="company-form" action="https://formspree.io/f/meevrwqb" method="POST" data-company-form data-error-message="{e(c['error'])}" data-sending-message="{e(c['sending'])}"><input type="hidden" name="_subject" value="New Studio Monjo company edition enquiry"><input type="hidden" name="source" value="company-editions-{locale}">{form}<input class="form-trap" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true"><div class="form-send"><p>{e(c['privacy'])}</p><button class="button" type="submit">{e(c['submit'])} <span aria-hidden="true">→</span></button></div><p class="form-status" data-company-form-status role="status" hidden></p></form><div class="form-done" data-company-form-done tabindex="-1" hidden><h3>{e(c['successTitle'])}</h3><p>{e(c['successText'])}</p></div></div></section>
</main>'''

def update_home(locale,t):
    path=ROOT/locale/'index.html'; s=path.read_text()
    # All pages share one metadata generator, avoiding stale duplicate entities.
    prefix=head(locale,'home',t).split('<body',1)[0]
    s=re.sub(r'^.*?</head>\s*',lambda _:prefix,s,count=1,flags=re.S)
    s=s.replace('<body>', '<body class="bench-home">')
    if '<header class="bench-header">' not in s:
        s=s.replace('<!-- bench chrome -->', '<!-- bench chrome -->\n<header class="bench-header">')
        s=s.replace('<!-- THE BENCH: filmed arrival -->', '</header>\n\n<!-- THE BENCH: filmed arrival -->')
    s=s.replace('aria-haspopup="true"', 'aria-controls="home-languages"')
    s=s.replace('<span class="page-lang-alts" hidden>', '<span class="page-lang-alts" id="home-languages" hidden>')
    s=re.sub(r'/js/lang-pill.js(?:\?[^" ]*)?', '/js/lang-pill.js?v=20260922-5', s)
    # Keep the filmed homepage and its typography; refresh navigation and shared ordering only.
    s=re.sub(r'/css/monjo.css\?[^\"]+', '/css/monjo.css?v=20260922-5', s)
    s=re.sub(r'<link rel="stylesheet" href="/css/studio-story.css[^\n]+\n?', '', s)
    s=re.sub(r'<p class="bench__lede">.*?</p>',f'<p class="bench__lede">{e(t["home"]["lede"])}</p>',s,flags=re.S)
    doors=''
    for i,(key,route,sub) in enumerate([('notebooks','notebooks','subNotebooks'),('about','about','subAbout'),('company','company-editions','subCompany')],1):
        doors+=f'<a class="door" href="/{locale}/{route}/"><span class="door__num">0{i}</span><span class="door__text"><span class="door__label">{e(t["nav"][key])}</span><span class="door__sub">{e(t["home"][sub])}</span></span></a>\n'
    s=re.sub(r'<nav class="doors".*?</nav>',f'<nav class="doors" aria-label="{e(t["nav"]["menu"])}">{doors}</nav>',s,flags=re.S)
    s=re.sub(r'<a class="chrome-shop".*?</a>',buy_link(t['nav']['buy'],locale,cls='chrome-shop'),s,flags=re.S)
    s=re.sub(r'(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*(">)',lambda m:m[1]+e(t['home']['description'])+m[2],s)
    s=re.sub(r'"description": "[^"]*"',lambda m:'"description": '+json.dumps(t['home']['description'],ensure_ascii=False),s)
    s=re.sub(r'<link rel="stylesheet" href="/css/buy.css[^\n]+\n?', '', s)
    s=s.replace('</head>','<link rel="stylesheet" href="/css/buy.css?v=20260922-5">\n</head>')
    s=re.sub(r'<dialog class="buy-dialog".*?</dialog>\s*','',s,flags=re.S)
    s=re.sub(r'<script src="/js/studio.js[^\n]+\n?','',s)
    s=s.replace('</body>',buying(locale,t)+'\n<script src="/js/studio.js?v=20260922-5"></script>\n</body>')
    path.write_text(s)

def update_root(t):
    path=ROOT/'index.html'
    s=path.read_text()
    old_head=s.split('</head>',1)[0]
    language_script=re.search(r'<script>.*?</script>',old_head,re.S).group(0)
    prefix=head('en','home',t).split('<body',1)[0]
    prefix=re.sub(r'<script type="application/ld\+json">.*?</script>\n?', '', prefix, flags=re.S)
    prefix=re.sub(r'<link rel="(?:preload|stylesheet)"[^>]*>\n?', '', prefix)
    site_graph=structured_data('en','home',t)
    site_graph['@graph']=site_graph['@graph'][:3]
    site_schema='<script type="application/ld+json">'+json.dumps(site_graph,ensure_ascii=False).replace('<','\\u003c')+'</script>'
    prefix=prefix.replace('</head>',site_schema+'\n'+language_script+'\n<noscript><meta http-equiv="refresh" content="0; url=en/"></noscript>\n</head>')
    s=re.sub(r'^.*?</head>\s*',lambda _:prefix,s,count=1,flags=re.S)
    s=re.sub(r'<body>.*?</body>', '<body>\n<main style="font-family:system-ui,sans-serif;padding:24px;color:#16243f"><h1>Studio Monjo</h1><p>'+e(t['home']['description'])+'</p><p><a href="/en/" lang="en">English</a> · <a href="/fr/" lang="fr">Français</a> · <a href="/ko/" lang="ko">한국어</a></p></main>\n</body>',s,flags=re.S)
    path.write_text(s)

copy={}
for locale in LOCALES:
    source=ROOT/'content'/f'{locale}.json'
    if not source.exists(): continue
    t=json.loads(source.read_text())
    copy[locale]=t
    for key,build in [('notebooks',notebooks),('about',about),('company',company)]:
        route='company-editions' if key=='company' else key
        dest=ROOT/locale/route/'index.html'; dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_text(head(locale,key,t)+header(locale,key,t)+build(locale,t)+footer(locale,t)+buying(locale,t)+'\n<script src="/js/studio.js?v=20260922-5" defer></script>\n</body>\n</html>\n')
    update_home(locale,t)
    print(f'Built {locale}: notebooks, story, company; refreshed home links.')

update_root(copy['en'])
write_discovery(copy)
