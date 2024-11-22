'use client';

import { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';

import { useToastStore } from '@/store';

const Toast = () => {
  const [show, setShow] = useState(false);
  const [showTimerId, setShowTimerId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [animate, setAnimate] = useState(false);
  const [animateTimerId, setAnimateTimerId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const toastId = useToastStore((state) => state.toastId);

  const unmouted = () => {
    const sid: ReturnType<typeof setTimeout> = setTimeout(() => {
      setAnimate(false);

      const aid: ReturnType<typeof setTimeout> = setTimeout(() => {
        setShow(false);
      }, 200);
      setAnimateTimerId(aid);
    }, 4000);

    setShowTimerId(sid);
  };

  useEffect(() => {
    if (!toastId) return;

    setShow(true);
    setAnimate(true);
    setTitle(useToastStore.getState().title);
    setContent(useToastStore.getState().content);

    unmouted();
  }, [toastId]);

  useEffect(() => {
    return () => {
      if (showTimerId) clearTimeout(showTimerId);
      if (animateTimerId) clearTimeout(animateTimerId);
    };
  }, [showTimerId, animateTimerId]);

  if (!show) return null;

  return (
    <div
      className={`fixed left-[50%] top-0 z-50 w-[80%] transform space-y-1 rounded bg-failed px-4 py-3 shadow-lg hover:shadow-xl md:w-96 ${animate ? 'animate-toast-slide-down' : 'animate-toast-slide-up'}`}
      onMouseEnter={() => {
        if (showTimerId) clearTimeout(showTimerId);
        if (animateTimerId) clearTimeout(animateTimerId);
      }}
      onMouseLeave={unmouted}
    >
      <div className="flex items-center justify-between">
        <p className="text-background">{title}</p>
        <button
          className="rounded-full border border-transparent p-0.5 text-background hover:border-button-hover"
          onClick={() => {
            if (showTimerId) clearTimeout(showTimerId);
            if (animateTimerId) clearTimeout(animateTimerId);

            setAnimate(false);
            const aid: ReturnType<typeof setTimeout> = setTimeout(() => {
              setShow(false);
            }, 200);
            setAnimateTimerId(aid);
          }}
        >
          <IoMdClose />
        </button>
      </div>
      <p className="text-sm text-background opacity-85">{content}</p>
    </div>
  );
};

export default Toast;
