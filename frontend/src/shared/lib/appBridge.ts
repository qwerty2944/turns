/**
 * Bridge to the Flutter app's InAppWebView.
 *
 * While the app shows its NATIVE pre-game lobby, this page runs hidden
 * behind it and stays the single Colyseus connection: we push normalized
 * lobby snapshots up to Flutter (callHandler) and accept commands back
 * (window.__turnsApp.cmd) that translate to room messages.
 */

type AppWindow = Window & {
  flutter_inappwebview?: {
    callHandler: (name: string, ...args: unknown[]) => Promise<unknown>;
  };
  __turnsApp?: {
    cmd: (name: string, payloadJson?: string) => void;
  };
};

const w = (): AppWindow | null =>
  typeof window === "undefined" ? null : (window as unknown as AppWindow);

export const isInApp = (): boolean => !!w()?.flutter_inappwebview;

export const postToApp = (handler: string, payload: unknown) => {
  const win = w();
  if (!win?.flutter_inappwebview) return;
  try {
    win.flutter_inappwebview.callHandler(handler, payload);
  } catch {
    // handler not registered yet — next snapshot will land
  }
};

export type AppCommandMap = Record<string, (payload: unknown) => void>;

/** Register the command sink Flutter calls via evaluateJavascript. */
export const registerAppCommands = (commands: AppCommandMap): (() => void) => {
  const win = w();
  if (!win) return () => {};
  win.__turnsApp = {
    cmd: (name, payloadJson) => {
      const fn = commands[name];
      if (!fn) return;
      let payload: unknown = undefined;
      if (payloadJson) {
        try {
          payload = JSON.parse(payloadJson);
        } catch {
          payload = payloadJson;
        }
      }
      fn(payload);
    },
  };
  return () => {
    if (win.__turnsApp) delete win.__turnsApp;
  };
};
