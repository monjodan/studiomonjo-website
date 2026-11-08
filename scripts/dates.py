"""The dates page: a wall calendar of the markets, fairs and workshops where the notebooks leave the studio.

One sheet per month, drawn from content/events.json. A date appears only once its status is
"confirmed"; applications stay pending and out of the pages. The first day of each date is circled
in red pen, a line runs through the days that follow, and the kind of event is written beside it in
Robey's hand. The details sit as notes beside the sheet. The same dates are written as calendar files
under /calendar/, one feed per language and one file per date, so a reader can keep them.

Set DATES_TODAY=YYYY-MM-DD to build the page as of another day (tests, screenshots).
Set DATES_PREVIEW=1 to show pending dates as well, for a design look only; never publish such a build.
"""
from datetime import date, datetime, timedelta, timezone
from html import escape
from pathlib import Path
from urllib.parse import quote_plus
from zoneinfo import ZoneInfo
import calendar
import json
import math
import os
import random

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://studiomonjo.com'
SEOUL = ZoneInfo('Asia/Seoul')
FOLDER = 'calendar'
MIN_MONTHS = 3          # Always show this month and the next two, even when nothing is booked.
KINDS = ('market', 'fair', 'workshop', 'meetup')
INSTAGRAM = 'https://www.instagram.com/studio.monjo/'


def e(s):
    return escape(str(s), quote=True)


def today():
    forced = os.environ.get('DATES_TODAY')
    return date.fromisoformat(forced) if forced else datetime.now(SEOUL).date()


def load():
    data = json.loads((ROOT / 'content' / 'events.json').read_text())
    events = []
    for raw in data['events']:
        ev = dict(raw)
        ev['start'], ev['end'] = date.fromisoformat(ev['start']), date.fromisoformat(ev['end'])
        if ev['end'] < ev['start']:
            raise ValueError(f'events.json: {ev["id"]} ends before it starts')
        if ev['kind'] not in KINDS:
            raise ValueError(f'events.json: {ev["id"]} has an unknown kind {ev["kind"]!r}')
        if ev['status'] not in ('confirmed', 'pending', 'cancelled'):
            raise ValueError(f'events.json: {ev["id"]} has an unknown status {ev["status"]!r}')
        if not all(c.isalnum() or c == '-' for c in ev['id']) or ev['id'] != ev['id'].lower():
            raise ValueError(f'events.json: {ev["id"]} must use lowercase letters, digits and hyphens')
        events.append(ev)
    if len({ev['id'] for ev in events}) != len(events):
        raise ValueError('events.json: two dates share an id')
    return data.get('updated', '2026-11-08'), sorted(events, key=lambda ev: (ev['start'], ev['end'], ev['id']))


def published(events):
    """Confirmed dates, plus pending ones only for a design preview."""
    preview = os.environ.get('DATES_PREVIEW') == '1'
    return [ev for ev in events if ev['status'] == 'confirmed' or (preview and ev['status'] == 'pending')]


def split(events, day):
    upcoming = [ev for ev in events if ev['end'] >= day]
    past = [ev for ev in events if ev['end'] < day]
    return upcoming, past


def months_to_show(upcoming, day):
    first = (day.year, day.month)
    last = first
    for _ in range(MIN_MONTHS - 1):
        last = next_month(*last)
    for ev in upcoming:
        if (ev['end'].year, ev['end'].month) > last:
            last = (ev['end'].year, ev['end'].month)
    months, cursor = [], first
    while cursor <= last:
        months.append(cursor)
        cursor = next_month(*cursor)
    return months


def next_month(year, month):
    return (year + 1, 1) if month == 12 else (year, month + 1)


# ——— Words ———

