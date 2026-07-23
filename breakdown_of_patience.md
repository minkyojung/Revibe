---
created: '2026-07-23T00:02:28.436Z'
---

개념·조사 원본은 [[보상 지연 인내의 축소]]에 있음. 이 문서는 IDE(또는 Claude Code)로 그대로 들고 가서 데이터 가공·차트 제작을 시작하기 위한 자체 완결형 작업지시서.

## 1. 만들 것 (한 줄)
- 서로 무관한 여러 영역에서 "보상까지 기다리는 시간"이 시대에 따라 어떻게 줄었는지를 한 그래프에 겹쳐 보이는, The Pudding 스타일 정적 데이터 비주얼 에세이(첫 버전은 인터랙티브 없이).

## 2. 최종 Thesis
- "우리의 인내는 전방위로 줄고 있지만 균일하지 않다 — 시장·기술이 지배하는 영역(돈·주목)일수록 급격히 무너졌고, 삶을 지탱하는 제도(직장)는 아직 버틴다."
- 결론을 미리 박지 않는 후크: 겹쳐보기 전엔 같은 모양일지 모른다는 긴장.

## 3. 데이터셋 (CSV로 바로 옮길 수 있게 long-format)
컬럼: domain, year, raw_value, unit, index100(출발점=100), source_note

```csv
domain,year,raw_value,unit,index100,source_note
stocks,1960,100,months,100,NYSE avg holding period (TopForeignStocks/Reuters)
stocks,1970,63,months,63,
stocks,1980,33,months,33,
stocks,1990,26,months,26,
stocks,2000,14,months,14,
stocks,2010,6,months,6,
stocks,2020,5.5,months,5.5,
film_asl,1930,12,seconds,100,Cutting et al 2010 (Psych Science) / Cinemetrics
film_asl,1960,9,seconds,75,approx 8-10s
film_asl,1980,5,seconds,41.7,
film_asl,2005,2.75,seconds,22.9,approx 2.5-3s
film_asl,2010,2.5,seconds,20.8,일부 영화 1.7s
soundbite,1968,43,seconds,100,Hallin 1992 (J. of Communication)
soundbite,1988,9,seconds,20.9,
soundbite,2000,7.8,seconds,18.1,Farnsworth/Lichter 확장(근사)
attention,2004,150,seconds,100,Gloria Mark UC Irvine (screen dwell)
attention,2012,75,seconds,50,
attention,2020,47,seconds,31.3,5개 독립연구 재확인(44~50s)
jobtenure,1983,5.0,years,100,BLS/EBRI median tenure (반례)
jobtenure,2014,4.6,years,92,
jobtenure,2024,3.9,years,78,
```
데이터 품질 플래그: film_asl·soundbite·jobtenure는 중간점이 성기고 일부 근사값. jobtenure는 1983~2000s 사이 실제로 비평평(중위 ~5년 유지, 90년대 저점→2000년대 반등)이라 정밀히 하려면 BLS 원자료 보강 필요.

### 원본 데이터 출처 (촘촘한 raw 다운로드 위치)
- 위 CSV는 파일럿용 요약 점. 발표용으론 아래 원본에서 연도별 촘촘한 값을 받아 보강할 것.
- **주식(촘촘·즉시)**: World Bank 지표 CM.MKT.TRNR "Stocks traded, turnover ratio" — data.worldbank.org/indicator/CM.MKT.TRNR (CSV/엑셀, 美 1975~). 보유기간 ≈ 1/회전율(근사).
- **근속연수(촘촘·공식)**: BLS Employee Tenure — bls.gov/news.release/tenure.htm (1983~2024, 격년 표). EBRI가 전체 시리즈 정리.
- **영화 ASL(촘촘)**: Cinemetrics DB — cinemetrics.uchicago.edu (영화 1만 편+, 연도·ASL 정렬·export). 보조: Cutting et al 2010 보충자료.
- **사운드바이트(성김·불가피)**: Hallin 1992 논문 + Farnsworth & Lichter 『The Nightly News Nightmare』(선거연도만). 논문·책에서 수기 추출.
- **집중시간(성김·불가피)**: Gloria Mark 논문들 + 저서 『Attention Span』의 연도별 값.
- 현실 판단: 주식·근속·영화 = 진짜 촘촘 → 주인공 3선. 사운드바이트·집중시간 = 원래 몇 개 연구뿐 → 보조선으로.

## 4. 데이터 가공 방법
- 정규화: 각 domain의 최초 연도 값을 100으로 두고 index100 = raw_value / (해당 domain 최초값) × 100. (위 표에 이미 계산해 둠.)
- 10년당 감소율(속도 비교용): rate = (끝값/시작값)^(1/구간_10년수) − 1.
  - 계산 결과: attention ≈ −52%/10년, soundbite ≈ −41%, stocks ≈ −38%, film ≈ −18%, jobtenure ≈ −6%.
- 시작 연도가 영역마다 달라서 x축은 두 버전 준비: (a) 실제 연도(각 선이 자기 구간만 그려짐), (b) "시작 후 경과 연수"로 0에 정렬(모양 비교용).

