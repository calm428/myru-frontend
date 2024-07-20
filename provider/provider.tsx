'use client';

import { PaxContext, User, AdditionalData } from '@/context/context';
import axios from 'axios';
import { useLocale } from 'next-intl';
import { setCookie } from 'nookies';
import React, { ReactNode, useEffect, useState, useRef, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import cookies from 'next-cookies';
import { GetServerSideProps } from 'next';

interface IProps {
  children: ReactNode;
  initialAccessToken: string | null;
}

const PLAN = {
  Начальный: 'BASIC',
  Бизнесс: 'BUSINESS',
  Расширенный: 'ADVANCED',
};  

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const Providers: React.FC<IProps> = ({ children, initialAccessToken }) => {
  const [user, setUser] = useState<User | null>(null);
  const [postMode, setPostMode] = useState<string>('all');
  const [lastCommand, setLastCommand] = useState<string>('');
  const session = useSession();
  const [additionalData, setAdditionalData] = useState<AdditionalData[]>([]);
  const [currentPlan, setCurrentPlan] = useState<string>('BASIC');
  const socketRef = useRef<WebSocket | null>(null); // Используем useRef для хранения состояния сокета
  const locale = useLocale();

  const userFetchURL = useMemo(() => `/api/users/me?language=${locale}`, [locale]);

  const { data: fetchedData, error, mutate: userMutate } = useSWR(
    session.status === 'authenticated' || initialAccessToken ? userFetchURL : null,
    fetcher
  );

  useEffect(() => {
    if (!error && fetchedData) {
      setUser({
        id: fetchedData.data?.user?.id,
        username: fetchedData.data?.user?.name,
        email: fetchedData.data?.user?.email,
        avatar: fetchedData.data?.user?.photo,
        plan: fetchedData.data?.user?.Plan,
        city: fetchedData.data?.user?.profile[0].City.map((city: string) =>
          JSON.parse(city)
        ),
        category: fetchedData.data?.user?.profile[0].guilds.map(
          (guild: string) => JSON.parse(guild)
        ),
        hashtags: fetchedData.data?.user?.profile[0].hashtags,
        role: fetchedData.data?.user?.role,
        balance: fetchedData.data?.balance,
        storage: fetchedData.data?.storage,
        limitStorage: fetchedData.data?.user?.limitstorage,
        followers: fetchedData.data?.user?.totalfollowers,
        followings: fetchedData.data?.user?.followings?.length,
        onlinehours: fetchedData.data?.user?.online_hours[0],
        totalposts: fetchedData.data?.user?.totalrestblog,
      });

      setCurrentPlan(PLAN[fetchedData.data.user.Plan as keyof typeof PLAN]);
    }
  }, [fetchedData, error]);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const _socket = new WebSocket(
      `${wsProtocol}//${process.env.NEXT_PUBLIC_SOCKET_URL}/socket.io/`
    );

    _socket.onopen = () => {
      console.log('WebSocket connected');
    };

    _socket.onmessage = (received) => {
      console.log('Socket message: ', received.data);
      try {
        const data = JSON.parse(received.data);

        if (data?.command) {
          setLastCommand(data?.command);
        }

        if (data?.command === 'newDonat' && data?.data) {
          setAdditionalData(data.data);
        }

        if (data?.session) {
          console.log('Socket message: ', data?.session);
          setCookie(null, 'session', data?.session, {
            path: '/',
          });
          axios.defaults.headers.common['session'] = data?.session;
        }
      } catch (error) {
        console.error('Ошибка при обработке сообщения сокета:', error);
      }
    };

    _socket.onclose = (event) => {
      console.log('WebSocket disconnected with code:', event.code, 'and reason:', event.reason);
      if (event.code !== 1000) { // 1000 indicates a normal closure
        console.log('Attempting to reconnect WebSocket...');
        setTimeout(connectWebSocket, 5000); // Attempt to reconnect every 5 seconds
      }
    };

    _socket.onerror = (error) => {
      console.error('WebSocket error: ', error);
    };

    socketRef.current = _socket;
  }, []);

  useEffect(() => {
    if (socketRef.current === null) {
      connectWebSocket();
    }

    return () => {
      socketRef.current?.close();
    };
  }, [connectWebSocket]);

  return (
    <PaxContext.Provider
      value={{
        user,
        setUser,
        lastCommand,
        userMutate,
        postMode,
        setPostMode,
        currentPlan,
        setCurrentPlan,
        socket: socketRef.current,
        setSocket: (socket) => {
          socketRef.current = socket;
        },
        additionalData, 
        setAdditionalData, 
      }}
    >
      {children}
    </PaxContext.Provider>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { access_token } = cookies(context);

  return {
    props: {
      initialAccessToken: access_token || null,
    },
  };
};

export default Providers;