def when(locale, t, start, end, year=False):
    """A date or a range in the page's language: 12 December, 21–30 December, 30 October – 1 November."""
    m = t['dates']['months']
    if locale == 'ko':
        text = f'{start.month}월 {start.day}일' if start == end else (
            f'{start.month}월 {start.day}일–{end.day}일' if start.month == end.month else f'{start.month}월 {start.day}일–{end.month}월 {end.day}일')
        return f'{start.year}년 {text}' if year else text
    def day(d):
        return '1er' if locale == 'fr' and d.day == 1 else str(d.day)
    if start == end:
        text = f'{day(start)} {m[start.month - 1]}'
    elif start.month == end.month:
        text = f'{day(start)}–{day(end)} {m[start.month - 1]}'
    else:
        text = f'{day(start)} {m[start.month - 1]} – {day(end)} {m[end.month - 1]}'
    return f'{text} {end.year}' if year else text


def words(ev, locale, key):
    value = ev.get(key)
    if isinstance(value, dict):
        return value.get(locale) or value.get('en', '')
    return value or ''


def hours(ev):
    """(start, end) times from "11:30–20:00", or None."""
    text = ev.get('hours', '')
    for dash in ('–', '-', '—'):
        if dash in text:
            a, b = (part.strip() for part in text.split(dash, 1))
            try:
                return (datetime.strptime(a, '%H:%M').time(), datetime.strptime(b, '%H:%M').time())
            except ValueError:
                return None
    return None


# ——— The red pen ———

def smooth(points, closed=False):
    """A path through the points as one easy curve (Catmull-Rom turned into cubic Béziers), the way a pen moves."""
    pts = list(points)
    n = len(pts)
    def at(i):
        return pts[i % n] if closed else pts[max(0, min(n - 1, i))]
    d = [f'M{pts[0][0]:.1f} {pts[0][1]:.1f}']
    last = n if closed else n - 1
    for i in range(last):
        p0, p1, p2, p3 = at(i - 1), at(i), at(i + 1), at(i + 2)
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f'C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}')
    return ' '.join(d)


def ring(seed):
    """A circle drawn by hand around a day: slightly oval, a little uneven, overlapping where the pen came back to its start."""
    r = random.Random(seed)
    a1, a2, a3 = r.uniform(0.03, 0.06), r.uniform(0.02, 0.04), r.uniform(0.01, 0.025)
    f1, f2, f3 = (r.uniform(0, math.tau) for _ in range(3))
    tilt = r.uniform(-0.25, 0.25)
    start = math.radians(-50 + r.uniform(-20, 20))
    pts = []
    for i in range(22):
        a = start + i / 21 * math.radians(385)
        wob = 1 + a1 * math.sin(a + f1) + a2 * math.sin(2 * a + f2) + a3 * math.sin(3 * a + f3)
        x, y = 16.5 * wob * math.cos(a), 12.5 * wob * math.sin(a)
        pts.append((20 + x * math.cos(tilt) - y * math.sin(tilt), 16 + x * math.sin(tilt) + y * math.cos(tilt)))
    return f'<svg class="cal-ring" viewBox="0 0 40 32" aria-hidden="true" focusable="false"><path d="{smooth(pts)}"/></svg>'


def line(seed, span, lane, from_ring=False):
    """A line drawn through the following days of a date, from one number to the next.
    span is the number of cells it crosses; from the ring, it starts at the circle's edge."""
    r = random.Random(seed)
    f1, f2 = r.uniform(0, math.tau), r.uniform(0, math.tau)
    drift = r.uniform(-0.8, 0.8)
    pts = []
    n = 8
    for i in range(n + 1):
        x = 100 * i / n
        y = 5 + drift * (i / n) + 1.1 * math.sin(math.tau * i / n + f1) * math.sin(math.pi * i / n) + 0.5 * math.sin(2 * math.tau * i / n + f2)
        pts.append((x, y))
    origin = ' data-from-ring=""' if from_ring else ''
    return (f'<svg class="cal-line" data-lane="{lane}"{origin} style="--span:{span}" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
            f'<path vector-effect="non-scaling-stroke" d="{smooth(pts)}"/></svg>')


