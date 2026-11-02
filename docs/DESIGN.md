# DESIGN.md
## Design Goal
A clean and simple mobile web app that lets roommates and club members record co-owned asset shares and costs and see a fair settlement without accounting knowledge. Every calculated amount shows how it was derived.

## Source of Truth
Figma "우리몫 디자인 시안" 섹션(node `2113:11361`) — 화면 10개(00 랜딩 ~ 09 설정) + 컴포넌트(Header, TabBar, Button, Chip, Field, FAB, Avatar, Icons).
화면을 바꿀 때는 이 시안의 색·간격·모서리·레이아웃을 먼저 따르고, 시안에 없는 요소는 아래 규칙으로 시안의 기존 부품을 재사용해 만든다.

## Visual Tone
- 흰 화면 + 회색(surface-muted) 카드 + 파란(primary-strong) 강조 카드 + 남색(primary) 주 버튼.
- 테두리 대신 배경색으로 묶는다. 테두리는 흰 버튼(secondary/danger), 비선택 칩, 원형 헤더 버튼, 비활성 선택지에만 쓴다.
- 중립성: 받을 금액 "+ 금액 받음"은 파란 카드 안에서 **모든 참여자에게 같은 모양**으로 표시한다. 특정 참여자만 색으로 강조하지 않는다.

## Color Palette
| 토큰 | 값 | 용도 | 대비 |
|---|---|---|---|
| `--color-primary` | `#14213D` | 제목·본문 강조 글자, 하단 주 버튼 배경 | 흰 글자 ~14.8:1 |
| `--color-primary-strong` | `#1D4ED8` | 파란 강조 카드, FAB, 선택 칩 테두리·글자, 링크, 활성 탭 | 흰 글자 ~6.3:1 / primary-soft 위 ~5.6:1 |
| `--color-primary-soft` | `#E8EFFC` | 선택 칩·선택지 배경, 아바타·번호 원, 랜딩 배경 | — |
| `--color-accent` | `#3B82F6` | 포커스 링, 파란 카드 안 1px 구분선 — **글자·버튼 배경에는 안 씀** | non-text 전용 |
| `--color-surface` | `#FFFFFF` | 화면 배경, 흰 버튼 | — |
| `--color-surface-muted` | `#F3F6FB` | 회색 카드, 입력칸 배경 | — |
| `--color-border` | `#E1E7F0` | 흰 버튼 테두리, 구분선, 비활성 버튼 배경 | — |
| `--color-text` | `#0F172A` | 본문 | 흰 배경 ~16.5:1 |
| `--color-text-muted` | `#5B6478` | 보조 글자 | 흰 ~5.2:1 / surface-muted ~4.9:1 / border(비활성 버튼) ~4.8:1 |
| `--color-error` | `#B91C1C` | 납부액 확인 필요, 오류 문구, 삭제·초기화 글자 | 흰 ~6.5:1 |
| `--color-success` | `#15803D` | "일치합니다" 검증 문구 | 흰 ~5.0:1 |
| `--color-app-bg` | `#0F1B33` | 430px 폰 프레임 **바깥** 배경 | — |

랜딩 로고 글자 `#6A83B3`(32px bold, 큰 글자 기준 3:1 이상)만 시안 그대로 예외로 둔다.

## Typography
시스템 폰트 스택 유지(새 폰트 추가 안 함). 시안의 Noto Sans KR 스타일은 크기·굵기·행간·자간만 옮긴다.

| 시안 스타일 | 크기/행간 | 굵기 | 쓰는 곳 |
|---|---|---|---|
| Large Title | 28/36, 자간 -2% | bold | 탭 화면 큰 제목, 자산 상세 총액 |
| Display | 26/36, -2% | bold | 랜딩 헤드라인 |
| Title | 20/28, -1% | bold | 요약 자산명, 종료 규칙 질문, 설정 통계 숫자 |
| Heading | 16/24, -1% | bold | 섹션 제목(`SectionHeader`), 드릴다운 헤더 제목 |
| Body (Strong) | 15/22 | regular(medium) | 본문, 카드 제목, 버튼 |
| Label | 14/20 | medium | 입력 라벨, 텍스트 링크 |
| Caption (Strong) | 13/18 | regular(medium) | 보조 정보, 상태 표시 |
| Small (Strong) | 12/16 | regular(medium) | 산출식, 도움말, 탭 라벨 |

