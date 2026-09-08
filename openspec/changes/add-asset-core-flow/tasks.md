## 1. 프로젝트 뼈대

- [ ] 1.1 Next.js(App Router) + TypeScript + Tailwind 스캐폴딩. `npm run dev` 로 `/app` route가 렌더되고 콘솔 에러가 없는지 확인
- [ ] 1.2 Vitest 설정 + `test` 스크립트 추가. `npm run test` 가 빈 스위트로 통과하는지 확인

## 2. 도메인 타입 · 저장소

- [ ] 2.1 `src/lib/types.ts` 에 `Asset`(신규 `status: 'draft' | 'agreed' | 'settled'` 포함), `Member`, `SplitMode` 정의. `npx tsc --noEmit` 통과
- [ ] 2.2 `src/lib/storage/schema.ts` 에 `StoreSchema{ version: 1, assets: Asset[] }`, `STORAGE_KEY = 'woorimok.store.v1'`, `EMPTY_STORE` 정의. import 해서 `EMPTY_STORE.assets.length === 0` 확인
- [ ] 2.3 `src/lib/storage/assetStore.ts` 에 `load(): { data, loadError }`(parse 실패 시 `EMPTY_STORE` + `loadError: true`), `save()`(예외 포착), `clear()`. `typeof window` 가드. 단위 테스트: 정상 로드 / 깨진 JSON / save 예외 3케이스 통과

## 3. 계산 순수 함수

- [ ] 3.1 `src/lib/calc/shares.ts` 의 `computeShares(asset)` 구현(납부액 비율·균등, 소수 1자리 반올림, 잔여를 최대 납부자/첫 참여자에 배분). 테스트: 50/30/20, 1/3·1/3·1/3, 균등 3인 합계 100.0%
- [ ] 3.2 같은 파일에 `checkContribution(asset)` 구현(합계·차액·`ok`). 테스트: 합계 일치 / 부족 / 초과 / 합계 0
- [ ] 3.3 `src/lib/calc/status.ts` 의 `canTransition(asset, to)` 구현(인접 단계만, `draft→agreed` 는 `checkContribution().ok` 게이트). 테스트: draft→agreed 통과·차단, draft→settled 불가, settled→agreed·agreed→draft 허용
- [ ] 3.4 `src/lib/calc/filter.ts` 의 `filterAssets(assets, { status, memberName, query })` 구현(AND 결합, query 는 `name` 부분 일치·trim·lowercase). 테스트: 상태축 / 참여자축 / 검색축 / 3축 결합 / 결과 0건

## 4. 상태 계층

- [ ] 4.1 `src/lib/state/AssetStoreProvider.tsx` 에 Context + `useReducer`. 마운트 시 `load()`, 변경 시 즉시 `save()`, `mounted` 가드. 액션 `createAsset`(생성 시 `status='draft'` 부여), `deleteAsset`, `setStatus` 구현
- [ ] 4.2 `src/lib/state/useAsset.ts`(단일 자산 + 파생값) 훅 추가. `src/app/app/layout.tsx` 에서 Provider 로 감싸고 `/app/**` 뷰를 `next/dynamic` `{ ssr: false }` 로 로드. `/app` 진입 시 서버 렌더 경고 없음 확인

## 5. 자산 생성 (asset-registration)

- [ ] 5.1 `/app/assets/new` 폼 구현: 물건명·구매일(선택)·총 구매금액·참여자(≥2)·관리자(선택/"없음")·합의 메모(선택)·분배 방식 토글·납부액 필드. 필수 조건에 따라 "자산 만들기" 활성/비활성 — spec `자산 생성 필수 입력` 시나리오 3종 수동 확인
- [ ] 5.2 폼 하단에 실시간 지분율 미리보기 + 납부액 합계 배지(일치 / "총 구매금액보다 N원 적습니다" / 합계 0 오류) 연결 — spec `지분율 자동 산출`·`납부액 합계 검증` 시나리오 확인
- [ ] 5.3 "자산 만들기" → `createAsset` → 자산 상세로 이동. 새로고침 후 `/app` 목록에 남고 상태가 `draft` 인지 확인 — spec `생성 가능`·`새 자산은 작성중`

## 6. 자산 목록 + 필터 (asset-list)

- [ ] 6.1 `/app` 카드 목록: 물건명·참여자 수·총 구매금액·상태 배지·관리자(이름 또는 "관리자 미지정"). 카드 선택 시 상세 이동. 자산 0건이면 "아직 등록한 자산이 없어요" + "자산 추가" — spec `자산 목록 표시`·`등록된 자산이 없음`
- [ ] 6.2 상태 칩(전체/작성중/합의완료/정산완료) + 참여자 선택 + 물건명 검색창을 `filterAssets` 에 연결 — spec `상태 필터`·`참여자 필터`·`물건명 검색` 시나리오 확인
- [ ] 6.3 필터 결과 0건이면 "조건에 맞는 자산이 없어요" + 필터 초기화 동작 표시, 자산 0건 상태와 구분 — spec `필터 결합과 빈 결과`
- [ ] 6.4 카드 더보기 → 삭제(`confirm`) → `deleteAsset`. 새로고침 후에도 삭제 유지 확인 (04 S1 / FR-12)

## 7. 상태 전환 (asset-status)

- [ ] 7.1 자산 상세에 상태 배지 + 전환 버튼("합의완료로 변경" / "정산완료로 변경" / "되돌리기"). `canTransition` 결과로 버튼 활성화 — spec `전진 전환 규칙`·`후진 전환 규칙` 시나리오 확인
- [ ] 7.2 `draft→agreed` 버튼은 납부액 검증 통과(또는 균등 모드) 시에만 활성, 실패 시 차액 사유 표시 — spec `검증 실패 시 합의완료 전환 차단`
- [ ] 7.3 `agreed→draft` 되돌리기에 확인 절차 추가 — spec `합의완료를 작성중으로 되돌림`
- [ ] 7.4 상태 변경 시 `setStatus` 로 즉시 저장. `agreed` 로 바꾼 뒤 새로고침해도 유지되는지 확인 — spec `상태 변경 지속`

## 8. 로컬 저장 통합 (local-persistence)

- [ ] 8.1 `loadError` 시 빈 목록 + "저장된 데이터를 불러오지 못했습니다" 배너 + 초기화 동작 — spec `깨진 저장 데이터` (localStorage 값을 깨뜨리고 새로고침해 확인)
- [ ] 8.2 `save` 예외 시 "저장되지 않을 수 있음"을 1회 안내하고 메모리 상태로 계속 동작 — spec `저장이 차단된 환경`

## 9. 통합 검증

- [ ] 9.1 `npm run test` 전체 green (calc 4개 모듈 + storage)
- [ ] 9.2 `npm run build` 성공, SSR 프리렌더 에러 0
- [ ] 9.3 수동 흐름 1회 완주: 자산 생성 → 목록에서 확인 → 상태 `draft`→`agreed`→`settled` → 필터(상태·참여자·검색어) → 새로고침 후 자산·상태·삭제가 모두 유지. 콘솔 에러 0