def lanes(events):
    """Dates that overlap share a sheet: each takes the first free line beneath the numbers."""
    taken = []
    result = {}
    for ev in events:
        lane = 0
        while any(l == lane and not (ev['end'] < s or ev['start'] > en) for s, en, l in taken):
            lane += 1
        taken.append((ev['start'], ev['end'], lane))
        result[ev['id']] = lane
    return result


# ——— The sheet ———

def sheet(locale, t, year, month, events):
    d = t['dates']
    first_weekday = 6 if d.get('weekStart') == 'sunday' else 0      # Python: Monday is 0, Sunday is 6
    cal = calendar.Calendar(firstweekday=first_weekday)
    lane_of = lanes(events)
    month_events = [ev for ev in events if (ev['start'].year, ev['start'].month) <= (year, month) <= (ev['end'].year, ev['end'].month)]
    head = ''.join(f'<th scope="col">{e(name)}</th>' for name in d['weekdays'])
    rows = []
    for week in cal.monthdatescalendar(year, month):
        cells = []
        for cell in week:
            if cell.month != month:
                cells.append('<td class="cal-out"></td>')
                continue
            classes = ['cal-day']
            if cell.weekday() >= 5:
                classes.append('cal-wkend')
            iso = cell.isoformat()
            marks, label, aria = [], '', ''
            for ev in month_events:
                if not (ev['start'] <= cell <= ev['end']):
                    continue
                lane = lane_of[ev['id']]
                seed = sum(ord(c) for c in ev['id']) + cell.day * 7
                starts_here = cell == ev['start']
                # Each week row gets its own stroke: from this day to the last day of the date in this row.
                if starts_here or cell == week[0]:
                    span = (min(ev['end'], week[-1]) - cell).days
                    if span > 0 or not starts_here:
                        marks.append(line(seed, span, lane, from_ring=starts_here))
                if starts_here:
                    marks.append(ring(seed))
                    marks.append(f'<span class="cal-pen" data-lane="{lane}">{e(d["kinds"][ev["kind"]])}</span>')
                if 'has-event' not in classes:
                    classes.append('has-event')
                # The day the pen touched is the link to the note; the days a line runs through stay plain.
                if marks and not label:
                    label = ev['id']
                    aria = f'{when(locale, t, ev["start"], ev["end"])}: {words(ev, locale, "name")}'
            number = f'<span class="cal-num">{cell.day}</span>'
            if label:
                content = f'<a class="cal-mark" href="#ev-{e(label)}" aria-label="{e(aria)}">{number}{"".join(marks)}</a>'
            else:
                content = number + ''.join(marks)
            cells.append(f'<td class="{" ".join(classes)}" data-date="{iso}">{content}</td>')
        rows.append('<tr>' + ''.join(cells) + '</tr>')
    title = d['calendarAria'].format(month=d['months'][month - 1], year=year)
    notes = ''.join(note(locale, t, ev) for ev in month_events if ev['start'].year == year and ev['start'].month == month)
    aside = f'<aside class="cal-notes">{notes}</aside>' if notes else ''
    return (f'<section class="cal-month" data-month="{year}-{month:02d}" aria-labelledby="m-{year}-{month:02d}">'
            f'<div class="cal-sheet"><header class="cal-head"><h2 id="m-{year}-{month:02d}">{e(d["months"][month - 1])}</h2><span class="cal-year">{year}</span></header>'
            f'<table class="cal-grid" aria-label="{e(title)}" data-today="{e(d["today"])}"><thead><tr>{head}</tr></thead><tbody>{"".join(rows)}</tbody></table></div>'
            f'{aside}</section>')


