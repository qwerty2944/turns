"use client";

import { useState } from "react";
import {
  CARD,
  CARD_NAMES_KR,
  cardNeedsGuardGuess,
  cardNeedsTarget,
} from "../model/cards";
import { CardImage } from "./CardImage";

type Target = {
  sessionId: string;
  nickname: string;
  eliminated: boolean;
  protected: boolean;
};

type Props = {
  card: number;
  selfSessionId: string;
  targets: Target[];
  myHandHasCountessRestriction: boolean;
  onConfirm: (payload: {
    card: number;
    targetSessionId?: string;
    guardGuess?: number;
  }) => void;
  onCancel: () => void;
};

const GUARD_GUESS_OPTIONS = [
  CARD.PRIEST,
  CARD.BARON,
  CARD.HANDMAID,
  CARD.PRINCE,
  CARD.KING,
  CARD.COUNTESS,
  CARD.PRINCESS,
];

export const PlayCardModal = ({
  card,
  selfSessionId,
  targets,
  myHandHasCountessRestriction,
  onConfirm,
  onCancel,
}: Props) => {
  const [pickedTargetSid, setPickedTargetSid] = useState<string | null>(null);

  // Countess rule blocks playing King/Prince — show a hint instead of letting them pick.
  if (myHandHasCountessRestriction && card !== CARD.COUNTESS) {
    return (
      <Backdrop onClose={onCancel}>
        <h3 className="title" style={{ margin: 0 }}>
          {CARD_NAMES_KR[CARD.COUNTESS]} 규칙
        </h3>
        <p className="muted">
          왕 또는 왕자와 함께 손에 들었을 때는 반드시 백작부인을 버려야 합니다.
        </p>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button onClick={onCancel}>닫기</button>
        </div>
      </Backdrop>
    );
  }

  const needsTarget = cardNeedsTarget(card);
  const allowSelfTarget = card === CARD.PRINCE;
  const validTargets = targets.filter(
    (t) =>
      !t.eliminated &&
      !t.protected &&
      (allowSelfTarget || t.sessionId !== selfSessionId),
  );

  // Show guard-guess step once a target is picked.
  const showGuessStep = cardNeedsGuardGuess(card) && pickedTargetSid !== null;

  return (
    <Backdrop onClose={onCancel}>
      <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
        <CardImage card={card} size={90} noTooltip />
        <div className="col" style={{ gap: 4, flex: 1 }}>
          <h3 className="title" style={{ margin: 0 }}>
            {CARD_NAMES_KR[card]} 사용
          </h3>

          {!needsTarget && (
            <div className="col" style={{ gap: 10 }}>
              <p className="muted" style={{ margin: 0 }}>
                대상 없이 즉시 사용합니다.
              </p>
              <button onClick={() => onConfirm({ card })}>사용</button>
            </div>
          )}

          {needsTarget && validTargets.length === 0 && (
            <div className="col" style={{ gap: 10 }}>
              <p className="muted" style={{ margin: 0 }}>
                지목할 수 있는 대상이 없습니다. 효과 없이 버립니다.
              </p>
              <button onClick={() => onConfirm({ card })}>사용</button>
            </div>
          )}

          {needsTarget && validTargets.length > 0 && !showGuessStep && (
            <>
              <p className="muted" style={{ margin: 0 }}>
                대상을 선택하세요 (클릭 즉시 사용)
              </p>
              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                {validTargets.map((t) => (
                  <button
                    key={t.sessionId}
                    className="target-card"
                    onClick={() => {
                      if (cardNeedsGuardGuess(card)) {
                        // need another step (pick guessed card)
                        setPickedTargetSid(t.sessionId);
                      } else {
                        onConfirm({ card, targetSessionId: t.sessionId });
                      }
                    }}
                  >
                    <span style={{ fontSize: 14 }}>
                      {t.nickname}
                      {t.sessionId === selfSessionId ? " (나)" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {showGuessStep && (
            <>
              <p className="muted" style={{ margin: 0 }}>
                추측할 카드를 클릭 (병사 제외)
              </p>
              <div
                className="row"
                style={{ flexWrap: "wrap", gap: 8, justifyContent: "flex-start" }}
              >
                {GUARD_GUESS_OPTIONS.map((c) => (
                  <button
                    key={c}
                    className="target-card"
                    style={{ minWidth: 0 }}
                    onClick={() =>
                      onConfirm({
                        card,
                        targetSessionId: pickedTargetSid!,
                        guardGuess: c,
                      })
                    }
                  >
                    <CardImage card={c} size={52} noTooltip />
                    <span style={{ fontSize: 12 }}>
                      {c}. {CARD_NAMES_KR[c]}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="row" style={{ justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onCancel}>닫기</button>
      </div>
    </Backdrop>
  );
};

const Backdrop = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(8, 5, 22, 0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="panel col"
      style={{ maxWidth: 520, width: "92vw" }}
    >
      {children}
    </div>
  </div>
);
