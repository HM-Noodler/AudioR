import { useState, useEffect, useCallback } from 'react';
import Vapi from '@vapi-ai/web';

export interface VapiConfig {
  apiKey: string;
  assistantId: string;
  serverUrl?: string;
}

export interface VapiState {
  isConnected: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  volume: number;
  error: string | null;
  transcript: string;
}

export const useVapi = (config: VapiConfig) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [state, setState] = useState<VapiState>({
    isConnected: false,
    isRecording: false,
    isSpeaking: false,
    volume: 0,
    error: null,
    transcript: '',
  });

  // Initialize Vapi client
  useEffect(() => {
    if (!config.apiKey) {
      setState(prev => ({ ...prev, error: 'Vapi API key is required' }));
      return;
    }

    try {
      const vapiInstance = new Vapi(config.apiKey);
      setVapi(vapiInstance);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to initialize Vapi: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    }
  }, [config.apiKey]);

  // Set up event listeners
  useEffect(() => {
    if (!vapi) return;

    const handleCallStart = () => {
      setState(prev => ({ 
        ...prev, 
        isConnected: true, 
        error: null 
      }));
    };

    const handleCallEnd = () => {
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isRecording: false,
        isSpeaking: false,
        volume: 0
      }));
    };

    const handleSpeechStart = () => {
      setState(prev => ({ ...prev, isRecording: true }));
    };

    const handleSpeechEnd = () => {
      setState(prev => ({ ...prev, isRecording: false }));
    };

    const handleVolumeLevel = (volume: number) => {
      setState(prev => ({ ...prev, volume }));
    };

    const handleMessage = (message: any) => {
      if (message.type === 'transcript' && message.transcript) {
        setState(prev => ({ ...prev, transcript: message.transcript }));
      }
      
      if (message.type === 'function-call') {
        console.log('Function call:', message);
      }
    };

    const handleError = (error: any) => {
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'An error occurred',
        isConnected: false,
        isRecording: false,
        isSpeaking: false
      }));
    };

    // Add event listeners
    vapi.on('call-start', handleCallStart);
    vapi.on('call-end', handleCallEnd);
    vapi.on('speech-start', handleSpeechStart);
    vapi.on('speech-end', handleSpeechEnd);
    vapi.on('volume-level', handleVolumeLevel);
    vapi.on('message', handleMessage);
    vapi.on('error', handleError);

    // Cleanup
    return () => {
      vapi.off('call-start', handleCallStart);
      vapi.off('call-end', handleCallEnd);
      vapi.off('speech-start', handleSpeechStart);
      vapi.off('speech-end', handleSpeechEnd);
      vapi.off('volume-level', handleVolumeLevel);
      vapi.off('message', handleMessage);
      vapi.off('error', handleError);
    };
  }, [vapi]);

  // Connect to Vapi
  const connect = useCallback(async () => {
    if (!vapi || !config.assistantId) {
      setState(prev => ({ 
        ...prev, 
        error: 'Vapi client or assistant ID not available' 
      }));
      return;
    }

    try {
      await vapi.start(config.assistantId);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    }
  }, [vapi, config.assistantId]);

  // Disconnect from Vapi
  const disconnect = useCallback(async () => {
    if (!vapi) return;

    try {
      await vapi.stop();
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }, [vapi]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (!vapi) return;

    try {
      await vapi.setMuted(!state.isRecording);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  }, [vapi, state.isRecording]);

  // Send message
  const sendMessage = useCallback(async (message: string) => {
    if (!vapi) return;

    try {
      await vapi.send({
        type: 'add-message',
        message: {
          role: 'user',
          content: message,
        },
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [vapi]);

  return {
    ...state,
    connect,
    disconnect,
    toggleMute,
    sendMessage,
    isInitialized: !!vapi,
  };
}; 