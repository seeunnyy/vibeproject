# DESIGN.md
## Design Goal
A clean and simple mobile web app that lets roommates and club members record co-owned asset shares and costs and see a fair settlement without accounting knowledge.

## Source of Truth
Figma "우리몫 디자인 시안" 섹션(node `2113:11361`)이 **정답**이다. 앱과 시안이 다르면 시안대로 바꾼다.

| 화면 | 노드 | 화면 | 노드 |
|---|---|---|---|
| 00 랜딩 | `2119:15` | 06 정산 | `2120:360` |
| 01 자산 목록 | `2119:58` | 07 공유 요약 | `2121:201` |
| 02 자산 만들기 | `2119:141` | 08 정산 현황 | `2121:317` |
| 03 자산 상세 | `2120:99` | 09 설정 | `2121:382` |
| 04 비용 기록 | `2120:229` | 10 종료 완료·인수 | `2134:422` |
| 05 종료 규칙 | `2120:324` | 11 종료 완료·폐기 | `2134:461` |
| 05-1 인수 선택 | `2134:304` | 컴포넌트 | `2118:16` |
| 05-2 폐기 선택 | `2134:363` | | |

- 크기·간격·패딩·모서리·색·글자 크기/굵기/행간/자간은 시안 값 그대로. 시안에 없는 문구·요소는 넣지 않는다.
- 시안에 그려지지 않은 상태(빈 목록, 납부액 불일치, 비활성 버튼, 자산 없음·진행 불가)만 시안 부품으로 만든다
  (`EmptyState`, `StatusScreen`, 비활성 버튼 스타일, `ContributionCheckBadge`).
- 확인 방법: 앱을 390px 폭 · 시안 프레임 높이로 캡처해 시안 스크린샷과 나란히 비교한다.

## Visual Tone
- 흰 화면 + 회색(surface-muted) 카드 + 파란(primary-strong) 강조 카드 + 남색(primary) 주 버튼.
- 테두리 대신 배경색으로 묶는다. 테두리는 흰 버튼(secondary/danger), 비선택 칩·선택지, 원형 헤더 버튼, 종료 완료 안내 박스에만 쓴다.
- 중립성: 받을 금액 "+ 금액 받음"은 파란 카드 안에서 **모든 참여자에게 같은 모양**으로 표시한다.

## Color Palette
| 토큰 | 값 | 용도 | 대비 |
|---|---|---|---|
| `--color-primary` | `#14213D` | 제목·강조 글자, 남색 버튼 배경 | 흰 글자 ~14.8:1 |
| `--color-primary-strong` | `#1D4ED8` | 파란 강조 카드, FAB, 선택 칩·선택지 테두리, 링크, 활성 탭 | 흰 글자 ~6.3:1 / primary-soft 위 ~5.6:1 |
| `--color-primary-soft` | `#E8EFFC` | 선택 칩·선택지 배경, 아바타·번호·체크 원, 랜딩 배경 | — |
| `--color-accent` | `#3B82F6` | 포커스 링, 파란 카드 안 1px 구분선 — **글자·버튼 배경에는 안 씀** | non-text 전용 |
| `--color-surface` | `#FFFFFF` | 화면 배경, 흰 버튼 | — |
| `--color-surface-muted` | `#F3F6FB` | 회색 카드, 입력칸 | — |
| `--color-border` | `#E1E7F0` | 테두리, 구분선, 비활성 버튼 배경 | — |
| `--color-text` | `#0F172A` | 본문 | 흰 배경 ~16.5:1 |
| `--color-text-muted` | `#5B6478` | 보조 글자 | 흰 ~5.2:1 / surface-muted ~4.9:1 |
| `--color-error` | `#B91C1C` | 납부액 확인 필요, 오류, 삭제·초기화 글자 | 흰 ~6.5:1 |
| `--color-success` | `#15803D` | "일치합니다" 검증 문구 | 흰 ~5.0:1 |
| `--color-app-bg` | `#0F1B33` | 430px 폰 프레임 **바깥** 배경 | — |