## 5. 차트 명세
- 메인: 다중 선 겹치기 (**d3 스케일 + Svelte로 SVG 직접 렌더**). x=연도(또는 경과연수), y=index100. 스트리밍/급락을 강조하려면 y 로그 스케일 옵션 검토.
  - 급락 4선(stocks·film·soundbite·attention)은 한 계열로 톤 통일, 반례 1선(jobtenure)은 색·굵기로 확실히 구분해 "혼자 버티는 선"이 눈에 띄게.
  - Pudding 스타일: 축 설명보다 선 옆 주석(annotation) 문장으로 "지금 뭘 보는지 + 왜 중요한지" 짚기.
- 보조: 10년당 감소율 막대차트(속도 순위) — "얼마나 빨리 무너졌나"를 한 장으로.
- 오프닝 앵커(글 도입, 데이터 아님): 구체적 인간 장면 1개(예: 부모 세대 8년 적금 vs 3분 만에 산 코인) — 추후 확정.

## 6. 기술 스택 & 실행 순서
> **확정 스택 (the-pudding/svelte-starter 기준, 스타터 우선).** 아래는 초안의 pandas/matplotlib 계획을 실제 설치된 스타터에 맞춰 갱신한 것. 원칙은 유지("정적 먼저"), 도구만 스타터 관례로 통일.

- 스택:
  - 데이터 정제 = **Node 스크립트(`tasks/`) + d3**. (pandas 폐기 — 데이터가 작고 스타터가 순수 Node라 파이프라인을 하나로 통일.)
  - CSV 로드 = `@rollup/plugin-dsv`가 자동 파싱 (`import data from "$data/patience.csv"`).
  - 차트 = **d3 스케일 + Svelte SVG 직접 렌더**, 처음엔 인터랙션 없는 정적. (matplotlib/Observable Plot/LayerCake 단계 건너뜀 — 최종이 어차피 d3+Svelte.)
  - 승급 = 스타터의 `Scrolly.svelte`로 스크롤텔링.
  - 배포 = SvelteKit **adapter-static** (Astro 대안 불필요).

### 초기 환경 세팅 (The Pudding 방식) — ✅ 완료
- The Pudding이 실제 기사 제작에 쓰는 공개 스타터를 이 레포에 그대로 설치함 (`svelte-starter` v6.25.1). 데이터 로드·미리보기·정적 빌드가 이미 세팅돼 차트에만 집중 가능.
```bash
# 이미 실행 완료. 재현용 기록:
npx degit the-pudding/svelte-starter . --force   # 현재 레포에 병합 (breakdown_of_patience.md 보존)
npm install      # 384 패키지 설치됨
npm run dev      # http://localhost:5173 정상 (HTTP 200 확인)
npm run build    # 정적 빌드 (adapter-static)
```
- 스타터 포함: SvelteKit, CSV/JSON 바로 import(dsv 자동 파싱), 구글시트 연동(ArchieML, 지금은 미사용), 스크롤텔링(`Scrolly.svelte`), d3, 정적 빌드.
- 폴더 구조 (**스타터 관례로 재배치 — 스타터 우선**):
```
Revibe/
├── data/raw/            ← 원본 그대로 (worldbank.csv, bls.csv, cinemetrics export). src 밖 → 번들 제외
├── tasks/               ← 정제 스크립트 (node + d3). 스타터 관례 자리 (초안의 scripts/ 대체)
└── src/
    ├── data/patience.csv ← 정제 결과. 여기 있어야 $data import + 자동 파싱 작동 (초안의 data/clean/ 대체)
    └── routes/
        ├── +page.server.js ← CSV 로드 + index100 검증 + 감소율 산출
        └── +page.svelte    ← 글 본문 + 차트
```
- The Pudding 원칙: 처음부터 인터랙티브 말고 정적 차트부터. git은 첫날부터.
- 정리 TODO(나중): 스타터의 Pudding 브랜딩 제거 — `src/app.html`의 GoatCounter 애널리틱스, `src/svg/wordmark-*`·`logo-*` 로고·폰트(서면 허가 없이 사용 금지).

- 실행 순서:
  1. 3절 CSV를 `src/data/patience.csv`로 저장.
  2. `+page.server.js`에서 d3로 로드 → index100 재계산 검증 + 10년당 감소율 산출.
  3. 정적 겹치기 차트(버전 a, b) 먼저 렌더 → thesis가 눈에 보이는지 확인.
  4. 주석 문장 붙이고 반례선 강조.
  5. (선택) `Scrolly.svelte`로 인터랙티브·스크롤텔링 승급.

## 7. 남은 TODO (데이터 보강)
- film_asl·soundbite 중간 연도점 추가로 곡선 매끈하게.
- jobtenure BLS 원자료로 1983~2024 연도별 보강.
- 추가 반례 후보(느려진 것들: 프레스티지 드라마 러닝타임↑, 바이닐·오마카세·롱폼 팟캐스트) 조사 → "무엇이 버텼나" 강화.
- 각 출처를 [[The Pudding]] 신뢰도 기준으로 최종 점검(특히 근사값 표시한 것).
