'use client';

import { useState, useEffect } from 'react';
import { BsShareFill, BsTwitterX } from 'react-icons/bs';
import { FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { Button } from '../ui/button';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import {
  TwitterShareButton,
  TelegramShareButton,
  WhatsappShareButton,
} from 'react-share';

interface ShareButtonProps {
  shareUrl: string;
  shareTitle: string;
}

function ShareButton({ shareUrl, shareTitle }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false); // Состояние для открытия/закрытия списка
  const [isWebView, setIsWebView] = useState(false); // Проверка на WebView

  const handleToggle = () => {
    setIsOpen((prev) => !prev); // Переключаем состояние при клике
  };

  // Логика проверки на WebView
  useEffect(() => {
    if (window.webkit && window.webkit.messageHandlers) {
      setIsWebView(true); // WebKit WebView обнаружен
    } else {
      setIsWebView(false); // Не WebKit WebView
    }
  }, []);

  const handleWebViewShare = () => {
    // Код для отправки сообщения в Swift
    if (window.webkit?.messageHandlers?.shareHandler) {
      window.webkit.messageHandlers.shareHandler.postMessage(shareUrl);
    }
  };

  const renderShareButtons = () => (
    <div
      className={`flex space-x-2 transition-all duration-300 ease-in-out ${
        isOpen
          ? 'translate-x-0 opacity-100'
          : 'pointer-events-none translate-x-full opacity-0'
      }`}
    >
      {/* Кнопки для социальных сетей */}
      <TwitterShareButton url={shareUrl} title={shareTitle}>
        <Button variant='default' size='icon'>
          <BsTwitterX />
        </Button>
      </TwitterShareButton>
      <TelegramShareButton url={shareUrl} title={shareTitle}>
        <Button variant='default' size='icon'>
          <FaTelegramPlane />
        </Button>
      </TelegramShareButton>
      <WhatsappShareButton url={shareUrl} title={shareTitle}>
        <Button variant='default' size='icon'>
          <FaWhatsapp />
        </Button>
      </WhatsappShareButton>
    </div>
  );

  return (
    <div className='relative inline-block'>
      {/* Проверка на WebView */}
      {isWebView ? (
        // Если WebView, показываем только кнопку для шаринга через WebKit
        <Button
          variant='default'
          size='icon'
          className='rounded-full'
          onClick={handleWebViewShare}
        >
          <BsShareFill />
        </Button>
      ) : (
        // Если не WebView, показываем кнопку и список иконок соцсетей
        <>
          <Button
            variant='default'
            size='icon'
            className='rounded-full'
            data-tooltip-id='my-tooltip-5'
            onClick={handleToggle} // Открываем/закрываем список
          >
            <BsShareFill />
          </Button>

          <ReactTooltip
            id='my-tooltip-5'
            place='bottom'
            content='поделиться в соц сети'
          />
          {/* Анимированный список иконок соцсетей */}
          {isOpen && (
            <div
              className={`absolute left-[-8rem] top-0 transition-all duration-300 ease-in-out ${
                isOpen ? 'max-w-md opacity-100' : 'max-w-0 opacity-0'
              }`}
            >
              {renderShareButtons()}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ShareButton;
