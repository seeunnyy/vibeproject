# DESIGN.md
## Design Goal
A clean and simple mobile web app that lets roommates and club members record co-owned asset shares and costs and see a fair settlement without accounting knowledge. Every calculated amount shows how it was derived.
## Visual Tone
- 신뢰감 있는 남색 계열 (공유 장부 = 은행/회계 느낌의 중립적 신뢰감)
- 여백 넉넉, 정돈된 카드 기반 레이아웃
- 특정 참여자가 시각적으로 튀지 않는 중립성 유지 — **AmountLabel의 "+금액/받음"은 색으로 강조하지 않고 중립 텍스트색 유지** (포인트 블루를 여기 쓰면 "받는 사람만 튀어 보임"이 되어 무드 원칙과 충돌하므로 의도적으로 제외)

## Color Palette
| 토큰 | 값 | 용도 | 대비 확인 |
|---|---|---|---|
| `--color-primary` | `#14213D` (진남색) | 헤더 배경 | 흰 텍스트 대비 ~14.8:1 (AAA) |
| `--color-primary-strong` | `#1D4ED8` (blue-700) | 모든 solid CTA 버튼, 선택된 세그먼트/칩 배경, 링크 텍스트 | 흰 텍스트 대비 ~6.3:1 (AA 통과) |
| `--color-accent` | `#3B82F6` (blue-500, 포인트 블루) | 포커스 링, 얇은 강조 보더/인디케이터 — **텍스트·버튼 배경으로는 안 씀**(흰 텍스트 대비 ~3.7:1로 일반 텍스트 크기 AA 기준 미달) | non-text UI(3:1 기준)에만 사용 |
| `--color-app-bg` | `#0F1B33` (짙은 네이비) | 모바일 프레임 **바깥** 배경 | — |
| `--color-surface` | `#FFFFFF` | 화면/카드 배경 | — |
| `--color-surface-muted` | `#F3F6FB` | 섹션 구분용 옅은 배경(지분 미리보기, 합계 박스 등) | — |
| `--color-border` | `#E1E7F0` | 카드/인풋 테두리 | — |
| `--color-text` | `#0F172A` | 본문 텍스트 | 흰 배경 대비 ~16.5:1 |
| `--color-text-muted` | `#5B6478` | 보조 텍스트 | 흰 배경 대비 ~5.2:1 (AA 통과) |

기존 배지 색(success `#15803D`/`bg-green-50`, warn `#B45309`/`bg-amber-50`, error `#B91C1C`/`bg-red-50`)은 **그대로 유지** — 이미 검증된 대비이고 블루 무드와 충돌하지 않음.

결정: 모바일 프레임 바깥 배경은 짙은 네이비(`#0F1B33`)로 확정 — "진한 블루" 메인 무드를 프레임 밖까지 확장해 브랜드 톤을 일관되게 유지. 포인트 블루(`#3B82F6`)는 텍스트/버튼 배경에 쓰지 않고 포커스 링 등 non-text UI로 한정 — 대신 "선택됨" 표시가 필요한 곳(분배 방식 토글, 비용 유형 칩)은 `--color-primary-strong`(blue-700)을 사용해 AA 대비를 항상 만족시킨다.

## Typography
- 새 폰트 라이브러리 추가 안 함 — 시스템 폰트 스택만 `Arial, Helvetica` → `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`로 교체 (순수 CSS)
- 헤더 타이틀: 16px semibold / 본문: 15px regular / 보조·캡션: 13px / 금액: `tabular-nums` + semibold

## Layout Policy
- **모바일 프레임**: `src/app/layout.tsx`의 `<body>` 안에 최대 430px 폭 래퍼를 중앙 정렬(좁은 실기기 화면에서는 `max-w`만 적용되어 자연스럽게 줄어듦). 바깥은 `--color-app-bg`로 채워 "폰 화면"처럼 보이게 함. 라우팅·상태 로직 변경 없이 마크업 구조만 추가.
- **하단 고정 액션 바**: 폼의 주 제출 버튼을 화면 하단에 배치하고 터치 타겟 44px 이상 보장(`min-h-11`).
- **헤더**: `sticky top-0`, 3열 그리드(뒤로가기 44×44 히트영역 / 중앙 정렬 타이틀 / 우측 여백)로 변경. 뒤로가기는 화살표 아이콘 + `aria-label="뒤로 가기"`로 접근성 이름을 유지 — 기존 UI Rules의 "아이콘 전용 액션 지양" 원칙에 대한 의도적 예외(전 세계적으로 통용되는 표준 back 패턴이며 스크린리더에는 완전한 라벨이 전달됨).
- **카드/여백**: `rounded-xl`~`rounded-2xl`, 패딩 `p-4`~`p-5`로 확대.

## UI Rules
(기존 6개 항목 그대로 유지 — 산출식·라벨·색상단독금지 원칙은 이번 개정과 무관)
- Use clear button text.
- Use labels for inputs.
- Use semantic headings.
- Avoid icon-only actions (뒤로가기 화살표는 예외 — 위 Layout Policy 참조).
- Avoid random design changes.
- Show the formula behind every calculated amount.
- Always show whether shares add up to 100%.
- Use a sign or label, not color alone, to mark amounts to receive versus amounts to pay.

## Main Screens
(기존 내용 유지 — 이번 개정은 시각 디자인만 다룸)
- Landing Page: one-line definition + CTA
- App Page: S1 자산 목록, S2 자산 생성, S3 자산 상세, S4 비용 기록, S5 종료 규칙, S6 정산, S7 공유 요약

## Accessibility 재확인
- 라벨-입력 연결: 구조 변경 없음, 그대로 유지
- 받을 금액 "+"/"받음" 라벨: 유지, 색상 강조 추가 안 함
- 터치 타겟: 모든 버튼·링크 최소 44×44px (`min-h-11` 기준)
- 색상 대비: 위 표에 실측 대비비 명시, 전부 WCAG AA 이상
