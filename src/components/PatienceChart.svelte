<script>
	import { line, scaleLinear } from "d3";
	import raw from "$data/patience.csv";

	// mode: "year" = 실제 연도 / "elapsed" = 시작 후 경과연수(출발선 정렬)
	// annotations: 차트 위에 얹는 해설 [{ domain, year, lines[], dx, dy, anchor }]
	let { mode = "year", title = "", subtitle = "", annotations = [] } = $props();

	const rows = raw.map((d) => ({ domain: d.domain, year: +d.year, index100: +d.index100 }));

	// 호버된 영역(선) — null이면 평상시
	let hovered = $state(null);

	const labels = {
		stocks: "주식 보유기간",
		film_asl: "영화 숏 길이",
		soundbite: "뉴스 사운드바이트",
		attention: "화면 집중시간",
		jobtenure: "직장 근속연수"
	};
	const COUNTER = "jobtenure";

	const domains = [...new Set(rows.map((d) => d.domain))];
	const isElapsed = $derived(mode === "elapsed");

	const series = $derived(
		domains.map((dm) => {
			const values = rows.filter((r) => r.domain === dm).sort((a, b) => a.year - b.year);
			const firstYear = values[0].year;
			return {
				domain: dm,
				isCounter: dm === COUNTER,
				// 각 점을 (x, y)로 변환: elapsed면 경과연수, 아니면 실제 연도
				points: values.map((v) => ({
					x: isElapsed ? v.year - firstYear : v.year,
					y: v.index100,
					year: v.year
				}))
			};
		})
	);

	const width = 820;
	const height = 480;
	const margin = { top: 24, right: 150, bottom: 46, left: 48 };
	const iw = width - margin.left - margin.right;
	const ih = height - margin.top - margin.bottom;

	// x 스케일 + 눈금은 mode에 따라
	const xTicks = $derived(isElapsed ? [0, 20, 40, 60, 80] : [1930, 1950, 1970, 1990, 2010, 2024]);
	const xAxisLabel = $derived(isElapsed ? "시작 후 경과연수" : "연도");

	const x = $derived(scaleLinear().domain(isElapsed ? [0, 80] : [1930, 2024]).range([0, iw]));
	const y = scaleLinear().domain([0, 100]).range([ih, 0]);
	const yTicks = [0, 25, 50, 75, 100];

	const path = $derived(
		line()
			.x((d) => x(d.x))
			.y((d) => y(d.y))
	);

	const last = (s) => s.points[s.points.length - 1];

	// 주석이 가리키는 데이터 점의 픽셀 좌표
	const anchorPx = $derived((a) => {
		const s = series.find((se) => se.domain === a.domain);
		const p = s?.points.find((pt) => pt.year === a.year);
		return p ? { px: x(p.x), py: y(p.y) } : null;
	});
</script>

