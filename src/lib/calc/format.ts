// 금액·산출식 문자열 포맷. 계산이 아니라 표시 전용 (R-8, FR-9).
// 출처: planning/md-design/04_TECHNICAL_DESIGN.md §7

const NUMBER_FORMAT = new Intl.NumberFormat("ko-KR");

// 정수 원 단위, 천단위 콤마. R-8: 통화 표기는 "원"으로 고정.
export function won(amount: number): string {
  return `${NUMBER_FORMAT.format(Math.round(amount))}원`;
}

// 콤마만 넣고 "원"은 붙이지 않음 (산출식 안에서 재사용).
export function comma(amount: number): string {
  return NUMBER_FORMAT.format(Math.round(amount));
}

// 소수 첫째 자리까지 퍼센트 표기 (예: "33.3%").
export function percent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// 받을 금액: 부호 + "받음" 라벨 (색상 대신 텍스트로 구분, NFR-5/AC-13).
export function receiveLabel(amount: number): string {
  return `+ ${won(amount)} 받음`;
}
