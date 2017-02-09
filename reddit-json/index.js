const json = require('./test.json')

/**
 * Load json representation of some subreddit and manipulate it
 */
class Reddit {
  /**
   * @param {Object} json - not a string
   */
  constructor (json) {
    this.json = json
  }

  /**
   * Sort current subreddit's data
   * @param {string} field
   * @param {string|number} [direction] (asc|1|desc|-1)
   * @todo make it immutable
   */
  sort (field, direction = 'asc') {
    const compare = (direction < 0 || direction === 'desc')
      ? (a, b) => a.data[field] < b.data[field] ? 1 : -1
      : (a, b) => a.data[field] > b.data[field] ? 1 : -1

    this.json.data.children.sort(compare)
    return this
  }

  /**
   * Get formatted representation of loaded data
   * @param {string} format (json|csv)
   * @param {Object} options - depends on format; common options:
   * @param {Array} options.fields - list of fields to output
   * @param {Function} options.date - function to format date
   *   for example Intl.DateFormat#format
   *   by default Date#toISOString
   */
  format (format, options = {}) {
    format = format.toLowerCase()
    const formatter = Reddit.Format[format]

    return formatter ? formatter(this.json, options) : ''
  }
}

Reddit.Format = {}
Reddit.Format.json = function (json, options = {}) {
  // js works with ms
  const date = options.date || (date => new Date(date * 1000).toISOString())
  const fields = options.fields || [ 'id', 'title', 'created_utc', 'score' ]
  const separator = options.separator || ','

  return JSON.stringify(json.data.children
    .map(item => item.data)
    .map(item => fields
      // convert array to object with given fields
      .reduce((obj, field) => {
        // @todo think about mutators and dates
        if (substr(field, 0, 7) === 'created') {
          obj['created'] = date(item['created_utc'])
        } else {
          obj[field] = item[field]
        }
        return obj
      }, {})
    )
  )
}

console.log(new Reddit(json).sort('score', -1).format('json'))
