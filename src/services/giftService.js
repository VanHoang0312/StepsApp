import { get } from "../utils/request";

export const getAllgift = async () => {
    const result = await get(`gift/layall`);
    return result;
};

export const getGiftbyId = async (_id) => {
    const result = await get(`gift/user/${_id}`);
    return result;
};