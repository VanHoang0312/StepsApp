const API_DOMAIN = "http://10.10.20.25:3002/api/";
//10.10.20.64 thinklab
export const getCurrent = async (path, token) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Thêm token vào header Authorization
    },
  });
  const result = await response.json();
  return result;
};


export const get = async (path) => {
  const response = await fetch(API_DOMAIN + path);
  const result = await response.json();
  return result;
};

export const post = async (path, option) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(option), // chuyển sang dạng json
  });
  const result = await response.json();
  return result;
};

export const del = async (path) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "DELETE",
  });
  const result = await response.json();
  return result;
}
export const patch = async (path, option) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(option), // chuyển sang dạng json
  });
  const result = await response.json();
  return result;
}