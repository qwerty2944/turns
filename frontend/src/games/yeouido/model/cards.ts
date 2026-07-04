/**
 * 표시용 카드 데이터 — id는 backend/src/games/yeouido/cards.ts와 1:1.
 * 정치 풍자 표시명은 패러디(변형)명 사용, 양 진영 균등하게.
 */

export type Target =
  | "none"
  | "anyUnit"
  | "enemyUnit"
  | "friendlyUnit"
  | "any"
  | "enemyAny";

export type CardView = {
  id: string;
  name: string;
  cost: number;
  type: "unit" | "spell";
  atk?: number;
  hp?: number;
  taunt?: boolean;
  rush?: boolean;
  faction?: "ruling" | "opposition";
  target: Target;
  targetOptional?: boolean;
  text: string;
  flavor?: string;
};

export const CARD_VIEWS: Record<string, CardView> = {
  // ─── 중립 유닛 ───
  aide: {
    id: "aide", name: "국회 보좌관", cost: 1, type: "unit", atk: 1, hp: 2, target: "none",
    text: "", flavor: "혼이 담긴 커피 심부름.",
  },
  reporter: {
    id: "reporter", name: "특종 기자", cost: 2, type: "unit", atk: 2, hp: 2, target: "none",
    text: "죽음의 메아리: 카드를 1장 뽑습니다.", flavor: "죽어도 기사는 나간다.",
  },
  pollster: {
    id: "pollster", name: "여론조사기관", cost: 2, type: "unit", atk: 1, hp: 3, target: "none",
    text: "전투의 함성: 카드를 1장 뽑습니다.", flavor: "오차범위 ±3.1%p.",
  },
  youtuber: {
    id: "youtuber", name: "유튜버 논객", cost: 3, type: "unit", atk: 3, hp: 2,
    target: "any", targetOptional: true,
    text: "전투의 함성: 아무 대상에게 피해를 1 줍니다.", flavor: "구독, 좋아요, 알림설정까지.",
  },
  activist: {
    id: "activist", name: "시민단체 활동가", cost: 3, type: "unit", atk: 2, hp: 4, taunt: true, target: "none",
    text: "도발", flavor: "출근길 1인 시위는 기본.",
  },
  bodyguard: {
    id: "bodyguard", name: "경호처장", cost: 4, type: "unit", atk: 3, hp: 6, taunt: true, target: "none",
    text: "도발", flavor: "후보님은 내가 지킨다.",
  },
  prosecutor: {
    id: "prosecutor", name: "특수부 검사", cost: 4, type: "unit", atk: 4, hp: 3,
    target: "enemyUnit", targetOptional: true,
    text: "전투의 함성: 적 유닛 하나를 침묵시킵니다.", flavor: "일단 기소하고 생각한다.",
  },
  speaker: {
    id: "speaker", name: "국회의장", cost: 5, type: "unit", atk: 4, hp: 6, taunt: true, target: "none",
    text: "도발", flavor: "의장석은 아무나 못 앉는다.",
  },
  expresident: {
    id: "expresident", name: "전직 대통령", cost: 6, type: "unit", atk: 5, hp: 6, target: "none",
    text: "죽음의 메아리: 카드를 2장 뽑습니다.", flavor: "회고록이 출간되었습니다.",
  },
  chaebol: {
    id: "chaebol", name: "재벌 총수", cost: 7, type: "unit", atk: 7, hp: 7, target: "none",
    text: "", flavor: "회장님이 움직이면 코스피가 움직인다.",
  },
  scarecrow: {
    id: "scarecrow", name: "허수아비", cost: 0, type: "unit", atk: 0, hp: 2, target: "none",
    text: "", flavor: "국정감사용 증인.",
  },

  // ─── 중립 주문 ───
  comment: {
    id: "comment", name: "긴급 논평", cost: 1, type: "spell", target: "any",
    text: "아무 대상에게 피해를 2 줍니다.", flavor: "강력히 규탄한다!",
  },
  poll: {
    id: "poll", name: "여론조사", cost: 2, type: "spell", target: "none",
    text: "카드를 2장 뽑습니다.", flavor: "민심은 출렁인다.",
  },
  filibuster: {
    id: "filibuster", name: "필리버스터", cost: 2, type: "spell", target: "enemyUnit",
    text: "적 유닛 하나를 침묵시킵니다.", flavor: "무제한 토론을 시작하겠습니다.",
  },
  pledge: {
    id: "pledge", name: "포퓰리즘 공약", cost: 2, type: "spell", target: "anyUnit",
    text: "유닛 하나에게 +2/+2를 부여합니다.", flavor: "일단 지르고 본다.",
  },
  raid: {
    id: "raid", name: "압수수색", cost: 3, type: "spell", target: "none",
    text: "상대의 손패에서 무작위로 1장을 버립니다.", flavor: "새벽 6시, 초인종이 울린다.",
  },
  fakenews: {
    id: "fakenews", name: "가짜뉴스", cost: 3, type: "spell", target: "enemyUnit",
    text: "적 유닛 하나를 허수아비 0/2로 변이시킵니다.", flavor: "…라는 주장이 제기됐습니다.",
  },
  pressconf: {
    id: "pressconf", name: "긴급 기자회견", cost: 4, type: "spell", target: "none",
    text: "적 유닛 전체에게 피해를 2 줍니다.", flavor: "국민 여러분께 사과드립니다.",
  },
  impeach: {
    id: "impeach", name: "탄핵소추", cost: 6, type: "spell", target: "enemyUnit",
    text: "적 유닛 하나를 처치합니다.", flavor: "가결되었음을 선포합니다!",
  },
  realign: {
    id: "realign", name: "정계개편", cost: 8, type: "spell", target: "none",
    text: "모든 유닛을 처치합니다.", flavor: "헤쳐모여!",
  },

  // ─── 여당 전용 ───
  fandom: {
    id: "fandom", name: "개딸 팬덤", cost: 1, type: "unit", atk: 2, hp: 1,
    faction: "ruling", target: "none",
    text: "", flavor: "우리 후보한테 함부로 하지 마.",
  },
  hardliner: {
    id: "hardliner", name: "정챙래 의원", cost: 4, type: "unit", atk: 5, hp: 3, rush: true,
    faction: "ruling", target: "none",
    text: "속공", flavor: "사이다 발언 장전 완료.",
  },
  rally: {
    id: "rally", name: "지지율 결집", cost: 2, type: "spell", faction: "ruling", target: "none",
    text: "내 후보의 지지율을 5 회복합니다.", flavor: "콘크리트는 단단하다.",
  },
  reform: {
    id: "reform", name: "검찰개혁", cost: 3, type: "spell", faction: "ruling", target: "enemyUnit",
    text: "적 유닛 하나에게 피해를 3 줍니다.", flavor: "이번엔 진짜 한다.",
  },
  candlelight: {
    id: "candlelight", name: "촛불집회", cost: 5, type: "spell", faction: "ruling", target: "none",
    text: "아군 유닛 전체에게 +1/+1과 도발을 부여합니다.", flavor: "어둠은 빛을 이길 수 없다.",
  },

  // ─── 야당 전용 ───
  sitin: {
    id: "sitin", name: "1인 시위", cost: 1, type: "spell", faction: "opposition", target: "friendlyUnit",
    text: "아군 유닛 하나에게 +0/+2와 도발을 부여합니다.", flavor: "천막은 오늘도 그 자리에.",
  },
  protest: {
    id: "protest", name: "장외투쟁", cost: 2, type: "spell", faction: "opposition", target: "enemyAny",
    text: "적에게 피해를 3 줍니다.", flavor: "국회 밖이 더 뜨겁다.",
  },
  chairman: {
    id: "chairman", name: "나겸원 비대위원장", cost: 4, type: "unit", atk: 4, hp: 4,
    faction: "opposition", target: "none",
    text: "전투의 함성: 카드를 1장 뽑습니다.", flavor: "비상은 언제나 비상이다.",
  },
  strongman: {
    id: "strongman", name: "홍준푤 시장", cost: 5, type: "unit", atk: 5, hp: 5, rush: true,
    faction: "opposition", target: "none",
    text: "속공", flavor: "돌직구가 날아온다.",
  },
  martial: {
    id: "martial", name: "비상계엄", cost: 8, type: "spell", faction: "opposition", target: "none",
    text: "모든 유닛을 처치하고, 내 후보의 지지율이 5 감소합니다.", flavor: "새벽 2시의 담화문.",
  },
};

