export const API_PREFIX = "/api/v1";

export const API_ROUTES = {
  AUTH: "/auth",
  BLOG: "/blog",
  CATEGORY: "/categories",
  COMMENT: "/comments",
  USER: "/users",
  ADMIN: "/admin",

};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const HTTP_MESSAGES = {
  SUCCESS: "Success",
  SERVER_ERROR: "Internal Server Error",
  NOT_FOUND: "Resource not found",
  VALIDATION_FAILED: "Validation failed",
  UNAUTHORIZED: "Unauthorized access",
};

export const APP_CONSTANTS = {
  APP_NAME: "BlogApp API",
  APP_VERSION: "1.0.0",
  CREATED_BY: "ADITYA KBR",
};
