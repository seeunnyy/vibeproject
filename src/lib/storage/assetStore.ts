import { EMPTY_STORE, type StoreSchema } from "@/lib/storage/schema";

// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §6
// 오늘은 시그니처와 최소 동작만 정의한다. 실제 localStorage 읽기/파싱/쓰기 로직,
// 손상 데이터 복구, 저장 실패 처리(§6 경계)는 이후 슬라이스에서 구현한다.

export function load(): { data: StoreSchema; loadError: boolean } {
  // TODO: localStorage에서 STORAGE_KEY 읽기 → JSON.parse → version 검사.
  return { data: EMPTY_STORE, loadError: false };
}

export function save(state: StoreSchema): void {
  void state; // TODO: JSON.stringify 후 localStorage에 저장. 예외는 잡아서 콘솔 경고.
}

export function clear(): void {
  // TODO: STORAGE_KEY 삭제.
}
