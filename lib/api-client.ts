import { initClient } from "@ts-rest/core";
import {
  peopleContract,
  contractMethodsContract,
  communicationContract,
} from "birthday-bot-contracts";

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;
export const peopleClient = initClient(peopleContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
});

export const contactMethodsClient = initClient(contractMethodsContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
});

export const communicationClient = initClient(communicationContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
});