금액은 항상 `tabular-nums`.

## Layout Policy
- **폰 프레임 / 스크롤**: Session 6 구조 유지 — `html/body`는 `h-dvh overflow-hidden`, 가운데 430px 카드만 `overflow-y-auto`. sticky 요소(헤더·탭바·하단 바·FAB)는 모두 이 카드 기준으로 붙는다. `min-h-screen`으로 되돌리지 않는다.
- **화면 여백**: 좌우 20px(`px-5`), 섹션 간격 36px(`gap-9`, 요약·정산은 시안대로 24~32px), 섹션 안 16px(입력 폼)·12px(목록).
- **헤더 (`AppHeader` / `LargeHeader`)**
  - 탭 화면(자산 목록·정산 현황·설정): 흰 배경, 13px 캡션 + 28px 왼쪽 정렬 큰 제목.
  - 드릴다운: 흰 배경 64px, 왼쪽 원형 뒤로(40px 원, 테두리) · 가운데 16px bold 제목 · 오른쪽 원형 닫기(S4~S7). 원은 40px로 보이되 터치 영역은 44px.
- **탭바**: 64px, 상단 구분선, 24px 라인 아이콘 + 12px 라벨, 활성 탭 primary-strong. 탭 화면 3개에서만 표시.
- **하단 고정 바 (`BottomBar`)**: 상단 구분선, 위 13px·아래 28px 여백 안에 52px 남색 pill 주 버튼. 폼 제출·다음 단계 이동(자산 만들기, 저장하고 정산으로 이동, 요약 보기, 요약 복사)에 쓴다.
- **FAB (`Fab`)**: 자산 목록의 "자산 추가". 52px pill, primary-strong, + 아이콘 + 라벨, 탭바 위 20px에 떠 있음.

### 카드 규칙 (section → group → item)
- **section**: `SectionHeader`(16px bold 제목 + 오른쪽 13px muted 보조값 "3명"·"2건") + 여백으로 구분. 섹션 자체에는 배경·테두리 없음.
- **회색 카드**: `bg-surface-muted rounded-2xl(16px)`, 패딩 16px(행형은 16×14). 테두리·그림자 없음.
  - 목록 항목이 각자 이동·조작 대상이면 **항목마다 카드**(자산 목록, 정산 현황, 자산 상세 참여자, 비용 목록), 간격 8~12px.
  - 읽기 전용 묶음이면 **카드 1개 + 구분선**(공유 요약의 참여자·비용, 참여자별 낸 비용, 요약 정보).
- **파란 강조 카드 (`HighlightCard`)**: `bg-primary-strong rounded-[20px] p-5`, 흰 글자, 행 간격 14px, 합계는 accent 1px 선 아래. **화면당 하나**, 계산 결과(지분 미리보기·받을 금액·정산 결과)와 자산 상세 "다음 할 일"(`NextStepCard`)에만 쓴다.
- **흰 결과 박스**: 회색 카드 안에 요약 숫자를 넣을 때만 `bg-surface rounded-xl`(정산 현황의 매각가·받을 금액 합계).
- 카드 안에 또 다른 회색/파란 카드를 넣지 않는다. 검증 문구는 카드 바로 아래에 둔다.

