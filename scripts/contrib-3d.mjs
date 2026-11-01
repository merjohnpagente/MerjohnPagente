import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svgPath = path.join(root, 'assets/contrib-3d.svg');
const readmePath = path.join(root, 'README.md');
const login = process.env.GITHUB_REPOSITORY_OWNER || 'merjohnpagente';

const LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

function normalize(raw) {
  if (Array.isArray(raw.contributions) && raw.total) {
    return {
      total: Number(raw.total.lastYear),
      days: raw.contributions.map((day) => ({
        date: day.date,
        count: Number(day.count) || 0,
        level: Math.max(0, Math.min(4, Number(day.level) || 0)),
      })),
    };
  }

  const calendar = raw?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new Error('Unexpected contribution data shape.');
  }

  return {
    total: calendar.totalContributions,
    days: calendar.weeks
      .flatMap((week) => week.contributionDays)
      .map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: LEVELS[day.contributionLevel] ?? 0,
      })),
  };
}

async function fetchGraphQL() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is not set.');
  }

  const query = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }`;

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      authorization: `bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'merjohnpagente-profile',
    },
    body: JSON.stringify({ query, variables: { login } }),
  });

  const payload = await response.json();
  if (!response.ok || payload.errors) {
    throw new Error(
      payload.errors?.map((error) => error.message).join('; ') ||
        `GraphQL request failed with ${response.status}.`,
    );
  }

  return normalize(payload);
}

