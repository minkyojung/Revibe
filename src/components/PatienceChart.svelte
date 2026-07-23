<script>
	import { line, scaleLinear } from "d3";
	import raw from "$data/patience.csv";

	// mode: "year" = 실제 연도 / "elapsed" = 시작 후 경과연수(출발선 정렬)
	let { mode = "year", title = "", subtitle = "" } = $props();

	const rows = raw.map((d) => ({ domain: d.domain, year: +d.year, index100: +d.index100 }));

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
					y: v.index100
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
				<path class="series {s.isCounter ? 'counter' : 'fall'}" d={path(s.points)} />
				<text
					class="label {s.isCounter ? 'counter' : 'fall'}"
					x={x(last(s).x) + 8}
					y={y(last(s).y)}
					dy="0.32em">{labels[s.domain]}</text
				>
			{/each}
		</g>
	</svg>
</figure>

<style>
	.chart {
		margin: 1.5rem auto;
		max-width: 900px;
	}
	.title {
		font-size: 1.25rem;
		margin: 0 0 0.25rem;
	}
	.subtitle {
		margin: 0 0 0.75rem;
		color: #666;
		font-size: 0.9rem;
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
	.axislabel {
		fill: #999;
		font-size: 12px;
	}
	.series {
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.series.fall {
		stroke: #9aa5b1;
		stroke-width: 2;
	}
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
</style>
