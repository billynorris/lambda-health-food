import fs from 'fs';
import path from 'path';

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { SinonStub } from 'sinon';
import { ImportMock } from 'ts-mock-imports';
import axios from 'axios';
import MyFitnessPalDataExporter from '../../../src/lib/my-fitness-pal';

chai.use(chaiAsPromised);
describe('index tests', () => {
  let axiosGetStub: SinonStub<any>;

  let axiosGetResponseResult: string;

  let sut: MyFitnessPalDataExporter;

  beforeEach(() => {
    const mockAxiosClient = ImportMock.mockFunction(axios, 'create');

    axiosGetStub = ImportMock.mockFunction(axios, 'get');

    mockAxiosClient.returns({
      get: axiosGetStub,
    });

    axiosGetStub.callsFake(() => ({
      data: axiosGetResponseResult,
    }));

    sut = new MyFitnessPalDataExporter();
  });

  afterEach(() => {
    axiosGetStub.restore();
  });

  ['BillyNorris996_20201105_20201106']
    .forEach((testCase) => {
      it(`Successfully parses test case ${testCase}`, async () => {
        // Arrange
        axiosGetResponseResult = fs.readFileSync(
          path.resolve(__dirname, `../../assets/${testCase}.html`),
          'utf8',
        );

        // Act
        const result = await sut.getDataAsync('username', 'from', 'to');

        // Assert
        const resultData = JSON.parse(fs.readFileSync(
          path.resolve(__dirname, `../../assets/${testCase}.json`),
          'utf8',
        ));

        expect(result).eql(resultData);
      });
    });
});
