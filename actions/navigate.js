import {REGION_NOT_FOUND, NAVIGATE} from './ActionTypes'
import {setCurrentRegion, setCurrentRegionByCode} from './region'

export function navigate(match = {}) {
  return dispatch => {

    if (match.params.region) {
      dispatch(setCurrentRegionByCode(match.params.region))
    }

    // TODO:
    // check if there is a region, dispatch a selectRegion action
    // check if there is a cardPage, dispatch a selectCardPage action
    // check if there is a tab, dispatch a selectTab actin
    // check if there is a tab, dispatch a selectTab action
    dispatch({
      type: NAVIGATE,
      match
    })
  }
}
