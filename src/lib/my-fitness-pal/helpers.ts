import fs from 'fs';
import path from 'path';

import log from '@dazn/lambda-powertools-logger';

export const formatDate = (value: Date) => value.toISOString().split('T')[0];

export const convertToNum = (value: string) => parseInt(value.split(',').join(''), 10);

export const getUnitMapping = (value: string, defaultValue?: string): string => {
  const mappingData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../assets/unit_mappings.json'), 'utf8')) as { [key: string]: Array<string> };

  const mapping = Object.keys(mappingData)
    .find((y) => mappingData[y].find((z) => z.toUpperCase() === value.toUpperCase()));

  if (!mapping) {
    log.error('Missing mapping', {
      value,
    });

    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`missing mapping for value: '${value}'`);
  }

  return mapping;
};

export const sanitize = (value: string): number => {
  if (value.includes('-')) {
    return 0;
  }

  const num = parseFloat(value.replace(/\D/g, ''));

  if (Number.isNaN(num)) {
    log.error(`Unable to parse '${value}' value as float`);
    return 0;
  }

  return num;
};

export const calculateNameWeight = (
  value: string,
): { name: string; amount: number; units: string; } => {
  const data = value.split(',');

  const rawMeasurementValue = data[data.length - 1];

  const foodName = value.substring(0, value.indexOf(`,${rawMeasurementValue}`)).trim();

  const measurementSections = rawMeasurementValue.trim().split(' ');

  return {
    name: foodName,
    amount: parseFloat(measurementSections[0].trim()),
    units: getUnitMapping(measurementSections[1].trim(), 'portion'),
  };
};