랜딩 로고 글자 `#6A83B3`(32px bold, 큰 글자 기준 3:1 이상)만 시안 그대로 예외.

## Typography
**Noto Sans KR 400/500/700** — `next/font/google`로 불러와 self-host(`src/app/layout.tsx`, CSS 변수 `--font-noto-sans-kr`). 새 패키지 없음.
랜딩 로고("우리몫")는 시안에서 Kim jung chul Gothic이지만 웹폰트가 없어 Noto Sans KR Bold로 둔다.

| 시안 스타일 | 크기/행간 | 굵기 | 쓰는 곳 |
|---|---|---|---|
| Large Title | 28/36, 자간 -2% | bold | 탭 화면 큰 제목, 자산 상세 총액 |
| Display | 26/36, -2% | bold | 랜딩 헤드라인, 종료 완료 제목 |
| Title | 20/28, -1% | bold | 요약 자산명, 종료 규칙 질문, 랜딩 정산 결과 금액 |
| Heading | 16/24, -1% | bold | 섹션 제목(`SectionHeader`), 드릴다운 헤더 제목 |
| Body (Strong) | 15/22 | regular(medium) | 본문, 카드 제목, 버튼 |
| Label | 14/20 | medium | 입력 라벨, 텍스트 링크, 메뉴 제목 |
| Caption (Strong) | 13/18 | regular(medium) | 보조 정보, 상태 표시 |
| Small (Strong) | 12/16 | regular(medium) | 산출식, 탭 라벨 |

금액은 항상 `tabular-nums`.

## Layout Policy
- **폰 프레임 / 스크롤**: Session 6 구조 유지 — `html/body`는 `h-dvh overflow-hidden`, 가운데 430px 카드만 `overflow-y-auto`. sticky 요소(헤더·탭바·하단 바·FAB)는 모두 이 카드 기준. `min-h-screen`으로 되돌리지 않는다.
- **화면 여백**: 좌우 20px(`px-5`), 섹션 간격은 시안대로(대부분 36px, 요약 32px, 정산 24px, 종료 규칙 28px).
- **헤더 (`AppHeader` / `LargeHeader`)**
  - 탭 화면(자산 목록·정산 현황·설정): 흰 배경, 28px 왼쪽 정렬 큰 제목만(캡션 없음).
  - 드릴다운: 흰 배경 64px, 왼쪽 원형 뒤로(40px 원) · 가운데 16px bold 제목 · 오른쪽 원형 닫기(S4~S7). 터치 영역은 44px.
  - 종료 완료(10·11)는 헤더 없음.
- **탭바**: 64px, 상단 구분선, 24px 라인 아이콘 + 12px 라벨, 활성 탭 primary-strong. 탭 화면 3개에서만.
- **하단 고정 바 (`BottomBar`)**: 위 13px(두 개일 땐 12px) · 아래 28px 여백 안에 52px pill 버튼.
  - 기본: 남색 1개 + 상단 구분선(자산 만들기, 저장하고 정산으로 이동 / 공동소유 종료하기, 요약 복사).
  - `row`: 같은 폭 두 개, 사이 8px(06 정산: "요약 보기" 흰색 · "저장하기" 남색).
  - `borderless`: 구분선 없이 세로 두 개(10·11: "자산 목록으로" 남색 · "공유 요약 보기" 흰색).
- **FAB (`Fab`)**: 자산 목록 "자산 추가". 52px pill, primary-strong, 파란 그림자, 탭바 위 20px.
- **종료 완료(10·11)**: 위 88px, 72px 체크 원 → 26px 제목 → 15px 설명, 회색 정보 카드(자산·종료 방식·종료일·참여자), 테두리 안내 박스.

