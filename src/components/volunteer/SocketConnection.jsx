import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { socketService } from '../../services/socket'; // Fix: Only one level up
import './SocketConnection.css';

const SocketConnection = () => {
  const { t } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const socket = socketService.connect();
    
    socket.on('connect', () => {
      setIsConnected(true);
      setLastUpdate(new Date());
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('new-incident', () => {
      setLastUpdate(new Date());
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new-incident');
    };
  }, []);

  const formatTime = (date) => {
    if (!date) return t('Never');
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return t('Just now');
    if (diff < 3600000) return `${Math.floor(diff / 60000)} ${t('min ago')}`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="socket-connection">
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
        <span>{isConnected ? t('LIVE') : t('OFFLINE')}</span>
      </div>
      {lastUpdate && isConnected && (
        <div className="last-update">
          {t('Last update:')} {formatTime(lastUpdate)}
        </div>
      )}
    </div>
  );
};

export default SocketConnection;