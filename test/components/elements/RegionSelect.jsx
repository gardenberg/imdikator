import {assert} from 'chai'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import {findInTree, someInTree, forEach} from '../_react-utils/iterators'
import {assertInRenderTree, assertNotInRenderTree} from '../_react-utils/assert'
import RegionSelect from '../../../components/elements/RegionSelect'
import Lightbox from '../../../components/elements/Lightbox'
import ToggleButtonList from '../../../components/elements/ToggleButtonList'

describe('RegionSelect', () => {

  const renderer = TestUtils.createRenderer()

  it('renders without any props', () => {
    const element = (
      <RegionSelect/>
    )
    renderer.render(element)

    const renderTree = renderer.getRenderOutput()
    assert(renderTree)
  })

  it('renders a lightbox as its root element', () => {
    const element = (
      <RegionSelect/>
    )
    renderer.render(element)

    const renderTree = renderer.getRenderOutput()
    assert.equal(renderTree.type, Lightbox)
  })

  it('passes similar regions to a ToggleButtonList', () => {
    const oslo = {
      code: '0301', type: 'municipality', name: 'Oslo'
    }
    const element = (
      <RegionSelect similar={[oslo]}/>
    )

    renderer.render(element)

    const renderTree = renderer.getRenderOutput()
    const hasToggleButtonListWithOslo = renderTree::someInTree(el => {
      return el && el.type === ToggleButtonList && el.props.options.includes(oslo)
    })
    assert(hasToggleButtonListWithOslo, `Expected a toggle button list with Oslo in it`)
  })
})