<figure class="chart">
	{#if title}<h3 class="title">{title}</h3>{/if}
	{#if subtitle}<p class="subtitle">{subtitle}</p>{/if}

	<svg viewBox="0 0 {width} {height}" role="img" aria-label={title}>
		<g transform="translate({margin.left},{margin.top})">
			{#each yTicks as t}
				<g transform="translate(0,{y(t)})">
					<line class="grid" x1="0" x2={iw} />
					<text class="tick" x="-10" dy="0.32em" text-anchor="end">{t}</text>
				</g>
			{/each}

			{#each xTicks as t}
				<text class="tick" x={x(t)} y={ih + 26} text-anchor="middle">{t}</text>
			{/each}
			<text class="axislabel" x={iw / 2} y={ih + 42} text-anchor="middle">{xAxisLabel}</text>

			{#each series as s}
				<path
					class="series {s.isCounter ? 'counter' : 'fall'}"
					class:dim={hovered && hovered !== s.domain}
					class:active={hovered === s.domain}
					d={path(s.points)}
				/>
				<text
					class="label {s.isCounter ? 'counter' : 'fall'}"
					class:dim={hovered && hovered !== s.domain}
					x={x(last(s).x) + 8}
					y={y(last(s).y)}
					dy="0.32em">{labels[s.domain]}</text
				>
			{/each}

			<!-- 주석: 항상 보이는 결론(sticky) + 호버된 영역의 해설 -->
			{#each annotations.filter((a) => a.sticky || a.domain === hovered) as a}
				{@const p = anchorPx(a)}
				{#if p}
					{@const bx = p.px + a.dx}
					{@const by = p.py + a.dy}
					{@const boxW = a.w ?? 200}
					{@const leadX = Math.max(bx, Math.min(p.px, bx + boxW))}
					<line class="leader" x1={p.px} y1={p.py} x2={leadX} y2={by} />
					<circle class="anchor-dot {a.tone ?? ''}" cx={p.px} cy={p.py} r="3.5" />
					<foreignObject class="annot-fo" x={bx} y={by} width={boxW} height="80">
						<div class="annot-box {a.tone ?? ''}" xmlns="http://www.w3.org/1999/xhtml">
							{#each a.lines as ln, i}
								<div class={i === 0 ? "annot-head" : "annot-sub"}>{ln}</div>
							{/each}
						</div>
					</foreignObject>
				{/if}
			{/each}

			<!-- 넓은 투명 히트영역: 선 위에 마우스를 올리기 쉽게 -->
			{#each series as s}
				<path
					class="hit"
					d={path(s.points)}
					role="button"
					tabindex="0"
					aria-label={labels[s.domain]}
					onmouseenter={() => (hovered = s.domain)}
					onmouseleave={() => (hovered = null)}
					onfocus={() => (hovered = s.domain)}
					onblur={() => (hovered = null)}
				/>
			{/each}
		</g>
	</svg>
</figure>

<style>
	.chart {
		margin: 2rem auto;
		max-width: 900px;
	}
	/* 제목·부제 = 한글 명조 */
	.title {
		font-family: var(--font-serif);
		font-weight: 600;
		font-size: 1.4rem;
		line-height: 1.35;
		letter-spacing: -0.01em;
		color: var(--revibe-ink);
		margin: 0 0 0.35rem;
	}
	.subtitle {
		font-family: var(--font-serif);
		font-weight: 400;
		margin: 0 0 1.25rem;
		color: var(--revibe-ink-soft);
		font-size: 0.95rem;
		line-height: 1.5;
	}
	svg {
		width: 100%;
		height: auto;
		overflow: visible;
	}
	/* 헤어라인 격자 */
	.grid {
		stroke: var(--revibe-hairline);
		stroke-width: 1;
	}
	/* 축 눈금·라벨 = 산세리프 */
	.tick,
	.axislabel {
		font-family: var(--font-sans);
		fill: var(--revibe-ink-soft);
		font-size: 12px;
	}
	.series {
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
		transition: opacity 0.15s ease, stroke-width 0.15s ease;
	}
	/* 호버 시: 다른 선은 흐리게, 선택된 선은 도드라지게 */
	.series.dim,
	.label.dim {
		opacity: 0.15;
	}
	.series.active {
		stroke-width: 3;
	}
	.label {
		transition: opacity 0.15s ease;
	}
	/* 넓은 투명 히트영역 */
	.hit {
		fill: none;
		stroke: transparent;
		stroke-width: 18;
		cursor: pointer;
	}
	.hit:focus {
		outline: none;
	}
	/* 급락 4선: 조용한 웜 그레이, 가늘게 */
	.series.fall {
		stroke: var(--revibe-fall);
		stroke-width: 1.5;
	}
	/* 반례선: 벽돌 적색, 굵게 */
	.series.counter {
		stroke: var(--revibe-accent);
		stroke-width: 3;
	}
	/* 선 끝 라벨 = 산세리프 */
	.label {
		font-family: var(--font-sans);
		font-size: 13px;
	}
	.label.fall {
		fill: var(--revibe-ink-soft);
	}
	.label.counter {
		fill: var(--revibe-accent);
		font-weight: 700;
	}
	/* 주석: 얇은 리더선 + 명조 해설 (= 편집자가 덧붙인 손가락) */
	.leader {
		stroke: var(--revibe-ink-soft);
		stroke-width: 1;
	}
	.anchor-dot {
		fill: var(--revibe-ink-soft);
	}
	.anchor-dot.accent {
		fill: var(--revibe-accent);
	}
	/* 주석 박스 = 편집자 노트 카드 */
	.annot-fo {
		overflow: visible;
	}
	.annot-box {
		display: inline-block;
		background: var(--revibe-bg);
		border: 1px solid var(--revibe-hairline);
		border-left: 3px solid var(--revibe-ink-soft);
		border-radius: 4px;
		padding: 8px 12px;
		box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
	}
	.annot-box.accent {
		border-left-color: var(--revibe-accent);
	}
	.annot-head {
		font-family: var(--font-serif);
		font-size: 14px;
		font-weight: 600;
		line-height: 1.4;
		color: var(--revibe-ink);
	}
	.annot-box.accent .annot-head {
		color: var(--revibe-accent);
	}
	.annot-sub {
		font-family: var(--font-serif);
		font-size: 12.5px;
		line-height: 1.4;
		color: var(--revibe-ink-soft);
		margin-top: 2px;
	}
</style>