### 컨트롤
- **버튼 (`Button` / `ButtonLink`)**: 52px pill. primary(남색) = 화면의 주 동작, accent(파랑) = 빈 상태 CTA, secondary(흰+테두리, 남색 글자), danger(흰+테두리, 빨간 글자: 이 자산 삭제·모든 데이터 초기화). 비활성은 variant와 무관하게 회색(`bg-border` + muted 글자).
- **칩 (`chipClassName`)**: pill, 선택 = primary-soft 배경 + 1.5px primary-strong 테두리 + 14px medium 파란 글자, 기본 = 흰 배경 + 테두리 + 13px. 시안 40px → 터치 타겟 때문에 44px.
- **입력 (`FormField`, `inputClassName`, `Select`, `textareaClassName`)**: 14px medium 라벨 → 8px → 52px 회색 입력칸(모서리 12px, 좌우 16px) → 12px 도움말. 셀렉트는 오른쪽 chevron-down.
- **금액 입력 (`NumberInput`)**: 오른쪽 끝 "원", 화면에는 천 단위 콤마. 콤마는 표시용이고 값은 숫자만(`sanitizeDigits`).
- **선택지 카드 (종료 규칙)**: 실제 radio input을 숨겨 두고 카드로 표시. 선택 = primary-soft + 1.5px 파란 테두리, 사용 불가 = 흰 배경 + 테두리 + 55% 투명 + "다음 버전에서 제공".
- **텍스트 링크**: 14px medium primary-strong + chevron-right 18px(예: "정산하기 ›", "참여자 추가·삭제 ›").
- **아바타 (`Avatar`)**: 32px primary-soft 원 + 이름 첫 글자, 장식(aria-hidden). 목록에서는 8px 겹침.
- **번호 레일 (`StepTimeline`)**: 24px 번호 원 + 2px 세로선. 설정 "이용 방법"과 자산 상세 "진행 단계"가 공유. 완료(파란 원 + 흰 체크 + "완료"), 지금 할 일("지금 할 일"), 잠김(회색 원 + "아직 못 해요")은 글자로도 표시한다.

### 아이콘·상태 표시
- 아이콘은 Figma Icons 세트를 `public/icons/*.svg`로 받아 `Icon` 컴포넌트(CSS mask)로 쓴다 — 모양은 파일 그대로, 색은 `currentColor`. 이모지·임의로 그린 아이콘 금지.
- 상태는 색 배경 pill 없이 **아이콘 + 글자**: 정산 완료(파랑 ✓), 정산 전(muted), 납부액 확인 필요(빨강 ⚠ + 이유 한 줄).
- 검증 문구: 정상 = 초록 ✓ 13px, 문제 = 빨강 ⚠ 13px medium(`role="alert"`). 배경 박스 없음.
- 그림자는 FAB(파란 그림자)와 랜딩 일러스트 카드에만 쓴다.

## UI Rules
- Use clear button text.
- Use labels for inputs.
- Use semantic headings.
- Avoid icon-only actions (원형 뒤로/닫기 버튼은 예외 — `aria-label`로 이름 전달).
- Avoid random design changes — 시안에 없는 화면 요소는 위 컴포넌트를 재사용해 만든다.
- Show the formula behind every calculated amount (지분율 아래 "400,000 ÷ 900,000", 받을 금액 아래 "450,000 × 44.5%"). 시안 03처럼 산출식이 빠진 곳도 코드에서는 표시한다.
- Always show whether shares add up to 100%.
- Use a sign or label, not color alone, to mark amounts to receive versus amounts to pay ("+ 금액 받음").

## Main Screens
- 00 랜딩: 연한 파란 배경, 카드 일러스트(예시라 aria-hidden), 2줄 헤드라인, 체크 목록, 남색 "시작하기".
- 01 자산 목록: 큰 제목 + 회색 자산 카드(카드 전체가 상세 링크) + FAB. 목록에서는 삭제하지 않는다.
- 02 자산 만들기: 기본 정보 / 참여자와 지분(칩, 아바타 행, 파란 지분 미리보기) / 추가 정보, 하단 고정 버튼.
- 03 자산 상세: 총액 개요 → 파란 "다음 할 일" → 진행 단계 → 참여자 카드(+ 접힌 "참여자 추가·삭제") → 자산 정보 → "이 자산 삭제"(danger) + "자산 목록으로 나가기".
- 04 비용 기록, 05 종료 규칙, 06 정산, 07 공유 요약, 08 정산 현황, 09 설정 — Figma 시안 그대로.

## Accessibility
- 라벨-입력 연결 유지(시각적으로 숨긴 라벨 포함), placeholder로 라벨을 대신하지 않는다.
- 받을 금액 "+"/"받음" 라벨 유지, 산출식 항상 표시.
- 터치 타겟 44px 이상 — 시안 크기가 더 작은 곳(원형 헤더 버튼 40px, 칩 40px, 텍스트 링크 32px)은 보이는 크기만 시안대로 두고 히트 영역을 44px로 넓힌다.
- 색 대비는 위 표 기준 전부 WCAG AA 이상(비활성 컨트롤은 예외 규정). 포커스는 accent 2px 링.
