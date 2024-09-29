import { useState, useEffect } from 'react';

interface ShareButtonProps {
  shareUrl: string; // Указываем, что shareUrl должен быть строкой
}

function ShareButton({ shareUrl }: ShareButtonProps) {
  // Передаем ссылку через props
  const [isWebView, setIsWebView] = useState(false);

  useEffect(() => {
    // Проверяем, запущено ли приложение в WebKit WebView
    if (window.webkit && window.webkit.messageHandlers) {
      setIsWebView(true); // WebKit WebView обнаружен
    } else {
      setIsWebView(false); // Не WebKit WebView
    }
  }, []);

  const handleClick = () => {
    // Ваш код для отправки сообщения в Swift
    if (
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.shareHandler
    ) {
      window.webkit.messageHandlers.shareHandler.postMessage(shareUrl);
    }
  };

  return <>{isWebView && <button onClick={handleClick}>Поделиться</button>}</>;
}

export default ShareButton;
