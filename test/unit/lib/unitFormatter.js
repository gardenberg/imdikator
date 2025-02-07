import {assert} from 'chai'
import {unitFormatter} from '../../../lib/unitFormatter'

describe('unitFormatter', () => {
  it('returns an object with format and axisFormat functions', () => {
    const formatters = unitFormatter()
    assert.property(formatters, 'format')
    assert.typeOf(formatters.format, 'function')
    assert.property(formatters, 'axisFormat')
    assert.typeOf(formatters.axisFormat, 'function')
  })

  it('formats money with toLocaleString() with spaces replaced with nbsp', () => {
    const formatters = unitFormatter('kroner')

    // '1999 kr'
    const expected = '1\u00A0999\u00A0kr'
    assert.equal(formatters.format(1999), expected)
    assert.equal(formatters.axisFormat(1999), expected)
  })

  it('shortens billions to mrd', () => {
    const formatters = unitFormatter('kroner')
    assert.equal(formatters.format(9223716271), '9,2\u00A0mrd\u00A0kr')
    assert.equal(formatters.format(1000000000), '1\u00A0mrd\u00A0kr')
  })

  it('shortens millions to mill', () => {
    const formatters = unitFormatter('kroner')
    assert.equal(formatters.format(9283716), '9,3\u00A0mill\u00A0kr')
    assert.equal(formatters.format(1000000), '1\u00A0mill\u00A0kr')
  })

  it('formats per mil with ‰ character and 2 decimals', () => {
    const formatters = unitFormatter('promille')
    assert.equal(formatters.format(1.9), '1,9\u00A0‰')
    assert.equal(formatters.format(19), '19\u00A0‰')
    // Rounds
    assert.equal(formatters.format(0.7552312), '0,8\u00A0‰')

    assert.equal(formatters.axisFormat(1.9), '1,9\u00A0‰')
    assert.equal(formatters.axisFormat(19), '19\u00A0‰')
    // Rounds
    assert.equal(formatters.axisFormat(0.7212312), '0,7\u00A0‰')
  })

  it('formats per cent using 2 decimals and adding % character', () => {
    const formatters = unitFormatter('prosent')
    assert.equal(formatters.format(190), '190\u00A0%')
    assert.equal(formatters.format(29), '29\u00A0%')
    assert.equal(formatters.format(29.29), '29,3\u00A0%')
    assert.equal(formatters.format(0.9), '0,9\u00A0%')
  })

  it('formats per cent on axis with no decimals', () => {
    const formatters = unitFormatter('prosent')
    assert.equal(formatters.axisFormat(19), '19\u00A0%')
    assert.equal(formatters.axisFormat(0.29), '0\u00A0%')
  })

  it('formats unknown units like this', () => {
    const formatters = unitFormatter('something')
    assert.equal(formatters.format(1.9), '1,9')
    assert.equal(formatters.format(19), '19')
    assert.equal(formatters.format(1.292929), '1,3')
    assert.equal(formatters.format(292929), '292\u00A0929')

    assert.equal(formatters.axisFormat(1.9), '1,9')
    assert.equal(formatters.axisFormat(19), '19')
    assert.equal(formatters.axisFormat(1.292929), '1,3')
    assert.equal(formatters.axisFormat(292929), '292\u00A0929')
  })
})
