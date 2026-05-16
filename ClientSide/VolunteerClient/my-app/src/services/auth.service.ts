import axios from './axios';
import { type RegisterType, type LoginType } from '../types/auth.types';


export const register = async (user: RegisterType) => {
  const response = await axios.post(`/register`, user);
  const data = response.data;
  return data;
};
export const login = async (credentials: LoginType) => {
  const response = await axios.post(`/login`, credentials);
  const data = response.data;
  return data;
};


export const loginByToken = async (token: string) => {
  const response = await axios.get("/login/getUserByToken", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};