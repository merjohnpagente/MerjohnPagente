import fs from 'node:fs';

const colors = {
  cb: '#0B1B33',
  cs: '#EAF1FB',
  ce: '#1D3A66',
  c0: '#1D3A66',
  c1: '#5A4414',
  c2: '#8A6416',
  c3: '#B57C16',
  c4: '#FFB02E',
};

const palette = `:root{${Object.entries(colors)
  .map(([name, value]) => `--${name}:${value}`)
  .join(';')}}`;

const font = "'Segoe UI','Helvetica Neue',Helvetica,Arial,sans-serif";

const card = `<rect x="-16" y="-76" width="880" height="236" rx="18" fill="#17325C"/>
<rect x="-15.25" y="-75.25" width="878.5" height="234.5" rx="17.5" fill="none" stroke="#35557F" stroke-width="1.5"/>
<text x="4" y="-44" font-family="${font}" font-size="20" font-weight="800" fill="#EAF1FB">Contribution snake</text>
<text x="4" y="-22" font-family="${font}" font-size="11" fill="#AFC3E2">Every contribution, one bite at a time.</text>
<path d="M4 -11 H84" stroke="#FFB02E" stroke-width="2" stroke-linecap="round"/>
<text x="686" y="-40" text-anchor="end" font-family="${font}" font-size="10" fill="#AFC3E2">Less</text>
<rect x="700" y="-48" width="12" height="12" rx="3" fill="#1D3A66" stroke="#35557F"/>
<rect x="716" y="-48" width="12" height="12" rx="3" fill="#5A4414" stroke="#35557F"/>
<rect x="732" y="-48" width="12" height="12" rx="3" fill="#8A6416" stroke="#35557F"/>
<rect x="748" y="-48" width="12" height="12" rx="3" fill="#B57C16" stroke="#35557F"/>
<rect x="764" y="-48" width="12" height="12" rx="3" fill="#FFB02E" stroke="#FFD27A"/>
<text x="786" y="-40" font-family="${font}" font-size="10" fill="#AFC3E2">More</text>`;

for (const input of process.argv.slice(2)) {
  let svg = fs.readFileSync(input, 'utf8');

  if (svg.includes('Contribution snake')) {
    console.log(`already styled: ${input}`);
    continue;
  }

  svg = svg.replace(
    'viewBox="-16 -32 880 192" width="880" height="192"',
    'viewBox="-16 -76 880 236" width="880" height="236"',
  );
  svg = svg.replace(/:root\{[^}]*\}/, palette);
  svg = svg.replace(/var\(--(c[0-4]|cb|cs|ce)\)/g, (_, name) => colors[name]);
  svg = svg.replace(/(<svg[^>]*>)/, `$1${card}`);

  if (!svg.includes('viewBox="-16 -76 880 236"') || /var\(--/.test(svg)) {
    throw new Error(`Could not style snake SVG: ${input}`);
  }

  fs.writeFileSync(input, svg);
  console.log(`styled: ${input}`);
}