def note(locale, t, ev):
    d = t['dates']
    time = f'<span> · {e(ev["hours"])}</span>' if ev.get('hours') else ''
    place = e(words(ev, locale, 'place'))
    map_url = ev.get('naverMap') if locale == 'ko' and ev.get('naverMap') else ev.get('map')
    if map_url:
        place += f' <span class="cal-map">· <a href="{e(map_url)}" target="_blank" rel="noopener noreferrer">{e(d["map"])} <span aria-hidden="true">↗</span></a></span>'
    meta = f'<p class="cal-meta"><span class="cal-kind">{e(d["kinds"][ev["kind"]])}</span>{place}</p>'
    if ev.get('booth'):
        meta += f'<p class="cal-meta">{e(d["booth"])} {e(ev["booth"])}</p>'
    text = f'<p class="cal-text">{e(words(ev, locale, "note"))}</p>' if words(ev, locale, 'note') else ''
    links = [f'<a href="/{FOLDER}/{e(ev["id"])}-{locale}.ics">{e(d["addOne"])}</a>',
             f'<a href="{e(google_link(locale, t, ev))}" target="_blank" rel="noopener noreferrer">{e(d["google"])} <span aria-hidden="true">↗</span></a>']
    if ev.get('url'):
        links.append(f'<a href="{e(ev["url"])}" target="_blank" rel="noopener noreferrer">{e(d["organiser"])} <span aria-hidden="true">↗</span></a>')
    return (f'<article class="cal-note" id="ev-{e(ev["id"])}"><p class="cal-when">{e(when(locale, t, ev["start"], ev["end"]))}{time}</p>'
            f'<h3>{e(words(ev, locale, "name"))}</h3>{meta}{text}<p class="cal-links">{"".join(links)}</p></article>')


def past_list(locale, t, past):
    items = ''.join(
        f'<li><span class="cal-past-when">{e(when(locale, t, ev["start"], ev["end"], year=True))}</span>'
        f'<span class="cal-past-name">{e(words(ev, locale, "name"))}</span><span class="cal-past-place">{e(words(ev, locale, "place"))}</span></li>'
        for ev in reversed(past))
    return f'<ol class="cal-past-list" reversed>{items}</ol>'


def page(locale, t, image, print_photo, external, events=None, day=None):
    """The <main> of the dates page. image, print_photo and external are the builder's helpers."""
    d = t['dates']
    day = day or today()
    upcoming, past = split(published(events if events is not None else load()[1]), day)
    months = ''.join(sheet(locale, t, y, m, upcoming) for y, m in months_to_show(upcoming, day))
    empty = '' if upcoming else f'<p class="dates-empty">{e(d["empty"])}</p>'
    heading = e(d['heading']).replace('\n', '<br>')
    links = (f'<a class="quiet-link" href="/{FOLDER}/studio-monjo-{locale}.ics">{e(d["subscribe"])}</a>'
             + external(INSTAGRAM, d['instagram'], 'quiet-link'))
    past_section = ''
    if past:
        past_section = (f'<section class="market-story cal-past wrap" aria-labelledby="past-title"><div><p class="eyebrow">{e(d["pastKicker"])}</p>'
                        f'<h2 id="past-title">{e(d["pastTitle"])}</h2><p>{e(d["pastText"])}</p>{past_list(locale, t, past)}</div>'
                        f'{print_photo(image("maison-market", d["pastAlt"]), d["pastCaption"], "tilt-l")}</section>')
    return f'''<main id="main">
<header class="page-hero dates-hero wrap"><p class="eyebrow">{e(d['eyebrow'])}</p><h1>{heading}</h1><div class="page-intro"><p>{e(d['intro'])}</p><div class="dates-links">{links}</div></div></header>
<section class="dates-calendar wrap" aria-labelledby="dates-title"><h2 id="dates-title" class="visually-hidden">{e(d['title'])}</h2>{empty}{months}</section>
{past_section}
<section class="simple-close wrap"><h2>{e(d['close'])}</h2><a class="button" href="/{locale}/notebooks/">{e(d['closeLink'])} <span aria-hidden="true">→</span></a></section>
</main>'''


# ——— Calendar files ———

def stamp(d):
    return d.strftime('%Y%m%d')


