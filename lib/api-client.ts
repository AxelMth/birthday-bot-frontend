import { initClient } from "@ts-rest/core";
import {
  peopleContract,
  contractMethodsContract,
  communicationContract,
  birthdayContract,
  groupContract,
  connectorContract,
} from "birthday-bot-contracts";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const createHeaders = () => {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  }

  return headers;
};

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

export const groupClient = initClient(groupContract, clientConfig);

export const connectorClient = initClient(connectorContract, clientConfig);
