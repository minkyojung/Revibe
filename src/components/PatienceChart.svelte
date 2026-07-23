<script>
	import { line, scaleLinear } from "d3";
	import raw from "$data/patience.csv";

	// dsv가 문자열로 파싱하므로 숫자로 변환
	const rows = raw.map((d) => ({ domain: d.domain, year: +d.year, index100: +d.index100 }));

	// 한글 라벨 + 반례선 지정
	const labels = {
		stocks: "주식 보유기간",
		film_asl: "영화 숏 길이",
		soundbite: "뉴스 사운드바이트",
		attention: "화면 집중시간",
		jobtenure: "직장 근속연수"
	};
	const COUNTER = "jobtenure"; // 혼자 버티는 반례선

	// 도메인별로 연도순 묶기
	const domains = [...new Set(rows.map((d) => d.domain))];
	const series = domains.map((dm) => ({
		domain: dm,
		isCounter: dm === COUNTER,
		values: rows.filter((r) => r.domain === dm).sort((a, b) => a.year - b.year)
	}));

	// 치수
	const width = 820;
	const height = 520;
	const margin = { top: 28, right: 150, bottom: 46, left: 48 };
	const iw = width - margin.left - margin.right;
	const ih = height - margin.top - margin.bottom;

	// 스케일 (버전 a: 실제 연도)
	const x = scaleLinear().domain([1930, 2024]).range([0, iw]);
	const y = scaleLinear().domain([0, 100]).range([ih, 0]);

	const path = line()
		.x((d) => x(d.year))
		.y((d) => y(d.index100));

	const xTicks = [1930, 1950, 1970, 1990, 2010, 2024];
	const yTicks = [0, 25, 50, 75, 100];

	const last = (s) => s.values[s.values.length - 1];
</script>

<figure class="chart">
	<h3 class="title">기다림은 전방위로 줄었다 — 그러나 균일하지 않다</h3>
	<p class="subtitle">각 영역의 "보상까지 기다리는 시간", 시작점을 100으로 맞춤 (index100)</p>

	<svg viewBox="0 0 {width} {height}" role="img" aria-label="영역별 인내 감소 겹치기 선차트">
		<g transform="translate({margin.left},{margin.top})">
			<!-- y 격자 + 눈금 -->
			{#each yTicks as t}
				<g transform="translate(0,{y(t)})">
					<line class="grid" x1="0" x2={iw} />
					<text class="tick" x="-10" dy="0.32em" text-anchor="end">{t}</text>
				</g>
			{/each}

			<!-- x 눈금 -->
			{#each xTicks as t}
				<text class="tick" x={x(t)} y={ih + 26} text-anchor="middle">{t}</text>
			{/each}

			<!-- 선: 급락 4선(톤 통일) + 반례선(강조) -->
			{#each series as s}
				<path
					class="series {s.isCounter ? 'counter' : 'fall'}"
					d={path(s.values)}
				/>
				<!-- 선 끝 라벨 -->
				<text
					class="label {s.isCounter ? 'counter' : 'fall'}"
					x={x(last(s).year) + 8}
					y={y(last(s).index100)}
					dy="0.32em"
				>
					{labels[s.domain]}
				</text>
			{/each}

			<!-- 반례선 주석 -->
			<text class="annotation" x={x(2024) + 8} y={y(78) - 16}>
				직장 근속만 홀로 버틴다
			</text>
		</g>
	</svg>
</figure>

<style>
	.chart {
		margin: 2rem auto;
		max-width: 900px;
	}
	.title {
		font-size: 1.4rem;
		margin: 0 0 0.25rem;
	}
	.subtitle {
		margin: 0 0 1rem;
		color: #666;
		font-size: 0.95rem;
	}
	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}
	.grid {
		stroke: #e6e6e6;
		stroke-width: 1;
	}
	.tick {
		fill: #999;
		font-size: 12px;
	}
	.series {
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	/* 급락 4선: 조용한 톤으로 통일 */
	.series.fall {
		stroke: #9aa5b1;
		stroke-width: 2;
	}
	/* 반례선: 굵고 선명하게 */
	.series.counter {
		stroke: #e8590c;
		stroke-width: 3.5;
	}
	.label {
		font-size: 13px;
	}
	.label.fall {
		fill: #6b7480;
	}
	.label.counter {
		fill: #e8590c;
		font-weight: 700;
	}
	.annotation {
		fill: #e8590c;
		font-size: 13px;
		font-style: italic;
	}
</style>
