import { ApiRequest, ApiResponse } from '../types/chatDialog.types';

export class ApiService {
  private apiUrl = '/api/process';
  private apiKey = 'a7f41912-6157-43f4-af6c-14b9d40ff9c4'; 

  async sendRequest(request: ApiRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: JSON.stringify(request),
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
        console.error('API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  }
}

export const apiService = new ApiService();