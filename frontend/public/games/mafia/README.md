# 타뷸라의 늑대 — 카드 자산 (Gemini 프롬프트 가이드)

이 폴더에 아래 파일을 PNG로 채워 넣으면 `RoleCard`와 Phaser 효과의 카드
프리로드가 자동으로 작동한다.

| 파일명 | 역할 | 타로 모티프 |
|---|---|---|
| `back.png` | 카드 뒷면 | 보름달 + 늑대 발자국 무늬 |
| `wolf.png` | 늑대 | XIII 죽음(Death) · 검은 후드, 늑대 두개골 |
| `doctor.png` | 의사 | XIIII 절제(Temperance) · 성배 두 개, 약초 |
| `seer.png` | 예언자 | II 여사제(High Priestess) · 수정구, 별빛 |
| `villager.png` | 시민 | 0 광대(The Fool) 또는 XII 매달린 자 · 촛불 든 농부 |
| `moon-bg.png` *(선택)* | 야경 배경 | 보름달 + 까마귀 실루엣 |

## 권장 사양

- 비율 **5:7 세로**, 최소 해상도 **560×784**
- 타로 카드 프레임 — 금장 테두리, 상단 로마 숫자, 하단 라틴/한글 이름
- 어두운 보라/검정 배경 + 골드 하이라이트 (러브레터 카드와 톤 일치)
- 출력은 **PNG, 투명 배경 없이** (배경 색은 카드 안에서 처리)
- 인물 표정은 신비롭고 절제된 톤 — 만화체 X

## Gemini 프롬프트 예시 (영문)

```
A tarot-style portrait card, 5:7 vertical aspect ratio, gold filigree
border, deep purple background, faint moon glow. The figure depicts a
{ROLE-SPECIFIC SUBJECT, e.g. "hooded werewolf with bone-white claws,
moonlight catching the fangs"}. Roman numeral "{NUM}" at the top, Korean
name "{KOR}" in serif at the bottom. Painterly, mystical, oil-painting
look. No text artifacts, no watermarks.
```

자산이 다 준비되기 전엔 `RoleCard`가 비어 있는 이미지를 보여주지만 이모지
fallback (🐺 ⚕️ 🔮 🌾) 가 같이 노출되므로 게임 진행은 무리 없이 된다.
