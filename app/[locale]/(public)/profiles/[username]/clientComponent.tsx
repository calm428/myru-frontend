"use client";

import React, { useEffect } from 'react';

interface ProfileDetailsProps {
  profileDetails: {
    additionalinfo: string;
  };
}

const ProfileDetailsComponent: React.FC<ProfileDetailsProps> = ({ profileDetails }) => {
  useEffect(() => {
    const iframes = document.querySelectorAll('iframe.ql-video');
    iframes.forEach((iframe) => {
      const src = iframe.getAttribute('src');
      iframe.setAttribute('src', src || '');
    });
  }, []);

  return (
    <div
      className='text-sm text-muted-foreground'
      dangerouslySetInnerHTML={{ __html: profileDetails.additionalinfo }}
    />
  );
};

export default ProfileDetailsComponent;