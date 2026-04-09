import axios from "axios";

const CAREER_RESOURCES_STORAGE_KEY = "careerResources";
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
const API_ENABLED = true;

const RESOURCE_ENDPOINTS = ["/api/resources", "/api/career-resources"];
const CONTENT_ENDPOINTS = ["/api/resource-contents", "/api/resources"];
const CAREER_PATH_ENDPOINTS = ["/api/career-paths", "/api/paths"];

function getApiErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;

  if (Array.isArray(responseData?.details) && responseData.details.length > 0) {
    const details = responseData.details
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        const field = String(item?.field || item?.name || "").trim();
        const message = String(item?.message || item?.defaultMessage || item?.error || "").trim();
        return field && message ? `${field}: ${message}` : message;
      })
      .filter(Boolean);

    if (details.length > 0) {
      return details.join("; ");
    }
  }

  return (
    responseData?.message ||
    responseData?.error ||
    responseData?.title ||
    error?.message ||
    fallbackMessage
  );
}

function buildApiUrl(path) {
  const normalizedPath = String(path || "");
  if (!API_BASE_URL) {
    return normalizedPath;
  }

  if (API_BASE_URL.endsWith("/") && normalizedPath.startsWith("/")) {
    return `${API_BASE_URL.slice(0, -1)}${normalizedPath}`;
  }

  if (!API_BASE_URL.endsWith("/") && !normalizedPath.startsWith("/")) {
    return `${API_BASE_URL}/${normalizedPath}`;
  }

  return `${API_BASE_URL}${normalizedPath}`;
}

async function requestFirst(method, paths, data) {
  if (!API_ENABLED) {
    throw new Error("API_DISABLED");
  }

  const requestErrors = [];

  for (const path of paths) {
    try {
      const response = await axios({
        method,
        url: buildApiUrl(path),
        data
      });
      return response?.data;
    } catch (error) {
      requestErrors.push({
        path,
        status: error?.response?.status || null,
        message: getApiErrorMessage(error, "REQUEST_FAILED")
      });
    }
  }

  const attemptedSummary = requestErrors
    .map((entry) => `${entry.path}:${entry.status ?? "ERR"}`)
    .join(", ");

  const message =
    requestErrors.find((entry) => entry.message)?.message ||
    `API request failed (${String(method || "get").toUpperCase()}). Tried: ${attemptedSummary || "none"}.`;

  const requestError = new Error(message);
  requestError.attemptedPaths = requestErrors;
  throw requestError;
}

function mapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.resources)) return payload.resources;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function normalizeResourceContent(item, index = 0) {
  const type = String(item?.type || "text").toLowerCase() === "video" ? "video" : "text";
  const contentText = item?.contentText ?? item?.text ?? item?.content ?? "";
  const videoUrl = item?.videoUrl ?? item?.url ?? item?.link ?? item?.content ?? "";

  return {
    ...item,
    id: item?.id ?? `${Date.now()}-${index}`,
    type,
    title: item?.title ?? item?.name ?? (type === "video" ? "Video content" : "Text content"),
    text: type === "text" ? String(contentText || "") : "",
    url: type === "video" ? String(videoUrl || "") : "",
    contentText: String(contentText || ""),
    videoUrl: String(videoUrl || "")
  };
}

function toContentPayload(payload) {
  const type = String(payload?.type || "text").toLowerCase() === "video" ? "video" : "text";
  const title = String(payload?.title || "").trim();
  const text = String(payload?.text ?? payload?.contentText ?? "").trim();
  const url = String(payload?.url ?? payload?.videoUrl ?? "").trim();

  return {
    type,
    title,
    text: type === "text" ? text : null,
    contentText: type === "text" ? text : null,
    content: type === "text" ? text : null,
    url: type === "video" ? url : null,
    videoUrl: type === "video" ? url : null,
    link: type === "video" ? url : null
  };
}

async function getCareerResources() {
  const data = await requestFirst("get", RESOURCE_ENDPOINTS);
  return mapList(data);
}

async function createCareerResource(title, category) {
  const data = await requestFirst("post", RESOURCE_ENDPOINTS, {
    title: String(title || "").trim(),
    category: String(category || "").trim()
  });
  return data?.data || data;
}

async function updateCareerResource(resourceId, payload) {
  const paths = RESOURCE_ENDPOINTS.map((endpoint) => `${endpoint}/${resourceId}`);
  const data = await requestFirst("put", paths, payload);
  return data?.data || data;
}

async function deleteCareerResource(resourceId) {
  const paths = RESOURCE_ENDPOINTS.map((endpoint) => `${endpoint}/${resourceId}`);
  await requestFirst("delete", paths);
  return true;
}

async function getResourceContents(resourceId) {
  const paths = [
    ...CONTENT_ENDPOINTS.map((endpoint) => `${endpoint}/${resourceId}/contents`),
    ...CONTENT_ENDPOINTS.map((endpoint) => `${endpoint}/resource/${resourceId}`)
  ];
  const data = await requestFirst("get", paths);
  return mapList(data).map((item, index) => normalizeResourceContent(item, index));
}

async function createResourceContent(resourceId, payload) {
  const paths = CONTENT_ENDPOINTS.map((endpoint) => `${endpoint}/${resourceId}/contents`);
  const data = await requestFirst("post", paths, toContentPayload(payload));
  return normalizeResourceContent(data?.data || data || payload, 0);
}

async function updateResourceContent(resourceId, contentId, payload) {
  const paths = CONTENT_ENDPOINTS.map((endpoint) => `${endpoint}/${resourceId}/contents/${contentId}`);
  const data = await requestFirst("put", paths, toContentPayload(payload));
  return normalizeResourceContent(data?.data || data || { id: contentId, ...payload }, 0);
}

async function deleteResourceContent(resourceId, contentId) {
  const paths = CONTENT_ENDPOINTS.map((endpoint) => `${endpoint}/${resourceId}/contents/${contentId}`);
  await requestFirst("delete", paths);
  return true;
}

async function getCareerPaths() {
  const data = await requestFirst("get", CAREER_PATH_ENDPOINTS);
  return mapList(data);
}

async function createCareerPath(payload) {
  const data = await requestFirst("post", CAREER_PATH_ENDPOINTS, payload);
  return data?.data || data;
}

async function updateCareerPath(pathId, payload) {
  const paths = CAREER_PATH_ENDPOINTS.map((endpoint) => `${endpoint}/${pathId}`);
  const data = await requestFirst("put", paths, payload);
  return data?.data || data;
}

async function deleteCareerPath(pathId) {
  const paths = CAREER_PATH_ENDPOINTS.map((endpoint) => `${endpoint}/${pathId}`);
  await requestFirst("delete", paths);
  return true;
}

function saveCareerResources() {
  // Deprecated: DB-only flow
  return true;
}

export {
  CAREER_RESOURCES_STORAGE_KEY,
  createCareerPath,
  createCareerResource,
  createResourceContent,
  deleteCareerPath,
  deleteCareerResource,
  deleteResourceContent,
  getCareerPaths,
  getCareerResources,
  getResourceContents,
  saveCareerResources,
  updateCareerPath,
  updateCareerResource,
  updateResourceContent
};
