const { Pool } = require('pg')
const _ = require('lodash')

var pool

module.exports = {
  connect: function (urlObject) {
    var host = urlObject.host
    console.log('Connecting to postgres at', host)
    pool = new Pool({
      connectionString: urlObject.href
    })

    return pool.query('SELECT NOW() as now')
      .then(function (res) {
        console.log('Connected to postgres on', res.rows[0].now)
      })
  },

  bellCurve: function (gene) {
    return pool.query(`
      SELECT
        mcf10a.gene,
        mcf10a.fpkm AS mcf10A_fpkm,
        mcf7.fpkm AS mcf7_fpkm,
        mcf10a_vs_mcf7.pvalue,
        mcf10a_vs_mcf7.log2_foldchange
      FROM
        mcf10a, mcf7, mcf10a_vs_mcf7
      WHERE
        mcf10a.gene=$1 AND
        mcf7.gene=$1 AND
        mcf10a_vs_mcf7.gene=$1
    `, [gene])
      .then(function (res) {
        return res
      })
      .catch(function (rej) {
        return rej
      })
  },

  vertical: function (gene) {
    return pool.query(`
    SELECT
      mcf10a.gene,
      mcf10a.fpkm AS mcf10A_fpkm,
      mcf7.fpkm AS mcf7_fpkm,
      mcf10a_vs_mcf7.pvalue,
      mcf10a_vs_mcf7.log2_foldchange
    FROM mcf10a
    INNER JOIN mcf7 ON mcf10a.gene = mcf7.gene
    INNER JOIN mcf10a_vs_mcf7 ON mcf10a.gene = mcf10a_vs_mcf7.gene
    WHERE mcf10a.gene = $1
    `, [gene])
  },

  heatMap: function (genes) {
    // Convert genes array to genes list for psql
    genes = _.map(genes, function (gene) {
      return `'${gene}'`
    })
    var genesList = _.join(genes, ',')
    genesList = '(' + genesList + ')'

    return pool.query(`
    SELECT
      row_number() OVER () AS key,
      mcf10a.gene,
      mcf10a.fpkm AS mcf10A_fpkm,
      mcf7.fpkm AS mcf7_fpkm
    FROM
      mcf10a
    INNER JOIN mcf7
    ON mcf10a.gene = mcf7.gene
    WHERE
      mcf10a.gene IN ${genesList}
    `)
  }
}
