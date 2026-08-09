import React, { createContext, useContext, useState, useEffect } from 'react';
import API, { API_BASE } from '../services/api';
import { socket, useAuth } from './AuthContext';

const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
  const { globalConfig, socket: authSocket } = useAuth();
  const [globalState, setGlobalState] = useState(globalConfig || null);

  useEffect(() => {
    if (globalConfig) {
      setGlobalState(globalConfig);
    }
  }, [globalConfig]);

  useEffect(() => {
    const activeSocket = authSocket || socket;
    if (!activeSocket) return;

    activeSocket.on('LAYOUT_DATA_UPDATED', (payload) => {
      console.log("⚡ LAYOUT_DATA_UPDATED received from Admin Panel:", payload);
      if (payload) {
        setGlobalState(prev => ({ ...prev, ...(payload.data || payload) }));
      }
    });

    activeSocket.on('GLOBAL_ADMIN_UPDATE', (newUpdatedData) => {
      console.log("⚡ Live update received from Admin Panel:", newUpdatedData);
      if (newUpdatedData) {
        setGlobalState(prev => ({ ...prev, ...(newUpdatedData.data || newUpdatedData) }));
      }
    });

    activeSocket.on('ADMIN_STATE_CHANGED', (newUpdatedData) => {
      console.log("⚡ Live update received from Main Admin:", newUpdatedData);
      if (newUpdatedData) {
        setGlobalState(prev => ({ ...prev, ...newUpdatedData }));
      }
    });

    activeSocket.on('GLOBAL_STATE_UPDATED', (payload) => {
      console.log("⚡ GLOBAL_STATE_UPDATED received:", payload);
      if (payload && payload.data) {
        setGlobalState(payload.data);
      }
    });

    return () => {
      activeSocket.off('LAYOUT_DATA_UPDATED');
      activeSocket.off('GLOBAL_ADMIN_UPDATE');
      activeSocket.off('ADMIN_STATE_CHANGED');
      activeSocket.off('GLOBAL_STATE_UPDATED');
    };
  }, [authSocket]);

  return (
    <GlobalStateContext.Provider value={{ globalState, setGlobalState }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
export default GlobalStateContext;
