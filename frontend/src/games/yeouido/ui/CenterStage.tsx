"use client";

import { cardArt, cardView } from "../model/cards";
import type { YdAnnouncement } from "../model/useFxQueue";

type Props = {
  stage: { a: YdAnnouncement; id: number } | null;
  meSid?: string;
  nicknameOf: (sid: string) => string;
};

/** Center-of-battlefield announcement. Non-interactive. */
export const CenterStage = ({ stage, meSid, nicknameOf }: Props) => {
  if (!stage) return null;
  const a = stage.a;

  return (
    <div className="yd-centerstage" aria-live="polite">
      <div key={stage.id} className="yd-centerstage-inner">
        <StageContent a={a} meSid={meSid} nicknameOf={nicknameOf} />
      </div>
    </div>
  );
};

const CardReveal = ({ cardId }: { cardId: string }) => {
  const view = cardView(cardId);
  return (
    <div className="yd-centerstage-card">
      <span className="yd-card-cost">{view.cost}</span>
      <div className="yd-card-art" style={{ backgroundImage: `url(${cardArt(cardId)})` }} />
      <div className="yd-card-name">{view.name}</div>
      {view.text && <div className="yd-card-text">{view.text}</div>}
      {view.type === "unit" && (
        <>
          <span className="yd-stat yd-stat--atk">{view.atk}</span>
          <span className="yd-stat yd-stat--hp">{view.hp}</span>
        </>
      )}
    </div>
  );
};

const StageContent = ({
  a,
  meSid,
  nicknameOf,
}: {
  a: YdAnnouncement;
  meSid?: string;
  nicknameOf: (sid: string) => string;
}) => {
  switch (a.kind) {
    case "turn":
      return (
        <div
          className={`yd-turn-banner${a.sid === meSid ? " yd-turn-banner--mine" : ""}`}
        >
          {a.sid === meSid ? "⚔ 내 차례!" : `${nicknameOf(a.sid)} 차례`}
        </div>
      );
    case "play":
      return (
        <>
          <CardReveal cardId={a.cardId} />
          <div className="yd-centerstage-label">
            {nicknameOf(a.sid)}의 카드
          </div>
        </>
      );
    case "rattle":
      return (
        <div className="yd-centerstage-label yd-centerstage-label--rattle">
          💀 죽음의 메아리 — {cardView(a.cardId).name}
        </div>
      );
    case "burn":
      return (
        <>
          <CardReveal cardId={a.cardId} />
          <div className="yd-centerstage-label yd-centerstage-label--bad">
            🔥 손패가 가득 — 카드 소각!
          </div>
        </>
      );
    case "discard":
      return (
        <>
          <CardReveal cardId={a.cardId} />
          <div className="yd-centerstage-label yd-centerstage-label--bad">
            🚨 압수수색 — {nicknameOf(a.sid)}의 카드 폐기
          </div>
        </>
      );
    case "fatigue":
      return (
        <div className="yd-centerstage-label yd-centerstage-label--bad">
          ☠ 탈진! {nicknameOf(a.sid)} 지지율 -{a.n}
        </div>
      );
    case "heroPower":
      return (
        <div className="yd-centerstage-label">
          ✨ {nicknameOf(a.sid)} — 영웅 능력
        </div>
      );
  }
};
