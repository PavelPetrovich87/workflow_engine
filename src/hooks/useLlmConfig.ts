import { useState, useEffect } from 'react';

// TODO: Move types to core/def/llm.ts ideally, but defined here for now for T002
export interface LlmGlobalConfig {
  apiKey: string;
  model: string;
}

const STORAGE_KEY = 'workflow_engine_llm_config';

const DEFAULT_CONFIG: LlmGlobalConfig = {
  apiKey: '',
  model: 'gemini-1.5-flash',
};

const EVENT_KEY = 'llm-config-updated';

export function useLlmConfig() {
  const [config, setConfig] = useState<LlmGlobalConfig>(DEFAULT_CONFIG);

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load LLM config:', e);
    }
  };

  // Load on mount and listen for updates
  useEffect(() => {
    loadFromStorage();

    const handleUpdate = () => loadFromStorage();
    
    window.addEventListener(EVENT_KEY, handleUpdate);
    window.addEventListener('storage', handleUpdate); // Sync across tabs
    
    return () => {
      window.removeEventListener(EVENT_KEY, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const saveConfig = (newConfig: Partial<LlmGlobalConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Notify other hook instances
    window.dispatchEvent(new Event(EVENT_KEY));
  };

  return {
    config,
    saveConfig,
    isConfigured: !!config.apiKey
  };
}
