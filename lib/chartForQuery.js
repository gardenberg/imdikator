export function chartForQuery(query, preferredChartKind) {
  if (!query.include || !query.include.aar) {
    return preferredChartKind
  }
  if (query.include.aar.length === 1) {
    return preferredChartKind
  }

  // TODO: Move specific knowledge out to config?
  const possibleCharts = ['line', 'stackedArea']
  if (possibleCharts.indexOf(preferredChartKind) != -1) {
    return preferredChartKind
  }
  return possibleCharts[0]
}
