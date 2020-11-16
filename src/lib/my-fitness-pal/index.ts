/* eslint-disable max-len */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import axios, { AxiosInstance } from 'axios';
import cheerio from 'cheerio';
import FoodEntryV1 from '../../models/FoodEntryV1';

import { calculateNameWeight, formatDate, sanitize } from './helpers';

export default class MyFitnessPalDataExporter {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'http://www.myfitnesspal.com/reports/printable_diary',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
      },
    });
  }

  getDataAsync = async (username: string, from: string, to: string): Promise<Array<FoodEntryV1>> => {
    const response = await this.client
      .get(`/${username}?from=${from}&to=${to}`);

    const $ = cheerio.load(response.data);

    const foodEntries: Array<FoodEntryV1> = [];

    $('.main-title-2').each((index, element) => {
      const $element = $(element);

      const date = $element.text();

      const foodTable = $element.next('#food');

      const tags = foodTable.find('tbody')[0].children.filter((y) => y.type === 'tag');

      let foodCategory = '';

      for (const tag of tags) {
        const tagChildren = tag.children.filter((y) => y.type === 'tag');

        if (tagChildren.length === 1) {
          foodCategory = tagChildren[0].children[0].data;
          // eslint-disable-next-line no-continue
          continue;
        }

        for (let i = 0; i < tagChildren.length; i += 9) {
          const foodDetails = calculateNameWeight(tagChildren[i].children[0].data);
          foodEntries.push({
            mealType: foodCategory as any,
            date: formatDate(new Date(date)),
            foodName: foodDetails.name,
            amount: foodDetails.amount,
            unit: foodDetails.units,
            nutrition: {
              calories: sanitize(tagChildren[i + 1].children[0].data),
              carbohydrates: sanitize(tagChildren[i + 2].children[0].data),
              fat: sanitize(tagChildren[i + 3].children[0].data),
              protein: sanitize(tagChildren[i + 4].children[0].data),
              cholesterol: sanitize(tagChildren[i + 5].children[0].data),
              sodium: sanitize(tagChildren[i + 6].children[0].data),
              sugars: sanitize(tagChildren[i + 7].children[0].data),
              fiber: sanitize(tagChildren[i + 8].children[0].data),
            },
          });
        }
      }
    });

    return foodEntries;
  };
}
