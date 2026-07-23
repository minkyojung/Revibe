<script>
	import Meta from "$components/Meta.svelte";
	import PatienceChart from "$components/PatienceChart.svelte";
	import copy from "$data/copy.json";
	import "$utils/version.js";

	const { title, description, url, keywords } = copy;
</script>

<Meta {title} {description} {url} {keywords} />

<div class="essay">
	<header class="hero">
		<p class="kicker">데이터로 보는 인내심</p>
		<h1>우리가 유일하게<br />못 떠나는 것</h1>
		<p class="dek">
			주식, 영화, 뉴스, 집중력 — 기다림은 거의 모든 곳에서 무너졌다. 우리가 여전히 머무는 단 한
			곳만 빼고.
		</p>
	</header>

	<div class="lead">
		<p>영상이 뜨기까지 걸리는 3초. 당신의 엄지는 이미 움직이고 있다. 뒤로 가기, 아니면 다음 영상.</p>
		<p>
			당신만 그런 게 아니다. 그리고 당신 탓도 아니다. 지난 반세기 동안, 우리가 무언가를 기다리는
			시간은 거의 모든 곳에서 짧아졌다 — 돈에서, 영화에서, 뉴스에서, 그리고 우리 머릿속에서.
		</p>
	</div>

	<PatienceChart
		mode="year"
		title="기다림은 어디서나 짧아졌다"
		subtitle="돈, 영화, 뉴스, 집중력. 종류는 다른데 방향은 똑같다 — 전부 아래로."
		annotations={[
			{
				domain: "jobtenure",
				year: 2014,
				lines: ["유일하게 버텼다", "직장만은 서두를 수 없었다"],
				dx: -140,
				dy: 70,
				w: 200,
				tone: "accent",
				sticky: true
			},
			{ domain: "stocks", year: 2020, lines: ["8년 → 5개월", "1960 → 2020"], dx: -170, dy: -150, w: 150 },
			{ domain: "film_asl", year: 2010, lines: ["12초 → 2.5초", "1930 → 2010"], dx: -160, dy: -95, w: 150 },
			{ domain: "soundbite", year: 2000, lines: ["43초 → 8초", "1968 → 2000"], dx: -60, dy: 40, w: 150 },
			{ domain: "attention", year: 2020, lines: ["150초 → 47초", "2004 → 2020"], dx: -175, dy: -80, w: 150 }
		]}
	/>

	<p class="note">
		그런데 잠깐. 이 선들은 <strong>재어본 기간이 제각각이다.</strong> 영화는 80년, 집중력은 16년. 잰
		기간이 다르면 "누가 더 빨리 무너졌나"를 공평하게 말할 수 없다.
	</p>

	<PatienceChart
		mode="elapsed"
		title="같은 출발선에 세워보면"
		subtitle="모두를 0년에서 다시 출발시켰다. 이제 선이 가파를수록 빨리 무너진 것이다."
	/>

	<p class="turn">그런데 딱 하나, 거의 그대로인 선이 있다.</p>

	<div class="lead conclusion">
		<p>
			직장을 옮기는 데 걸리는 시간이다. 다른 건 다 빨라졌는데, 이것만은 서두를 수 없었다. 돈이나
			화면은 버튼 하나로 바꾸지만, 직장을 떠나는 건 삶을 거는 결정이라서.
		</p>
	</div>
</div>

<style>
	.essay {
		max-width: 900px;
		margin: 3.5rem auto;
		padding: 0 1.25rem;
	}
	/* 히어로: 킥커 + 제목 + 요약 한 줄 */
	.hero {
		max-width: 640px;
		margin: 2rem auto 2.5rem;
		text-align: center;
	}
	.kicker {
		font-family: var(--font-sans);
		font-size: 0.82rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--revibe-accent);
		margin: 0 0 1.1rem;
	}
	.hero h1 {
		font-family: var(--font-serif);
		font-weight: 700;
		font-size: clamp(2rem, 5vw, 2.9rem);
		line-height: 1.28;
		letter-spacing: -0.01em;
		color: var(--revibe-ink);
		margin: 0 0 1.2rem;
	}
	.dek {
		font-family: var(--font-serif);
		font-size: 1.08rem;
		line-height: 1.6;
		color: var(--revibe-ink-soft);
		margin: 0;
	}
	/* 도입 문단: 좁은 본문 컬럼 */
	.lead {
		max-width: 620px;
		margin: 0 auto 3rem;
	}
	.lead p {
		font-family: var(--font-serif);
		font-size: 1.12rem;
		line-height: 1.85;
		color: var(--revibe-ink);
		margin: 0 0 1.3rem;
	}
	/* ⑥ 반전: 한 문장, 크게, 숨 멈추게 */
	.turn {
		max-width: 620px;
		margin: 3rem auto 2.5rem;
		text-align: center;
		font-family: var(--font-serif);
		font-weight: 600;
		font-size: clamp(1.4rem, 3.5vw, 1.9rem);
		line-height: 1.5;
		color: var(--revibe-ink);
	}
	/* ⑦ 결론 */
	.conclusion {
		margin-bottom: 4rem;
	}
	/* 주석 문단 = 한글 명조, 좁은 폭, 벽돌 적색 헤어라인 */
	.note {
		font-family: var(--font-serif);
		max-width: 620px;
		margin: 1.5rem auto 3.5rem;
		color: var(--revibe-ink);
		line-height: 1.8;
		font-size: 1rem;
		border-left: 2px solid var(--revibe-accent);
		padding-left: 1.15rem;
	}
	.note :global(strong) {
		font-weight: 600;
	}
</style>
