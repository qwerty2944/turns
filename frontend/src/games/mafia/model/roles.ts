export const ROLE = {
  VILLAGER: "villager",
  WOLF: "wolf",
  DOCTOR: "doctor",
  SEER: "seer",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

export const ROLE_NAMES_KR: Record<Role, string> = {
  villager: "시민",
  wolf: "늑대",
  doctor: "의사",
  seer: "예언자",
};

export const ROLE_DESC_KR: Record<Role, string> = {
  villager:
    "능력이 없는 평범한 시민. 낮 토론과 투표로 늑대를 색출하라.",
  wolf:
    "밤마다 한 명을 사냥한다. 정체를 들키지 말고 시민들을 줄여라.",
  doctor:
    "매 밤 한 명을 보호한다. 같은 사람을 연속해서 두 밤 보호할 수 없다.",
  seer:
    "매 밤 한 명의 정체를 들여다 본다. 결과는 너만 안다.",
};

// Image filename key
export const ROLE_KEY: Record<Role, string> = {
  villager: "villager",
  wolf: "wolf",
  doctor: "doctor",
  seer: "seer",
};

export const ROLE_EMOJI: Record<Role, string> = {
  villager: "🌾",
  wolf: "🐺",
  doctor: "⚕️",
  seer: "🔮",
};

export type WolfTeamMember = { sessionId: string; nickname: string };