async function fetchPublicCalendar() {
  const response = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(login)}?y=last`,
    { headers: { 'user-agent': 'merjohnpagente-profile' } },
  );

  if (!response.ok) {
    throw new Error(`Contribution API failed with ${response.status}.`);
  }

  return normalize(await response.json());
}

async function loadCalendar() {
  const inputPath = process.argv[2];
  if (inputPath) {
    return normalize(JSON.parse(fs.readFileSync(inputPath, 'utf8')));
  }

  try {
    const calendar = await fetchGraphQL();
    if (calendar.total === 0) {
      throw new Error('GraphQL returned an empty contribution calendar.');
    }
    return calendar;
  } catch (error) {
    console.warn(`GraphQL unavailable (${error.message}); trying public calendar.`);
    return fetchPublicCalendar();
  }
}

function writeIfChanged(file, content) {
  const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (previous === content) {
    return false;
  }
  fs.writeFileSync(file, content);
  return true;
}

const { total, days } = await loadCalendar();
if (!days.length) {
  throw new Error('The contribution calendar is empty.');
}

const active = days.filter((day) => day.count > 0).length;

const weeks = [];
days.forEach((day, index) => {
  const week = Math.floor(index / 7);
  if (!weeks[week]) weeks[week] = [];
  weeks[week].push(day);
});

const W = 1200;
const H = 520;
const originX = 324;
const originY = 160;
const tileW = 24;
const tileH = 11;
const barW = 16;
const barD = 8;

const palette = {
  0: { top: '#1D3A66', left: '#152E52', right: '#19345C', stroke: '#2B4C80' },
  1: { top: '#6B5320', left: '#463614', right: '#574318', stroke: '#8A6A1F' },
  2: { top: '#A87A1E', left: '#6E4F12', right: '#8A6416', stroke: '#C08A1F' },
  3: { top: '#D99A24', left: '#8F6412', right: '#B57C16', stroke: '#E8A326' },
  4: { top: '#FFB02E', left: '#B57C16', right: '#D99A24', stroke: '#FFD27A' },
};

function diamond(cx, cy, w, d, fill, stroke, extra = '') {
  return `<polygon points="${cx},${cy - d / 2} ${cx + w / 2},${cy} ${cx},${cy + d / 2} ${cx - w / 2},${cy}" fill="${fill}" stroke="${stroke}" stroke-width=".6" ${extra}/>`;
}

let bars = '';
let tiles = '';
for (let week = 0; week < weeks.length; week++) {
  const daysInWeek = weeks[week];
  for (let day = 0; day < daysInWeek.length; day++) {
    const contribution = daysInWeek[day];
    const cx = originX + (week - day) * (tileW / 2);
    const cy = originY + (week + day) * (tileH / 2);
    const level = contribution.level;
    const height = level * 14;
    const delay = (week * 0.018 + day * 0.006).toFixed(3);
    const title = `${contribution.date} · ${contribution.count} contribution${contribution.count === 1 ? '' : 's'}`;
    const colors = palette[level];

    if (level === 0) {
      tiles += `<g transform="translate(${cx} ${cy})"><g class="tile" style="--d:${delay}s"><title>${title}</title>${diamond(0, 0, barW, barD, colors.top, colors.stroke)}</g></g>`;
    } else {
      const hot = level === 4 ? ' class="hot"' : '';
      bars += `<g transform="translate(${cx} ${cy})"><g class="bar" style="--d:${delay}s"><title>${title}</title>` +
        `<polygon points="${-barW / 2},${-height} 0,${-height + barD / 2} 0,${barD / 2} ${-barW / 2},0" fill="${colors.left}"/>` +
        `<polygon points="0,${-height + barD / 2} ${barW / 2},${-height} ${barW / 2},0 0,${barD / 2}" fill="${colors.right}"/>` +
        `<polygon${hot} points="0,${-height - barD / 2} ${barW / 2},${-height} 0,${-height + barD / 2} ${-barW / 2},${-height}" fill="${colors.top}" stroke="${colors.stroke}" stroke-width=".7"/>` +
        `</g></g>`;
    }
  }
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabels = [];
const seen = new Set();
days.forEach((day, index) => {
  const month = day.date.slice(5, 7);
  if (seen.has(month)) return;
  seen.add(month);
  const week = Math.floor(index / 7);
  const x = originX + (week - 6) * (tileW / 2);
  const y = originY + (week + 6) * (tileH / 2) + 18;
  monthLabels.push(`<text x="${x}" y="${y}" text-anchor="middle" font-size="12" font-weight="600" fill="#C9D8EE">${monthNames[Number(month) - 1]}</text>`);
});

const legend = [0, 1, 2, 3, 4]
  .map((level, index) => diamond(966 + index * 26, 57, 14, 7, palette[level].top, palette[level].stroke))
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">A year of shipping — ${total} contributions in the last year</title>
<desc id="d">An animated 3D isometric contribution graph for ${login}: ${total} contributions across ${active} active days.</desc>
<defs>
<pattern id="gridMinor" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#2B4C80" stroke-width="1" opacity="0.3"/></pattern>
<pattern id="gridMajor" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" fill="none" stroke="#3B6AA8" stroke-width="1.2" opacity="0.24"/></pattern>
<radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFB02E" stop-opacity="0.16"/><stop offset="100%" stop-color="#FFB02E" stop-opacity="0"/></radialGradient>
<radialGradient id="glowGold2" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#FFB02E" stop-opacity="0.2"/><stop offset="100%" stop-color="#FFB02E" stop-opacity="0"/></radialGradient>
<linearGradient id="rule" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#FFB02E"/><stop offset="100%" stop-color="#FFB02E" stop-opacity="0"/></linearGradient>
<filter id="hotGlow" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<clipPath id="cardClip"><rect width="${W}" height="${H}" rx="18"/></clipPath>
</defs>
<style>
text{font-family:'Segoe UI','Helvetica Neue',Helvetica,Arial,system-ui,sans-serif}
@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes hotPulse{0%,100%{opacity:1}50%{opacity:.72}}
@keyframes shimmer{0%,100%{opacity:.35}50%{opacity:.9}}
.bar{animation:rise .75s cubic-bezier(.2,.7,.2,1) var(--d,0s) both}
.tile{animation:fade .6s ease-out var(--d,0s) both}
.hot{animation:hotPulse 4.5s ease-in-out infinite;filter:url(#hotGlow)}
.f{animation:fade .8s ease-out var(--d,0s) both}
.shimmer{animation:shimmer 6s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.bar,.tile,.f,.hot,.shimmer{animation:none}}
</style>
<g clip-path="url(#cardClip)">
<rect width="${W}" height="${H}" fill="#17325C"/>
<rect width="${W}" height="${H}" fill="url(#gridMinor)"/>
<rect width="${W}" height="${H}" fill="url(#gridMajor)"/>
<ellipse cx="600" cy="330" rx="420" ry="190" fill="url(#glow)"/>
<ellipse cx="860" cy="410" rx="270" ry="140" fill="url(#glowGold2)"/>
</g>
<text class="f" style="--d:.5s" x="60" y="458" font-size="190" font-weight="800" fill="#3B6AA8" opacity="0.07" letter-spacing="-8">${total}</text>
<rect x=".75" y=".75" width="${W - 1.5}" height="${H - 1.5}" rx="17.5" fill="none" stroke="#35557F" stroke-width="1.5"/>

<g class="f" style="--d:.05s">
<text x="60" y="58" font-size="30" font-weight="800" fill="#EAF1FB" letter-spacing="-0.5">A year of shipping</text>
<text x="60" y="88" font-size="15" fill="#AFC3E2">${total} contributions across ${active} active days</text>
<path d="M60 104 H190" stroke="url(#rule)" stroke-width="2.5" stroke-linecap="round"/>
</g>

<g class="f" style="--d:.2s">
<text x="900" y="61" text-anchor="end" font-size="11" fill="#AFC3E2">Less</text>
${legend}
<text x="1094" y="61" font-size="11" fill="#AFC3E2">More</text>
</g>

<g class="f" style="--d:.3s">
${monthLabels.join('\n')}
</g>

${tiles}
${bars}

<g class="f" style="--d:1.1s">
<text x="60" y="497" font-size="11" fill="#6F87AD">Last 12 months · generated from GitHub contributions</text>
<text x="1140" y="497" text-anchor="end" font-size="11" fill="#6F87AD">${login}.github.io</text>
</g>
</svg>
`;

const svgChanged = writeIfChanged(svgPath, svg);

const readme = fs.readFileSync(readmePath, 'utf8');
const altPattern = /alt="3D isometric GitHub contribution graph[^"]*"/;
if (!altPattern.test(readme)) {
  throw new Error('Could not find the 3D contribution graph alt text in README.md.');
}
const nextReadme = readme.replace(
  altPattern,
  `alt="3D isometric GitHub contribution graph — ${total} contributions across ${active} active days"`,
);
const readmeChanged = writeIfChanged(readmePath, nextReadme);

console.log(
  `contrib-3d: ${total} contributions across ${active} active days; ` +
    `svg ${svgChanged ? 'updated' : 'unchanged'}, readme ${readmeChanged ? 'updated' : 'unchanged'}.`,
);