### 카드 규칙
- **section**: `SectionHeader`(16px bold 제목 + 오른쪽 13px muted 보조값 "3명"·"2건") + 여백. 섹션 자체에는 배경·테두리 없음.
- **회색 카드**: `bg-surface-muted rounded-2xl(16px)`, 패딩 16px(행형 16×14). 테두리·그림자 없음.
  - 이동·조작 대상 목록은 **항목마다 카드**(자산 목록, 정산 현황, 자산 상세 참여자, 비용 목록), 간격 8~12px.
  - 읽기 전용 묶음은 **카드 1개 + 구분선**(공유 요약의 정보·참여자·비용, 참여자별 낸 비용, 종료 정보).
  - **메뉴 카드 (`MenuList`)**: 자산 상세 "다음 단계" — 카드 1개(좌우 16 · 위아래 4) 안에 행(위아래 14, 제목 14px medium + 설명 13px muted + chevron 18px) + 구분선. 진행할 수 없는 행은 흐리게 + 빨간 설명.
- **파란 강조 카드 (`HighlightCard`)**: `bg-primary-strong rounded-[20px] p-5`, 흰 글자, 행 간격 14px, 합계는 accent 1px 선 아래. 계산 결과(지분 미리보기·받을 금액·정산 결과)에만.
- **흰 결과 박스**: 정산 현황 카드 안의 매각가·받을 금액 합계(`bg-surface rounded-xl`).

### 컨트롤
- **버튼 (`Button` / `ButtonLink`)**: 52px pill. primary(남색) · accent(파랑, 빈 상태 CTA) · secondary(흰+테두리, 남색 글자) · danger(흰+테두리, 빨간 글자). 비활성은 회색(`bg-border` + muted 글자).
- **칩 (`chipClassName`)**: 40px pill. 선택 = primary-soft + 1.5px primary-strong 테두리 + 14px medium 파란 글자, 기본 = 흰 배경 + 테두리 + 13px.
- **입력 (`FormField`, `inputClassName`, `Select`, `textareaClassName`)**: 14px medium 라벨 → 8px → 52px 회색 입력칸(모서리 12px, 좌우 16px). 셀렉트는 chevron-down 20px.
  텍스트영역은 112px, 위아래 14px, **글자 12px/22px**(시안), 크기 조절 없음. 시안에 없는 도움말은 붙이지 않는다.
- **금액 입력 (`NumberInput`)**: 오른쪽 끝 "원", 천 단위 콤마(표시용, 값은 숫자만 `sanitizeDigits`). 매각가는 `autoComplete="off"`.
- **선택지 카드 (종료 규칙)**: 숨긴 radio input + 카드. 매각·한 명의 인수·폐기 모두 선택 가능, 각 설명 한 줄. 선택 = primary-soft + 1.5px 파란 테두리 + 채운 라디오, 기본 = 흰 배경 + 1px 테두리 + 빈 라디오.
- **텍스트 링크**: 14px medium primary-strong + chevron-right 18px("정산하기 ›", "참여자 수정 ›", "요약 보기 ›").
- **아바타 (`Avatar`)**: 32px primary-soft 원, 장식(aria-hidden). 글자는 성을 뺀 이름 첫 글자 — **3글자 이상이면 두 번째 글자, 2글자 이하면 첫 글자**(김지민 → 지, 지호 → 지). 목록은 8px 겹침, 10·11·랜딩은 흰 2px 테두리.
- **번호 레일 (`StepTimeline`)**: 설정 "이용 방법" 전용(24px 번호 원 + 2px 세로선).

### 아이콘·상태 표시
- 아이콘은 Figma Icons를 `public/icons/*.svg`로 받아 `Icon`(CSS mask, 색 `currentColor`)으로 쓴다. 이모지·직접 그린 아이콘 금지.
  Figma는 크기와 무관하게 선 굵기 1.75px를 유지하므로, 시안에 쓰인 크기별 export(`<name>-<size>.svg`: 14·16·18·20·26·36)를 두고 `Icon`이 자동으로 고른다.
