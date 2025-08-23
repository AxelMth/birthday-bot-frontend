import { initClient } from '@ts-rest/core';
import { peopleContract } from 'birthday-bot-contracts';

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL!;
export const apiClient = initClient(peopleContract, {
  baseUrl,
  jsonQuery: true,
  validateResponse: true,
  baseHeaders: {
    'Content-Type': 'application/json',
    'Allow-Control-Allow-Origin': '*',
  },
});
