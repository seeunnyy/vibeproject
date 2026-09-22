# Refactoring Plan — 우리몫 MVP

> 대상: 현재 작업 트리(uncommitted 포함, Goal 1·2 슬라이스). 코드는 아직 수정하지 않음 — 승인 후 진행.

## 1. Refactoring Goal

Goal 3(필터)·Goal 4(상태 전환 UI, `deleteAsset`/`setStatus` 액션 추가)가 붙기 전에 상태 관리 구조와 중복 코드를 정리해, 이후 기능이 늘어날 때 수정 지점이 흩어지지 않게 한다. 이전 React 모범사례 검토(우선순위 1~4번)와 코드 중복 스캔에서 나온 항목을 대상으로 한다. 기능은 동일하게 유지하고 내부 구현만 정리하는 것이 목적.

## 2. Current Problems

| # | 위치 | 문제 |
|---|---|---|
| P1 | `src/lib/state/AssetStoreProvider.tsx:45` | `<AssetStoreContext.Provider value={{ assets, loadError, mounted, createAsset }}>` — 매 렌더 새 객체 리터럴을 `value`로 넘겨, Provider가 리렌더될 때마다 모든 소비 컴포넌트가 불필요하게 리렌더됨 |
| P2 | `src/lib/state/AssetStoreProvider.tsx:22-24, 40-42` | `assets`/`loadError`/`mounted`를 개별 `useState` 3개 + 별도 `createAsset` 함수로 관리 — design.md D4·tasks.md 4.1이 원래 명시한 "Context + `useReducer`" 패턴과 다름. Goal 4에서 `deleteAsset`/`setStatus`가 추가되면 이 패턴이 계속 늘어남 |
| P3 | `src/lib/state/AssetStoreProvider.tsx:35-38` | 마운트 시 `load()`로 채운 `assets`를 두 번째 `useEffect`가 곧바로 다시 `save()` — task 2.3에서 `save()`가 실제 구현되면 불필요한 쓰기 발생 |
| P4 | `src/app/page.tsx:18`, `src/app/app/page.tsx:33`, `src/app/app/assets/new/page.tsx:41` | "rounded-md bg-neutral-900 ... text-white" 계열 primary 버튼 클래스가 3곳에 거의 동일하게 중복 |
| P5 | `tests/checkContribution.test.ts:5-17`, `tests/canTransition.test.ts:5-17` | `makeAsset` 테스트 헬퍼가 import 한 줄만 다르고 완전히 동일한 코드로 중복 |

## 3. Allowed Refactoring

- **P1, P2, P3 → `AssetStoreProvider.tsx` 내부를 `useReducer`로 전환**하고 Context `value`를 `useMemo`로 감싼다. `useAssetStore()`가 반환하는 필드(`assets`, `loadError`, `mounted`, `createAsset`)의 이름·타입·동작은 그대로 유지 — 이걸 쓰는 두 페이지 컴포넌트는 한 줄도 안 바뀌어야 한다. `load()` 직후 첫 세팅에는 `save()`를 건너뛰도록 분기.
- **P4 → 공용 버튼 스타일 추출.** 새 라이브러리 없이 클래스 문자열 상수(`src/components/` 안에 작은 프레젠테이션 컴포넌트 또는 `src/lib/ui/buttonStyles.ts` 같은 상수 모듈)로 뽑아 3곳에서 재사용. 최종 렌더링되는 클래스 목록은 지금과 동일해야 함(disabled 변형 포함).
- **P5 → `makeAsset` 팩토리를 `tests/helpers/asset.ts`(신규, 테스트 전용 파일)로 옮기고** 두 테스트 파일에서 import. 테스트 케이스·assertion은 그대로.
- 파일을 옮기는 건 P5(테스트 헬퍼) 하나뿐 — 나머지는 기존 파일 내부 구현만 정리.

## 4. Not Allowed

- **기능 추가·변경 금지**: `assetStore.ts`의 `load()`/`save()` 실제 구현(task 2.3), `members` 최소 인원(≥2) 검증, 상태 전환 UI 연결(Goal 4), 목록 필터(Goal 3) — 지난 `/code-review`에서 나온 두 findings(저장 스텁으로 인한 데이터 유실, `members:[]`가 타입 주석의 불변식 위반)도 동작을 바꾸는 수정이라 이번 범위에 포함하지 않는다.
- **`useAssetStore()`의 공개 인터페이스(반환 필드명·타입) 변경 금지** — 바뀌면 페이지 컴포넌트도 같이 고쳐야 하고, 그건 리팩토링이 아니라 API 변경이 된다.
- **새 라이브러리 추가 금지** — 버튼 스타일 추출도 `clsx`/`cva` 같은 패키지 없이 순수 문자열 상수/컴포넌트로만 한다.
- **`src/lib/types.ts`의 MD 트랙 vs OpenSpec 트랙(`Asset` vs `AssetWithStatus`) 분리 구조는 건드리지 않는다** — 파일 상단 주석에 명시된 의도된 설계 결정.
- **OpenSpec `specs/*.md`·`tasks.md`, `docs/*.md` 내용 변경 금지** — 문서는 코드 리팩토링과 무관하게 그대로 둔다.

## 5. Verification

1. `npx tsc --noEmit` — 통과
2. `npm run test` (vitest) — 리팩토링 전후 **18개 그대로 통과**(P5 이후엔 파일 위치만 바뀌고 케이스 수 동일해야 함)
3. `npx playwright test` — 현재 3개(`tests/e2e/create-item.spec.ts`) 그대로 통과. Context 내부가 `useReducer`로 바뀌어도 실제 브라우저 동작(생성→목록 반영, 빈 제목 차단, 빈 상태 노출)이 동일한지 확인하는 유일한 실측 수단이라 필수.
4. `git diff`로 페이지 컴포넌트(`src/app/**`) 쪽 변경이 0줄인지 확인 — `useAssetStore()` 소비부가 안 바뀌었다는 증거. 변경이 생기면 범위 초과로 간주하고 되돌린다.
5. P4(버튼 스타일 추출) 이후 브라우저에서 한 번 스크린샷 비교 — 클래스 문자열이 정확히 동일하면 생략 가능.

검토·승인해주시면 P1~P5 순서로 진행하겠습니다.
