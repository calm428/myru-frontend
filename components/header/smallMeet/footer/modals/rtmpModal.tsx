import React, { Fragment, useState, useEffect } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { createSelector } from '@reduxjs/toolkit';
import { isURL, isEmpty } from 'validator';
import { toast } from 'react-toastify';

import { RootState, store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { updateShowRtmpModal } from '@/store/slices/bottomIconsActivitySlice';
import sendAPIRequest from '@/helpers/api/paxMeetAPI';
import { RecordingTasks } from '@/helpers/proto/plugnmeet_recorder_pb';
import { RecordingReq } from '@/helpers/proto/plugnmeet_recording_pb';
import { CommonResponse } from '@/helpers/proto/plugnmeet_common_api_pb';
import { useTranslations } from 'next-intl';
type ProviderKeys = 'youtube' | 'facebook' | 'other';
const isActiveRtmpBroadcastingSelector = createSelector(
  (state: RootState) => state.session,
  (session) => session.isActiveRtmpBroadcasting
);

const RtmpModal = () => {
  const dispatch = useAppDispatch();
  const t = useTranslations('meet');
  const isActiveRtmpBroadcasting = useAppSelector(
    isActiveRtmpBroadcastingSelector
  );
  const [provider, setProvider] = useState<ProviderKeys>('youtube');
  const [showServerUrl, setShowServerUrl] = useState<boolean>(false);
  const [serverUrl, setServerUrl] = useState<string>('');
  const [serverKey, setServerKey] = useState<string>('');
  const providers = {
    youtube: 'rtmp://a.rtmp.youtube.com/live2/',
    facebook: 'rtmps://live-api-s.facebook.com:443/rtmp/',
  };

  useEffect(() => {
    if (provider === 'other') {
      setShowServerUrl(true);
    } else {
      setShowServerUrl(false);
    }
  }, [provider]);

  const closeStartModal = () => {
    dispatch(updateShowRtmpModal(false));
  };

  const startBroadcasting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (provider === 'other' && isEmpty(serverUrl)) {
      return;
    }
    if (isEmpty(serverKey)) {
      return;
    }
    let url = '';
    if (provider === 'other') {
      url = serverUrl;
    } else {
      url = providers[provider];
    }

    const isvalid = isURL(url, {
      protocols: ['rtmp', 'rtmps'],
    });

    if (!isvalid) {
      return;
    }

    const body = new RecordingReq({
      task: RecordingTasks.START_RTMP,
      sid: store.getState().session.currentRoom.sid,
      rtmpUrl: url + '/' + serverKey,
    });

    if (typeof (window as any).DESIGN_CUSTOMIZATION !== 'undefined') {
      body.customDesign = `${(window as any).DESIGN_CUSTOMIZATION}`.replace(
        /\s/g,
        ''
      );
    }

    const r = await sendAPIRequest(
      'rtmp',
      body.toBinary(),
      false,
      'application/protobuf',
      'arraybuffer'
    );
    const res = CommonResponse.fromBinary(new Uint8Array(r));
    let msg = 'footer.notice.rtmp-starting';

    if (!res.status) {
      msg = res.msg;
    }
    // @ts-expect-error: no sms
    toast(t(msg), {
      toastId: 'rtmp-status',
      type: 'info',
    });

    dispatch(updateShowRtmpModal(false));
  };

  const renderStartBroadcast = () => {
    return (
      <>
        <Transition appear show={!isActiveRtmpBroadcasting} as={Fragment}>
          <Dialog
            as='div'
            className='RtmpModal fixed inset-0 z-[9999] overflow-y-auto'
            onClose={() => false}
          >
            <div className='min-h-screen px-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <Dialog.Overlay className='fixed inset-0 bg-black opacity-30' />
              </Transition.Child>

              <span
                className='inline-block h-screen align-middle'
                aria-hidden='true'
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <div className='my-8 inline-block w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-darkPrimary'>
                  <button
                    className='close-btn absolute top-8 size-[25px] outline-none ltr:right-6 rtl:left-6'
                    type='button'
                    onClick={() => closeStartModal()}
                  >
                    <span className='absolute left-0 top-0 inline-block h-[1px] w-[20px] rotate-45 bg-primaryColor dark:bg-darkText' />
                    <span className='absolute left-0 top-0 inline-block h-[1px] w-[20px] -rotate-45 bg-primaryColor dark:bg-darkText' />
                  </button>

                  <Dialog.Title
                    as='h3'
                    className='mb-2 text-lg font-medium leading-6 text-gray-900 dark:text-white ltr:text-left rtl:text-right'
                  >
                    {t('footer.modal.rtmp-title')}
                  </Dialog.Title>
                  <hr />
                  <div className='mt-6'>
                    <form
                      action='#'
                      method='POST'
                      onSubmit={(e) => startBroadcasting(e)}
                    >
                      <div className='s'>
                        <div className='grid grid-cols-6 gap-6'>
                          <div className='col-span-6 sm:col-span-4'>
                            <label
                              htmlFor='provider'
                              className='block text-sm font-medium text-gray-700 dark:text-darkText'
                            >
                              {t('footer.modal.rtmp-select-provider')}
                            </label>
                            <select
                              id='provider'
                              name='provider'
                              className='mt-1 block w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-darkText dark:text-darkText sm:text-sm'
                              onChange={(e) =>
                                setProvider(
                                  e.currentTarget.value as ProviderKeys
                                )
                              }
                              value={provider}
                            >
                              <option value='youtube'>YouTube</option>
                              <option value='facebook'>Facebook</option>
                              <option value='other'>Other</option>
                            </select>
                          </div>
                          {showServerUrl ? (
                            <div className='col-span-6 sm:col-span-4'>
                              <label
                                htmlFor='stream-url'
                                className='block text-sm font-medium text-gray-700 dark:text-darkText'
                              >
                                {t('footer.modal.rtmp-server-url')}
                              </label>
                              <input
                                type='text'
                                name='stream-url'
                                id='stream-url'
                                value={serverUrl}
                                onChange={(e) =>
                                  setServerUrl(e.currentTarget.value)
                                }
                                className='mt-1 block h-10 w-full rounded-md border border-solid  border-gray-300 bg-transparent shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-darkText dark:text-darkText sm:text-sm'
                              />
                            </div>
                          ) : null}
                          <div className='col-span-6 sm:col-span-4'>
                            <label
                              htmlFor='stream-key'
                              className='block text-sm font-medium text-gray-700 dark:text-darkText'
                            >
                              {t('footer.modal.rtmp-stream-key')}
                            </label>
                            <input
                              type='text'
                              name='stream-key'
                              id='stream-key'
                              value={serverKey}
                              onChange={(e) =>
                                setServerKey(e.currentTarget.value)
                              }
                              className='mt-1 block h-10 w-full rounded-md border border-solid  border-gray-300 bg-transparent shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-darkText dark:text-darkText sm:text-sm'
                            />
                          </div>
                        </div>
                      </div>
                      <div className='mt-4 bg-gray-50 py-3 text-right dark:bg-transparent'>
                        <button
                          type='submit'
                          className='inline-flex justify-center rounded-md border border-transparent bg-primaryColor px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondaryColor focus:bg-secondaryColor focus:outline-none focus:ring-2 focus:ring-offset-2'
                        >
                          {t('footer.modal.rtmp-start-broadcast')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </>
    );
  };

  const onCloseAlertModal = async (status = false) => {
    dispatch(updateShowRtmpModal(false));
    if (!status) {
      return;
    }

    const body = new RecordingReq({
      task: RecordingTasks.STOP_RTMP,
      sid: store.getState().session.currentRoom.sid,
    });

    const r = await sendAPIRequest(
      'rtmp',
      body.toBinary(),
      false,
      'application/protobuf',
      'arraybuffer'
    );
    const res = CommonResponse.fromBinary(new Uint8Array(r));
    let msg = t('footer.notice.rtmp-ending');

    if (!res.status) {
      msg = res.msg;
    }
    // @ts-expect-error: no sms
    toast(t(msg), {
      toastId: 'rtmp-status',
      type: 'info',
    });
  };

  const alertModal = () => {
    return (
      <>
        <Transition appear show={isActiveRtmpBroadcasting} as={Fragment}>
          <Dialog
            as='div'
            className='fixed inset-0 z-[9999] overflow-y-auto'
            onClose={onCloseAlertModal}
          >
            <div className='min-h-screen px-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <Dialog.Overlay className='fixed inset-0 bg-black opacity-30' />
              </Transition.Child>

              <span
                className='inline-block h-screen align-middle'
                aria-hidden='true'
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <div className='my-8 inline-block w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <button
                    className='close-btn absolute right-6 top-8 size-[25px] outline-none'
                    type='button'
                    onClick={() => onCloseAlertModal()}
                  >
                    <span className='absolute left-0 top-0 inline-block h-[1px] w-[20px] rotate-45 bg-primaryColor' />
                    <span className='absolute left-0 top-0 inline-block h-[1px] w-[20px] -rotate-45 bg-primaryColor' />
                  </button>

                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'
                  >
                    {t('footer.modal.rtmp-close-confirm')}
                  </Dialog.Title>
                  <div className='mt-2'>
                    <p className='text-sm text-gray-500'>
                      {t('footer.modal.rtmp-close-msg')}
                    </p>
                  </div>

                  <div className='mt-4'>
                    <button
                      className='mr-4 inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                      onClick={() => onCloseAlertModal(true)}
                    >
                      {t('ok')}
                    </button>
                    <button
                      type='button'
                      className='inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                      onClick={() => onCloseAlertModal(false)}
                    >
                      {t('close')}
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </>
    );
  };

  return (
    <>{!isActiveRtmpBroadcasting ? renderStartBroadcast() : alertModal()}</>
  );
};

export default RtmpModal;
