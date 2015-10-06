import {assert} from 'chai'
import {queryResultNester, nestedQueryResultLabelizer} from '../../lib/queryResultNester'

//const util = require('util')

describe('queryResultNester', () => {

  it('groups data according to displayNesting down to categories and series', () => {

    const nested = queryResultNester([
      {aar: '2014', tabellvariabel: '29', enhet: 'personer', kjonn: '0', innvkat5: 'alle', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '29', enhet: 'personer', kjonn: '1', innvkat5: 'alle', fylkeNr: '01'},
    ], ['aar', 'innvkat5', 'kjonn'])

    //console.log(util.inspect(nested, {showHidden: false, depth: null}))

    assert.equal(nested[0].key, '2014')
    assert.equal(nested[0].values[0].key, 'alle')
    assert.equal(nested[0].values[0].values[0].key, '0')

    assert.equal(nested[0].values[0].values[1].key, '1')
  })

  it('saves a property maxValue with the biggest value from leaf nodes', () => {
    let nested = queryResultNester([
      {aar: '2014', tabellvariabel: '119', enhet: 'personer', kjonn: '0', innvkat5: 'alle', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '29', enhet: 'personer', kjonn: '1', innvkat5: 'alle', fylkeNr: '01'},
    ], ['aar', 'innvkat5', 'kjonn'])

    assert.equal(nested.maxValue, 119)

    nested = queryResultNester([
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '0', innvkat5: 'alle', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '1', innvkat5: 'alle', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '0', innvkat5: 'ingen', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '1', innvkat5: 'ingen', fylkeNr: '01'},
    ], ['aar', 'innvkat5'])

    assert.equal(nested.maxValue, 200)

    nested = queryResultNester([
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '0', innvkat5: 'alle', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '1', innvkat5: 'alle', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '0', innvkat5: 'ingen', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '1', innvkat5: 'ingen', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '500', enhet: 'personer', kjonn: '0', innvkat5: 'ingen', fylkeNr: '02'},
      {aar: '2014', tabellvariabel: '500', enhet: 'personer', kjonn: '1', innvkat5: 'ingen', fylkeNr: '02'},
    ], ['aar', 'fylkeNr'])

    assert.equal(nested.maxValue, 1000)

    nested = queryResultNester([
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '0', innvkat5: 'alle', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '1', innvkat5: 'alle', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '0', innvkat5: 'ingen', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '1', innvkat5: 'ingen', fylkeNr: '01'},
      {aar: '2014', tabellvariabel: '500', enhet: 'personer', kjonn: '0', innvkat5: 'ingen', fylkeNr: '02'},
      {aar: '2014', tabellvariabel: '500', enhet: 'personer', kjonn: '1', innvkat5: 'ingen', fylkeNr: '02'},
    ], ['aar', 'innvkat5'])

    assert.equal(nested.maxValue, 50 + 50 + 500 + 500)
  })
})

// TODO: Test dimensionLabelTitle function directly also?
// This is kind of an integration test at this point, since
// nestedQueryResultLabelizer calls that function for the label titles
describe('nestedQueryResultLabelizer', () => {
  it('recursively adds title properties to nodes', () => {
    const labelized = nestedQueryResultLabelizer([
      {key: '2014', values: [{key: 'norskfodte_m_innvf', values: [{key: '0', values: 18}]}]}
    ], ['aar', 'innvkat5', 'kjonn'])

    assert.equal(labelized[0].title, '2014')
    assert.equal(labelized[0].values[0].title, 'Norskfødte med innvandrerforeldre')
    assert.equal(labelized[0].values[0].values[0].title, 'Kvinne')
  })

  it('knows about cities', () => {
    const nested = queryResultNester([{kommuneNr: '1505'}], ['kommuneNr'])
    const labelized = nestedQueryResultLabelizer(nested, ['kommuneNr'])
    assert.equal(labelized[0].title, 'Kristiansund')
  })

  it('knows about state names', () => {
    const nested = queryResultNester([{fylkeNr: '03'}], ['fylkeNr'])
    const labelized = nestedQueryResultLabelizer(nested, ['fylkeNr'])
    assert.equal(labelized[0].title, 'Oslo')
  })

  it('knows about boroughs', () => {
    const nested = queryResultNester([
      {bydelNr: '030102'}
    ], ['bydelNr'])

    const labelized = nestedQueryResultLabelizer(
      nested
    , ['bydelNr'])

    assert.equal(labelized[0].title, 'Grünerløkka')
  })

  it('it labels business areas', () => {
    const nested = queryResultNester([
      {naringsregionNr: '03'}
    ], ['naringsregionNr'])

    const labelized = nestedQueryResultLabelizer(
      nested
    , ['naringsregionNr'])

    assert.equal(labelized[0].title, 'Mosseregionen')
  })
})
