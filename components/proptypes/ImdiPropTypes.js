import {PropTypes} from 'react'

export const region = PropTypes.shape({
  name: PropTypes.string
})

export const regionPickerGroup = PropTypes.shape({
  name: PropTypes.string,
  description: PropTypes.node,
  items: PropTypes.arrayOf(region)
})

export const cardPage = PropTypes.shape({
  name: PropTypes.string
})

export const route = PropTypes.shape({
  params: PropTypes.object,
  query: PropTypes.object,
  splat: PropTypes.string,
  route: PropTypes.string,
  hash: PropTypes.string,
  url: PropTypes.string,
  handler: PropTypes.func
})

export const router = PropTypes.shape({
  navigate: PropTypes.func,
  makeLink: PropTypes.func
})

export const chartData = PropTypes.shape({
  rows: PropTypes.arrayOf({
    value: PropTypes.number
  })
  //... add more
})


export const query = PropTypes.shape({
  dimensions: PropTypes.arrayOf({
    name: PropTypes.string,
    variables: PropTypes.arrayOf(PropTypes.string)
  }),
  tableName: PropTypes.string,
  //... add more
})

