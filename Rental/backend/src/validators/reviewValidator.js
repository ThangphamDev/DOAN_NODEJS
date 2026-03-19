const MAX_CONTENT_LENGTH = 2000;

const validateCreateReview = (req) => {
  const { rating, content } = req.body || {};

  if (!rating) {
    return { error: { message: "Vui lòng chọn số sao đánh giá" } };
  }

  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return { error: { message: "Đánh giá phải từ 1 đến 5 sao" } };
  }

  if (content && String(content).length > MAX_CONTENT_LENGTH) {
    return { error: { message: `Nội dung đánh giá không được vượt quá ${MAX_CONTENT_LENGTH} ký tự` } };
  }

  return { error: null };
};

const validateReplyReview = (req) => {
  const { content } = req.body || {};

  if (!content || String(content).trim().length < 1) {
    return { error: { message: "Vui lòng nhập nội dung phản hồi" } };
  }

  if (String(content).length > MAX_CONTENT_LENGTH) {
    return { error: { message: `Nội dung phản hồi không được vượt quá ${MAX_CONTENT_LENGTH} ký tự` } };
  }

  return { error: null };
};

module.exports = {
  validateCreateReview,
  validateReplyReview,
};
