# SECURITY_REVIEW.md

> 검토일: 2026-09-22 · 범위: 현재 작업 트리(uncommitted 포함) + `openspec/changes/add-asset-core-flow/**`
> 읽은 문서: `openspec/changes/add-asset-core-flow/{proposal,design,tasks}.md`, `specs/**/*.md`, `src/**`, `package.json`, `README.md`(부재 확인)

## 요약

공격 표면이 원래 작은 프로젝트다 — 외부 API·인증·결제·서버 없음(CLAUDE.md 경계), 모든 데이터는 브라우저 로컬(NFR-6). 이번 검토에서 **치명적 취약점은 발견되지 않았다.** 주로 "배포 전에 꺼두면 좋은 기본값 미설정"과 "아직 구현 안 된 저장 로직이 나중에 검증 없이 커질 위험" 두 갈래.

## 1. 민감 정보 노출

- 하드코딩된 API 키·시크릿·토큰: `src/` 전체 grep(`API_KEY|SECRET|TOKEN|process\.env`) 결과 0건.
- `.env*` 파일: 저장소에 없음. `.gitignore`에 `.env*` 이미 무시 설정돼 있어 실수로 커밋될 경로는 막혀 있음.
- 참여자 이름·납부액 등은 NFR-6에 따라 "로컬에만 저장"이 의도된 설계 — 서버 전송 자체가 없어 네트워크 노출 벡터는 없음.
- **Next.js 텔레메트리**: 기본 활성화 상태(`next.config.ts`에 비활성화 설정 없음). `next dev`/`next build` 실행 시 익명 사용 메타데이터가 Vercel로 나간다. 프로젝트 데이터 자체는 아니지만 "서버 전송 없음"(NFR-6) 원칙과 결이 안 맞음.

## 2. localStorage에 저장하면 안 되는 정보

- `src/lib/types.ts`의 `Asset`/`Member` 필드(물건명·구매일·총액·참여자 이름·납부액·비용내역)는 비밀번호·주민번호·계좌번호 같은 진짜 민감정보가 아님 — 요구사항(R-9~R-13) 어디에도 인증정보를 다루는 계획이 없음.
- `src/lib/storage/assetStore.ts`의 `save()`는 아직 TODO 스텁(task 2.3 미구현). 실제 구현 시 저장 전 필드 화이트리스트 없이 `StoreSchema`를 통째로 `JSON.stringify`할 계획으로 보이는데, 이러면 나중에 실수로 민감 필드가 `Asset`에 추가돼도 저장 단계에서 걸러낼 장치가 없음 — 개발 규율에만 의존.
- localStorage 저장값은 암호화되지 않는다(브라우저 표준 동작). 이름·금액이 평문으로 남는 것은 NFR-6 전제 하의 허용 범위지만, 기기를 공유하는 사용자(과제 발표 데모 등)에게는 문서화해둘 가치가 있음.

## 3. XSS 위험

- 사용자 입력(물건명 등)은 모두 JSX 텍스트 노드로만 렌더링됨 — 예: `src/app/app/page.tsx`의 `{asset.name}`, `src/app/app/assets/[id]/page.tsx`의 `{id}`. React가 자동 이스케이프하므로 현재 XSS 벡터는 없음.
- 향후(task 5.x) 합의 메모·비용 메모 등 자유 서술 필드가 늘어날 때도 같은 패턴(JSX 텍스트 노드, `dangerouslySetInnerHTML` 금지)을 유지해야 함 — 지금은 준수 중.

## 4. `dangerouslySetInnerHTML` 사용 여부

- `src/` 전체 grep 결과 **0건**. 사용하지 않음.

## 5. 외부 링크 보안 속성

- 현재 링크는 전부 Next.js `<Link>`로 내부 라우트만 가리킴 — `AppHeader.tsx`(뒤로가기), `app/page.tsx`(시작하기 → `/app`), `app/app/page.tsx`(자산 추가 → `/app/assets/new`).
- `target="_blank"`나 `href="http..."` 형태의 외부 링크는 없음 → `rel="noopener noreferrer"`가 필요한 지점이 현재는 없음.
- FR-10(공유 요약)은 스펙상 "텍스트 클립보드 복사"이지 외부 링크 공유가 아님(Q-1 확정 사항) — 이 항목은 앞으로도 해당 없을 가능성이 높음. 단, 나중에 외부 링크가 추가되면 이 체크를 다시 적용해야 함.

## 6. 배포 전 확인해야 할 설정

| 항목 | 현재 상태 | 확인 필요 |
|---|---|---|
| 보안 헤더(CSP, X-Frame-Options, X-Content-Type-Options) | `next.config.ts`에 `headers()` 미설정 — Next 기본값만 적용 | 배포 전 최소한 X-Frame-Options/X-Content-Type-Options 추가 검토 |
| Next.js 텔레메트리 | 기본 활성화 | `NEXT_TELEMETRY_DISABLED=1` 설정 여부 결정 |
| README.md | 저장소에 없음(`find`로 확인, node_modules 내부 파일만 존재) | 실행/배포 절차 미문서화 — 보안 이슈는 아니지만 배포 체크리스트 공백 |
| `.gitignore` | `.env*`, `/node_modules`, Playwright 산출물(`test-results/`, `playwright-report/`) 모두 이미 제외됨 | 양호 |
| localStorage 스키마 검증 | `StoreSchema.version` 필드는 있으나 `load()`의 실제 파싱·버전 검증 로직은 스텁(task 2.3) | `local-persistence` 스펙의 "손상 데이터 복구" 요구사항이 실제로 구현됐는지 배포 전 재확인 |
| devDependency 전용 패키지가 프로덕션 번들에 안 들어가는지 | `@playwright/test`, `vitest`는 `devDependencies`에 정확히 분리돼 있음(`package.json` 확인) | 양호 — `next build` 산출물에 테스트 도구가 섞이지 않음 |

## 7. 4회차 안에 수정 가능한 항목 (우선순위)

1. **Next.js 텔레메트리 비활성화** — `.env`(또는 배포 환경변수)에 `NEXT_TELEMETRY_DISABLED=1` 추가. 5분 내 가능, NFR-6과의 정합성 개선.
2. **기본 보안 헤더 추가** — `next.config.ts`에 `headers()`로 `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` 정도만 추가. 외부 API 없는 MVP라도 무료로 방어 가능한 항목.
3. **README.md 작성** — 최소 실행 방법(`pnpm dev`/`build`/`test`)만이라도. 보안 항목은 아니지만 배포 전 체크리스트에 항상 같이 묶이는 공백.
4. **`assetStore.ts` 구현 시 저장 화이트리스트 원칙 명문화** — task 2.3을 실제로 구현할 때, `save()`가 `StoreSchema`를 그대로 직렬화하기 전에 어떤 필드까지 허용하는지 주석/타입으로 못박기. 지금은 원칙만 기록해두고, 실제 코드는 2.3 작업 시점에 반영.

## 결론

이번 범위(Goal 1·2 슬라이스 + OpenSpec 명세)에서 발견된 심각한 취약점은 없음. 가장 현실적인 리스크는 "저장 로직이 커질 때 필드 화이트리스트 없이 그대로 직렬화되는 습관"이며, 나머지는 배포 전 기본 설정 누락 수준. 4회차 안에는 1~3번(텔레메트리·헤더·README)이 현실적인 완료 범위이고, 4번은 task 2.3 구현과 함께 처리하는 것을 권장.
