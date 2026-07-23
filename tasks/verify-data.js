// 데이터 검증 스크립트 (읽기 전용 QA). 실행: node tasks/verify-data.js
// 목적: patience.csv 의 index100·감소율이 손계산과 일치하는지 재계산 대조 + 데이터 품질 진단.
import { readFileSync } from "fs";
import { csvParse } from "d3-dsv";

const raw = readFileSync(new URL("../src/data/patience.csv", import.meta.url), "utf8");
const rows = csvParse(raw, (d) => ({
	domain: d.domain,
	year: +d.year,
	raw_value: +d.raw_value,
	unit: d.unit,
	index100_stated: +d.index100,
	source_note: d.source_note || ""
}));

// 도메인별로 연도순 정렬해 묶기
const byDomain = new Map();
for (const r of rows) {
	if (!byDomain.has(r.domain)) byDomain.set(r.domain, []);
	byDomain.get(r.domain).push(r);
}
for (const arr of byDomain.values()) arr.sort((a, b) => a.year - b.year);

const line = (s = "") => console.log(s);
const f1 = (x) => x.toFixed(1);
const pct = (x) => (x * 100).toFixed(1) + "%";

// ── 검증 ① 정규화(index100) 재계산 대조 ──────────────────────────
line("═══ ① index100 재계산 대조 (재계산 = raw / 첫해값 × 100) ═══");
let idxMismatch = 0;
for (const [domain, arr] of byDomain) {
	const base = arr[0].raw_value;
	for (const r of arr) {
		const recomputed = (r.raw_value / base) * 100;
		const diff = Math.abs(recomputed - r.index100_stated);
		const ok = diff < 0.1; // 반올림 오차 허용
		if (!ok) idxMismatch++;
		const flag = ok ? "OK " : "⚠️MISMATCH";
		line(
			`${flag}  ${domain.padEnd(10)} ${r.year}  raw=${String(r.raw_value).padEnd(6)} stated=${f1(
				r.index100_stated
			).padStart(6)}  recomputed=${f1(recomputed).padStart(6)}  Δ=${diff.toFixed(2)}`
		);
	}
}
line(idxMismatch === 0 ? "→ 전부 일치 ✅" : `→ 불일치 ${idxMismatch}건 ⚠️`);
line();

// ── 검증 ② 10년당 감소율 재계산 + 순위 ────────────────────────────
// 공식(지시서): rate = (끝값/시작값)^(1/구간_10년수) − 1
line("═══ ② 10년당 감소율 재계산 + 순위 ═══");
const stated = { attention: -0.52, soundbite: -0.41, stocks: -0.38, film_asl: -0.18, jobtenure: -0.06 };
const results = [];
for (const [domain, arr] of byDomain) {
	const start = arr[0];
	const end = arr[arr.length - 1];
	const decades = (end.year - start.year) / 10;
	const ratio = end.raw_value / start.raw_value;
	const rate = Math.pow(ratio, 1 / decades) - 1;
	results.push({ domain, startYear: start.year, endYear: end.year, decades, rate, points: arr.length });
}
results.sort((a, b) => a.rate - b.rate); // 가장 급락(음수 큼)부터
let rank = 1;
for (const r of results) {
	const s = stated[r.domain];
	const diff = s !== undefined ? Math.abs(r.rate - s) : null;
	const cmp = s !== undefined ? `지시서=${pct(s)}  Δ=${(Math.abs(r.rate - s) * 100).toFixed(1)}pt` : "";
	line(
		`#${rank}  ${r.domain.padEnd(10)} ${r.startYear}→${r.endYear} (${r.decades}십년, ${r.points}점)  재계산=${pct(
			r.rate
		).padStart(7)}  ${cmp}`
	);
	rank++;
}
line("→ 순위(급락순): " + results.map((r) => r.domain).join(" > "));
line();

// ── 검증 ③ 데이터 품질 진단 ───────────────────────────────────────
line("═══ ③ 데이터 품질 진단 ═══");
for (const [domain, arr] of byDomain) {
	const years = arr.map((r) => r.year);
	const span = years[years.length - 1] - years[0];
	const gaps = years.slice(1).map((y, i) => y - years[i]);
	const minGap = Math.min(...gaps);
	const maxGap = Math.max(...gaps);
	const uneven = maxGap - minGap;
	// 단조 감소 여부 (raw 기준)
	let mono = true;
	for (let i = 1; i < arr.length; i++) if (arr[i].raw_value > arr[i - 1].raw_value) mono = false;
	// 근사/불확실 표기 감지
	const approx = arr.filter((r) => /approx|근사|일부|~/.test(r.source_note)).length;
	const missing = arr.filter((r) => !Number.isFinite(r.raw_value) || !Number.isFinite(r.year)).length;
	const notes = [];
	if (arr.length <= 3) notes.push(`표본희박(${arr.length}점)`);
	if (uneven > 10) notes.push(`간격불균일(${minGap}~${maxGap}년)`);
	if (!mono) notes.push("비단조(중간 반등 존재)");
	if (approx > 0) notes.push(`근사값 ${approx}건`);
	if (missing > 0) notes.push(`결측 ${missing}건`);
	line(
		`${domain.padEnd(10)} 구간 ${years[0]}–${years[years.length - 1]} (${span}년, ${arr.length}점, 밀도 ${(
			span / (arr.length - 1)
		).toFixed(1)}년/점)  ${notes.length ? "⚑ " + notes.join(", ") : "특이사항 없음"}`
	);
}
line();
line("완료.");
