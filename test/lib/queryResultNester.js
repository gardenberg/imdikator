import {assert} from 'chai'
import {queryResultNester, nestedQueryResultLabelizer} from '../../lib/queryResultNester'

//const util = require('util')

describe('queryResultNester', () => {

  it('groups data according to displayNesting down to categories and series', () => {

    const nested = queryResultNester([
      {aar: '2014', tabellvariabel: '29', enhet: 'personer', kjonn: '0', innvkat5: 'alle', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '29', enhet: 'personer', kjonn: '1', innvkat5: 'alle', fylkeId: '01'},
    ], ['aar', 'innvkat5', 'kjonn'])

    //console.log(util.inspect(nested, {showHidden: false, depth: null}))

    assert.equal(nested[0].key, '2014')
    assert.equal(nested[0].values[0].key, 'alle')
    assert.equal(nested[0].values[0].values[0].key, '0')

    assert.equal(nested[0].values[0].values[1].key, '1')
  })

  it('saves a property maxValue with the biggest value from leaf nodes', () => {
    let nested = queryResultNester([
      {aar: '2014', tabellvariabel: '119', enhet: 'personer', kjonn: '0', innvkat5: 'alle', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '29', enhet: 'personer', kjonn: '1', innvkat5: 'alle', fylkeId: '01'},
    ], ['aar', 'innvkat5', 'kjonn'])

    assert.equal(nested.maxValue, 119)

    nested = queryResultNester([
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '0', innvkat5: 'alle', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '1', innvkat5: 'alle', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '0', innvkat5: 'ingen', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '1', innvkat5: 'ingen', fylkeId: '01'},
    ], ['aar', 'innvkat5'])

    assert.equal(nested.maxValue, 200)

    nested = queryResultNester([
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '0', innvkat5: 'alle', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '1', innvkat5: 'alle', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '0', innvkat5: 'ingen', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '1', innvkat5: 'ingen', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '500', enhet: 'personer', kjonn: '0', innvkat5: 'ingen', fylkeId: '02'},
      {aar: '2014', tabellvariabel: '500', enhet: 'personer', kjonn: '1', innvkat5: 'ingen', fylkeId: '02'},
    ], ['aar', 'fylkeId'])

    assert.equal(nested.maxValue, 1000)

    nested = queryResultNester([
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '0', innvkat5: 'alle', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '100', enhet: 'personer', kjonn: '1', innvkat5: 'alle', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '0', innvkat5: 'ingen', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '50', enhet: 'personer', kjonn: '1', innvkat5: 'ingen', fylkeId: '01'},
      {aar: '2014', tabellvariabel: '500', enhet: 'personer', kjonn: '0', innvkat5: 'ingen', fylkeId: '02'},
      {aar: '2014', tabellvariabel: '500', enhet: 'personer', kjonn: '1', innvkat5: 'ingen', fylkeId: '02'},
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

  it('knows about state names', () => {
    const nested = queryResultNester([
      {tilskuddTilKommuner: 'barnehage_tilsk', fylkeId: '03'}
    ], ['fylkeId', 'tilskuddTilKommuner'])

    const labelized = nestedQueryResultLabelizer(
      nested
    , ['fylkeId', 'tilskuddTilKommuner'])

    assert.equal(labelized[0].title, 'Oslo')
  })
})