- 상태(01·08)는 색 배경 없이 13px 글자(+14px 아이콘): 정산 완료(파랑 ✓ medium) · 정산 전(muted regular) · 납부액 확인 필요(빨강 ⚠ medium) · **종료됨**(muted medium). 목록 카드에 불일치 금액 줄은 붙이지 않는다.
- 검증 문구: 정상 = 초록 ✓ 13px, 문제 = 빨강 ⚠ 13px medium(`role="alert"`). 자산 상세(03)는 시안에 "일치합니다"가 없으므로 **불일치일 때만** 경고.
- 그림자는 FAB와 랜딩 일러스트 카드에만.

## UI Rules
- Use clear button text.
- Use labels for inputs.
- Use semantic headings.
- Avoid icon-only actions (원형 뒤로/닫기 버튼은 예외 — `aria-label`로 이름 전달).
- Follow the Figma design; build undrawn states only from existing design parts.
- Show the formula where the design shows it: 02 지분 미리보기, 06·07 받을 금액("450,000 × 44.5%"), 07 참여자 지분율("400,000 ÷ 900,000").
  **03 자산 상세 참여자 카드는 시안대로 산출식 없이 지분율만** 보여준다(Session 10에서 이전의 "모든 계산값에 산출식" 규칙을 바꿈). 산출식은 07 공유 요약에서 확인한다.
- Always show whether shares add up to 100%.
- Use a sign or label, not color alone, to mark amounts to receive ("+ 금액 받음").

## Main Screens
- 00 랜딩: 연한 파란 배경, 카드 일러스트(예시라 aria-hidden), 2줄 헤드라인, 체크 목록, 남색 "시작하기".
- 01 자산 목록: 큰 제목 + 회색 자산 카드(카드 전체가 상세 링크) + FAB. 삭제는 자산 상세에서.
- 02 자산 만들기: 기본 정보 / 참여자와 지분(칩, 아바타 행, 파란 지분 미리보기) / 추가 정보, 하단 고정 버튼.
- 03 자산 상세: 구매일 + 28px 총액 → 참여자 카드(납부/지불, 지분율) + "참여자 수정"(누르면 추가·삭제 폼) → "다음 단계" 메뉴(비용 기록 / 종료·정산 / 요약 보기) → 자산 정보 → "이 자산 삭제" + "자산 목록으로 나가기".
- 04 비용 기록 · 06 정산 · 07 공유 요약 · 08 정산 현황 · 09 설정(통계 타일 없음) — 시안 그대로.
- 05 종료 규칙: 매각 → "저장하고 정산으로 이동"(06), 인수·폐기 → "공동소유 종료하기"(10·11).
- 10·11 종료 완료(`/app/assets/[id]/ended`): 인수·폐기는 금액을 계산하지 않고 종료 방식 + 종료일만 저장(인수자 선택 없음).
  종료된 자산은 01·08에서 "종료됨", 08에서 "한 명의 인수로 종료 · 날짜" + "요약 보기 ›", 07 "종료 규칙"에 실제 방식이 나오고 정산 결과 섹션은 없다.

## Accessibility
- 라벨-입력 연결 유지(시각적으로 숨긴 라벨 포함), placeholder로 라벨을 대신하지 않는다.
- 받을 금액 "+"/"받음" 라벨 유지.
- 터치 타겟 44px 이상 — 시안이 더 작은 곳(원형 헤더 버튼 40px, 칩 40px, 텍스트 링크 32px, 비용 "삭제" 18px)은 레이아웃 크기는 시안대로 두고 누르는 영역만(`::after` 또는 바깥 44px 링크) 넓힌다.
- 색 대비는 위 표 기준 WCAG AA 이상(비활성 컨트롤 예외). 포커스는 accent 2px 링.
