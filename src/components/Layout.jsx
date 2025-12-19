import React from 'react';
import { Outlet } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

const Layout = () => {
  return (
    <>
      {/* Non-intrusive language toggle */}
      <div style={{ position: 'fixed', top: 10, right: 12, zIndex: 9999, background: 'rgba(255,255,255,0.6)', borderRadius: 12, padding: '6px 10px', backdropFilter: 'blur(6px)' }}>
        <LanguageSwitcher />
      </div>
      <Outlet />
    </>
  );
};

export default Layout;