import d3 from 'd3'
import colorPalette from '../../data/colorPalette'

class Chart {
  constructor(el, props, state, drawPoints, margins = {left: 40, top: 40, right: 40, bottom: 40}) {

    // _svg is the actual SVG element
    this._svg = null
    // svg is a translated 'g' within _svg that all graphs draw to
    this.svg = null

    this.size = {
      width: el.offsetWidth - margins.left - margins.right,
      height: el.offsetHeight - margins.top - margins.bottom
    }

    this.props = props

    this.margins = margins

    this.colors = d3.scale.ordinal().range(colorPalette)

    this.popover = d3.select('body')
    .append('div')
    .attr('class', 'focus')
    .style('position', 'absolute')

    this._drawPoints = drawPoints
    this.update(el, state)
  }

  _drawPoints(el, data) {}

  update(el, state) {
    // We don't support redrawing on top of old graphs, so just remove any
    // previous presentation
    if (this._svg) {
      this._svg.remove()
    }

    // TODO: https://css-tricks.com/scale-svg/
    // http://stackoverflow.com/a/9539361/194404
    this._svg = d3.select(el).append('svg')
    .attr('class', 'd3')
    .attr('width', this.props.width)
    .attr('height', this.props.height)

    // Conventional margins (http://bl.ocks.org/mbostock/3019563)
    // Translating an outer 'g' so we dont have to consider margins in the rest
    // of the code
    this.svg = this._svg.append('g')
    .attr('class', 'd3-points')
    .attr('transform', this.translation(this.margins.left, this.margins.top))

    this._drawPoints(el, state.data)
  }

  destroy(el) {
    this.popover.remove()
  }

  translation(x, y) {
    return 'translate(' + x + ',' + y + ')'
  }

  legend() {
    let color = d3.scale.category20()
    const attr = {
      width: (item, idx) => 15,
      height: (item, idx) => 15,
    }
    const dispatch = d3.dispatch('legendClick', 'legendMouseover', 'legendMouseout')

    function chart(selection) {
      selection.each(function (data, idx) {
        if (data.length < 2) {
          // Dont show single legends or none
          return
        }

        const wrap = d3.select(this).selectAll('g.legend').data(data)
        let legend = null
        legend = wrap.enter()
        .append('g').attr('class', 'legend')
        .append('g')
        .on('click', function (item, index) {
          dispatch.legendClick(item, index)
        })
        .on('mouseover', function (item, index) {
          dispatch.legendMouseover(item, index)
        })
        .on('mouseout', function (item, index) {
          dispatch.legendMouseout(item, index)
        })

        legend.append('rect')
        .attr('x', (dataItem, index) => {
          return 0
        })
        .attr('y', 0)
        .attr('width', (item, i) => attr.width(item, i))
        .attr('height', (item, i) => attr.height(item, i))
        .style('fill', dataItem => color(dataItem))

        legend
        .append('text')
        .text(dataItem => dataItem)
        .attr('dy', () => attr.height())
        .attr('font-size', () => attr.height())
        .attr('x', (node, index) => attr.width() * 1.5)

        let x = 0
        let y = 0
        const parent = d3.select(wrap.node().parentNode)
        const maxWidth = parent.attr('width')

        wrap.selectAll('g').each(function () {
          const el = d3.select(this)
          el.attr('transform', 'translate(' + x + ', 0)')
          const bbox = el.node().getBBox()
          const width = bbox.width + attr.width()
          const newX = x + width
          if (newX > maxWidth) {
            x = width
            y += attr.height() + attr.height() * 0.5
          } else {
            x += width
          }
          el.attr('transform', 'translate(' + (x - width) + ', ' + y + ')')
        })
      })
      return chart
    }

    chart.dispatch = dispatch

    chart.color = function (newColor) {
      if (!arguments.length) {
        return color
      }
      color = newColor
      return chart
    }

    chart.attr = function (key, newValue) {
      if (!arguments.length) {
        return attr
      }
      if (arguments.length == 1) {
        const value = attr[key]
        if (typeof value === 'function') {
          return value()
        }
        return value
      }
      attr[key] = newValue
      return chart
    }

    return chart

  }

  // Wrapping text nodes
  // https://gist.github.com/mbostock/7555321
  wrapTextNode(text, width) {
    text.each(function () {
      const txt = d3.select(this)
      const words = txt.text().split(/\s+/).reverse()
      const lineHeight = 1.1 // ems
      const y = txt.attr('y')
      const dy = parseFloat(txt.attr('dy'))
      let word = null
      let line = []
      let lineNumber = 0
      let tspan = txt.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em')
      word = words.pop()
      while (word) {
        line.push(word)
        tspan.text(line.join(' '))
        if (tspan.node().getComputedTextLength() > width) {
          line.pop()
          tspan.text(line.join(' '))
          line = [word]
          tspan = txt.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word)
        }
        word = words.pop()
      }
    })
  }
}

export default Chart
