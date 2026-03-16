export const getApiData = (response, fallback = null) => {
  const responseData = response?.data;

  if (responseData && typeof responseData === "object" && "data" in responseData) {
    return responseData.data ?? fallback;
  }

  return responseData ?? fallback;
};

export const getApiMessage = (error, fallback = "Đã có lỗi xảy ra") => {
  return error?.response?.data?.message || error?.message || fallback;
};
