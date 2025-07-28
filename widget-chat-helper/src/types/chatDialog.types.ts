export interface ApiRequest {
    text: string;
    email: string;
    role?: 'заказчик' | 'гип' | 'инженер' | 'наблюдатель';
}
  
export interface ApiResponse {
    status: 'success' | 'error';
    data?: {
      processed_text: string;
      email: string;
      role?: 'заказчик' | 'гип' | 'инженер' | 'наблюдатель';
    };
    message: string;
}
  
export interface ApiError {
    status: number;
    message: string;
}