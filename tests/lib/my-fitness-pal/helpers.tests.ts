import { expect } from 'chai';
import { getUnitMapping, sanitize } from '../../../src/lib/my-fitness-pal/helpers';

describe('helper tests', () => {
  it('When unit mapping is invalid, exception is thrown', async () => {
    // Arrange
    const invalidMappingValue = 'INVALID_MAPPING';

    // Act
    // Assert
    expect(() => getUnitMapping(invalidMappingValue)).to.throw(Error, `missing mapping for value: '${invalidMappingValue}'`);
  });

  it('When unit mapping is invalid, returns default value if provided', async () => {
    // Arrange
    const invalidMappingValue = 'INVALID_MAPPING';

    // Act
    const result = getUnitMapping(invalidMappingValue, 'foo');

    // Assert
    expect(result).eql('foo');
  });

  it('When number is invalid, sanitize returns 0', async () => {
    // Arrange
    const invalidValue = 'foo';

    // Act
    const result = sanitize(invalidValue);

    // Assert
    expect(result).eql(0);
  });
});
