const tokenRegex = /\"([^\"]+)\"|'([^']+)'|([^,;\n|]+)/g;

function parse(input) {
  const keywords = [];
  let m;
  while ((m = tokenRegex.exec(input)) !== null) {
    const kw = (m[1] || m[2] || m[3] || '').trim();
    if (kw.length > 0) keywords.push(kw);
  }
  return keywords;
}

const cases = [
  'statistiques descriptives',
  'statistiques descriptives, analyse descriptive',
  '"statistiques descriptives", autre mot; troisième',
  "statistiques descriptives|autre mot|troisieme",
  'mot1;mot2; "phrase avec, virgule"; mot3',
  '   espaces   multiples   ',
  '"terme, complexe;avec|separateurs"; simple'
];

for (const c of cases) {
  console.log('INPUT :', c);
  console.log('PARSED:', parse(c));
  console.log('---');
}
