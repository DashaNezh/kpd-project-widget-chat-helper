import { useState, useCallback } from 'react';
import { apiService } from '../services/chatDialog.service';
import { ApiRequest, ApiResponse } from '../types/chatDialog.types';

export const useChatDialog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<ApiResponse | null>(null);

  const sendRequest = useCallback(async (request: ApiRequest) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const data = await apiService.sendRequest(request);
      setResponse(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendRequest, loading, error, response };
};