declare global {
  interface Window {
    ym: any;
  }

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
}

export {};