def utc(d, tm):
    return datetime.combine(d, tm, SEOUL).astimezone(timezone.utc).strftime('%Y%m%dT%H%M%SZ')


def period(ev):
    """(DTSTART, DTEND) iCalendar values: timed when one day has hours, otherwise whole days."""
    hm = hours(ev)
    if hm and ev['start'] == ev['end']:
        return f'DTSTART:{utc(ev["start"], hm[0])}', f'DTEND:{utc(ev["end"], hm[1])}'
    return f'DTSTART;VALUE=DATE:{stamp(ev["start"])}', f'DTEND;VALUE=DATE:{stamp(ev["end"] + timedelta(days=1))}'


def ics_text(value):
    return str(value).replace('\\', '\\\\').replace(';', '\\;').replace(',', '\\,').replace('\n', '\\n')


def fold(line):
    """Lines longer than 75 octets continue on the next line after a space, without splitting a character."""
    out, current, size = [], '', 0
    for ch in line:
        b = len(ch.encode('utf-8'))
        if size + b > 75:
            out.append(current)
            current, size = ' ' + ch, 1 + b
        else:
            current += ch
            size += b
    out.append(current)
    return '\r\n'.join(out)


def description(locale, t, ev):
    d = t['dates']
    parts = [d['kinds'][ev['kind']]]
    if ev.get('hours'):
        parts.append(f'{d["hours"]} {ev["hours"]}')
    if ev.get('booth'):
        parts.append(f'{d["booth"]} {ev["booth"]}')
    if words(ev, locale, 'note'):
        parts.append(words(ev, locale, 'note'))
    parts.append(f'{BASE}/{locale}/dates/#ev-{ev["id"]}')
    return '\n'.join(parts)


def vevent(locale, t, ev, updated):
    start, end = period(ev)
    lines = ['BEGIN:VEVENT',
             f'UID:{ev["id"]}-{locale}.dates.studiomonjo.com',
             f'DTSTAMP:{updated.replace("-", "")}T000000Z',
             f'LAST-MODIFIED:{updated.replace("-", "")}T000000Z',
             start, end,
             f'SUMMARY:{ics_text("Studio Monjo · " + words(ev, locale, "name"))}',
             f'LOCATION:{ics_text(words(ev, locale, "place"))}',
             f'DESCRIPTION:{ics_text(description(locale, t, ev))}',
             f'URL:{BASE}/{locale}/dates/#ev-{ev["id"]}',
             'STATUS:CONFIRMED',
             'TRANSP:TRANSPARENT',
             'END:VEVENT']
    return lines


def vcalendar(locale, t, events, updated, name):
    lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Studio Monjo//Dates//' + locale.upper(),
             'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', f'X-WR-CALNAME:{ics_text(name)}', 'X-WR-TIMEZONE:Asia/Seoul',
             f'REFRESH-INTERVAL;VALUE=DURATION:P1D', 'X-PUBLISHED-TTL:P1D']
    for ev in events:
        lines.extend(vevent(locale, t, ev, updated))
    lines.append('END:VCALENDAR')
    return ''.join(fold(line) + '\r\n' for line in lines)


def google_link(locale, t, ev):
    hm = hours(ev)
    if hm and ev['start'] == ev['end']:
        dates = f'{utc(ev["start"], hm[0])}/{utc(ev["end"], hm[1])}'
    else:
        dates = f'{stamp(ev["start"])}/{stamp(ev["end"] + timedelta(days=1))}'
    query = {'action': 'TEMPLATE', 'text': 'Studio Monjo · ' + words(ev, locale, 'name'), 'dates': dates,
             'location': words(ev, locale, 'place'), 'details': description(locale, t, ev), 'ctz': 'Asia/Seoul'}
    return 'https://calendar.google.com/calendar/render?' + '&'.join(f'{k}={quote_plus(v)}' for k, v in query.items())


