import { initClient } from "@ts-rest/core";
import {
  peopleContract,
  contractMethodsContract,
} from "birthday-bot-contracts";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;
export const peopleClient = initClient(peopleContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
  baseHeaders: {
    "Content-Type": "application/json",
    "Allow-Control-Allow-Origin": "*",
  },
});

export const contactMethodsClient = initClient(contractMethodsContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
  baseHeaders: {
    "Content-Type": "application/json",
    "Allow-Control-Allow-Origin": "*",
  },
});
