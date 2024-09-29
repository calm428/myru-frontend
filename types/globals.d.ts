// global.d.ts

interface WebkitMessageHandlers {
  shareHandler: {
    postMessage: (message: string) => void;
  };
}

interface Webkit {
  messageHandlers: WebkitMessageHandlers;
}

interface Window {
  webkit?: Webkit;
}