def chooser(copy):
    """/calendar/ opens the dates page in the reader's language, like the root address does for the walk."""
    links = ' · '.join(f'<a href="/{l}/dates/" lang="{l}">{label}</a>' for l, label in (('en', 'English'), ('fr', 'Français'), ('ko', '한국어')))
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dates · Studio Monjo</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="{BASE}/en/dates/">
<link rel="icon" type="image/png" sizes="32x32" href="/media/web/branding/favicon-32.png">
<script>
(function () {{
  try {{
    var qs = new URLSearchParams(location.search);
    var forced = qs.get('lang');
    var saved = null;
    try {{ saved = localStorage.getItem('sm-lang'); }} catch (e) {{}}
    var browser = (navigator.language || navigator.userLanguage || '').toLowerCase();
    var locale = forced || saved || (browser.indexOf('fr') === 0 ? 'fr' : (browser.indexOf('ko') === 0 ? 'ko' : 'en'));
    if (locale !== 'en' && locale !== 'ko' && locale !== 'fr') locale = 'en';
    try {{ localStorage.setItem('sm-lang', locale); }} catch (e) {{}}
    location.replace('/' + locale + '/dates/' + (location.hash || ''));
  }} catch (e) {{
    location.replace('/en/dates/');
  }}
}})();
</script>
<noscript><meta http-equiv="refresh" content="0; url=/en/dates/"></noscript>
</head>
<body>
<main style="font-family:system-ui,sans-serif;padding:24px;color:#16243f"><h1>Studio Monjo</h1><p>{e(copy['en']['dates']['description'])}</p><p>{links}</p></main>
</body>
</html>
'''


def write_files(copy, day=None):
    """The chooser and the calendar files: one feed per language and one file per published date."""
    updated, events = load()
    shown = published(events)
    folder = ROOT / FOLDER
    folder.mkdir(exist_ok=True)
    for old in folder.glob('*.ics'):
        old.unlink()
    (folder / 'index.html').write_text(chooser(copy))
    upcoming, _ = split(shown, day or today())
    for locale, t in copy.items():
        # The feed keeps the whole year; a file of its own exists only for a date still to come.
        (folder / f'studio-monjo-{locale}.ics').write_bytes(vcalendar(locale, t, shown, updated, 'Studio Monjo').encode('utf-8'))
        for ev in upcoming:
            (folder / f'{ev["id"]}-{locale}.ics').write_bytes(vcalendar(locale, t, [ev], updated, 'Studio Monjo · ' + words(ev, locale, 'name')).encode('utf-8'))
    pending = [ev['id'] for ev in events if ev['status'] == 'pending']
    if os.environ.get('DATES_PREVIEW') == '1':
        print('PREVIEW BUILD: pending dates are shown. Rebuild without DATES_PREVIEW before committing.')
    elif pending:
        print('Pending, not published: ' + ', '.join(pending))
    return shown


def graph(locale, t, url, studio, picture, day=None):
    """Event entities for the page's structured data: the published dates still to come."""
    upcoming, _ = split(published(load()[1]), day or today())
    nodes = []
    for ev in upcoming:
        hm = hours(ev)
        if hm and ev['start'] == ev['end']:
            start = datetime.combine(ev['start'], hm[0], SEOUL).isoformat()
            end = datetime.combine(ev['end'], hm[1], SEOUL).isoformat()
        else:
            start, end = ev['start'].isoformat(), ev['end'].isoformat()
        node = {'@type': 'Event', '@id': f'{url}#ev-{ev["id"]}', 'name': words(ev, locale, 'name'),
                'startDate': start, 'endDate': end, 'url': f'{url}#ev-{ev["id"]}',
                'eventStatus': 'https://schema.org/EventScheduled',
                'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
                'location': {'@type': 'Place', 'name': words(ev, locale, 'place'), 'address': words(ev, locale, 'place')},
                'organizer': {'@id': studio}, 'image': picture,
                'description': words(ev, locale, 'note') or t['dates']['description']}
        nodes.append(node)
    return nodes