export const cardView = (id: string): CardView =>
  CARD_VIEWS[id] ?? {
    id,
    name: id,
    cost: 0,
    type: "unit",
    target: "none",
    text: "(알 수 없는 카드)",
  };

export const cardArt = (id: string) => `/games/yeouido/${id}.png`;

// ─── 진영 메타 ───

export type FactionMeta = {
  id: "ruling" | "opposition";
  label: string;
  heroName: string;
  color: string;
  colorSoft: string;
  heroPowerName: string;
  heroPowerText: string;
  artKey: string;
};

export const FACTION_META: Record<"ruling" | "opposition", FactionMeta> = {
  ruling: {
    id: "ruling",
    label: "여당",
    heroName: "이재믕 후보",
    color: "#3b82f6",
    colorSoft: "rgba(59,130,246,0.25)",
    heroPowerName: "여론 조성",
    heroPowerText: "(2) 내 후보의 지지율을 2 회복합니다.",
    artKey: "hero_ruling",
  },
  opposition: {
    id: "opposition",
    label: "야당",
    heroName: "한동훙 후보",
    color: "#ef4444",
    colorSoft: "rgba(239,68,68,0.25)",
    heroPowerName: "국정감사",
    heroPowerText: "(2) 상대 후보에게 피해를 1 줍니다.",
    artKey: "hero_opposition",
  },
};

export const KEYWORD_HINTS: [string, string][] = [
  ["도발", "적은 도발 유닛을 먼저 공격해야 합니다"],
  ["속공", "소환된 턴에도 유닛을 공격할 수 있습니다"],
  ["전투의 함성", "손에서 낼 때 발동하는 효과"],
  ["죽음의 메아리", "유닛이 죽을 때 발동하는 효과"],
];
