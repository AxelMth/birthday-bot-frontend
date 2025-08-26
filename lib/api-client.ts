import { initClient } from "@ts-rest/core";
import {
  peopleContract,
  contractMethodsContract,
  communicationContract,
  birthdayContract,
} from "birthday-bot-contracts";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;

// Helper function to get API key from localStorage
const getApiKey = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("apiKey");
};

// Helper function to create headers with API key
const createHeaders = () => {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {};

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  return headers;
};

// Common client configuration with API key headers
const clientConfig = {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
  headers: createHeaders,
};

export const peopleClient = initClient(peopleContract, clientConfig);

export const contactMethodsClient = initClient(
  contractMethodsContract,
  clientConfig,
);

export const communicationClient = initClient(
  communicationContract,
  clientConfig,
);

export const birthdayClient = initClient(birthdayContract, clientConfig);
