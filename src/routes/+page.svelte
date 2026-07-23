<script>
	import Meta from "$components/Meta.svelte";
	import PatienceChart from "$components/PatienceChart.svelte";
	import copy from "$data/copy.json";
	import "$utils/version.js";

	const { title, description, url, keywords } = copy;
</script>

<Meta {title} {description} {url} {keywords} />

<div class="essay">
	<PatienceChart
		mode="year"
		title="기다림은 전방위로 줄었다 — 그러나 균일하지 않다"
		subtitle={'실제 연도 기준. 각 영역의 "보상까지 기다리는 시간"을 시작점 100으로 맞춤 (index100)'}
	/>

	<p class="note">
		위 그래프는 <strong>측정 기간이 영역마다 다르다</strong> — 영화는 80년, 집중시간은 16년. 기간이
		다르면 "누가 더 빨리 무너졌나"를 공정하게 비교할 수 없다. 그래서 아래처럼 <strong>모든 선을 각자의
		출발점(0년·100)에 나란히 세워</strong> 순수한 하강 기울기만 비교한다.
	</p>

	<PatienceChart
		mode="elapsed"
		title="출발선에 정렬하면 — 기울기가 드러난다"
		subtitle="각 영역의 시작 연도를 0으로 당겨 정렬. 이제 선의 각도 = 무너진 속도"
	/>
</div>

<style>
	.essay {
		max-width: 900px;
		margin: 3.5rem auto;
		padding: 0 1.25rem;
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
