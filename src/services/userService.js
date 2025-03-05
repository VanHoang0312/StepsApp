import { getCurrent, post } from "../utils/request";

export const createUser = async (options) => {
    const result = await post(`user/register`, options);
    return result;
};

export const login = async (data) => {
    const result = await post(`user/login`, data);
    return result;
};

export const getCurrentData = async (token) => {
    const result = await getCurrent(`user/curendata`, token);
    return result;
};