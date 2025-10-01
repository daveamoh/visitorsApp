import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';

type SnackbarContextType = {
  showSnackbar: (message: string, type?: 'success' | 'error' | 'info') => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');

  const showSnackbar = (msg: string, msgType: 'success' | 'error' | 'info' = 'info') => {
    setMessage(msg);
    setType(msgType);
    setVisible(true);
  };

  const onDismissSnackBar = () => setVisible(false);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        duration={3000}
        style={{
          backgroundColor: 
            type === 'error' ? '#f44336' : 
            type === 'success' ? '#4caf50' : '#2196f3'
        }}
        action={{
          label: 'OK',
          onPress: onDismissSnackBar,
        }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
