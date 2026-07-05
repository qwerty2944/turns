"use client";

type Props = {
  won: boolean;
  winnerName: string;
  spectating: boolean;
  onLeave: () => void;
};

export const VictoryScreen = ({ won, winnerName, spectating, onLeave }: Props) => (
  <div className="yd-victory">
    <div className={`yd-victory-inner${won ? " yd-victory-inner--won" : ""}`}>
      <div className="yd-victory-emoji">{spectating ? "🗳" : won ? "🏆" : "🥀"}</div>
      <h2 className="yd-victory-title">
        {spectating ? `${winnerName} 당선!` : won ? "당선!" : "낙선…"}
      </h2>
      <p className="yd-victory-sub">
        {spectating
          ? "개표가 완료되었습니다."
          : won
            ? "국민의 선택을 받았습니다."
            : `${winnerName} 후보가 당선되었습니다.`}
      </p>
      <button onClick={onLeave}>로비로</button>
    </div>
  </div>
);
