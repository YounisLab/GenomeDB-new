import React from 'react'
import styles from './styles'
import Row from './Row'
import HeatMapChart from './HeatMapChart'
import { Layout, Input, Button, Table } from 'antd'
const axios = require('axios')
const _ = require('lodash')
const { Content } = Layout
const { TextArea } = Input

const columns = [{
  title: 'No.',
  dataIndex: 'key',
  key: 'key'
},
{
  title: 'Gene',
  dataIndex: 'gene',
  key: 'gene'
}, {
  title: 'MCF10A FPKM',
  dataIndex: 'mcf10a_fpkm',
  key: 'mcf10a_fpkm'
}, {
  title: 'MCF7 FPKM',
  dataIndex: 'mcf7_fpkm',
  key: 'mcf7_fpkm'
}]

class HeatMap extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      text: '',
      data: []
    }

    this.updateText = this.updateText.bind(this)
    this.getHeatMap = this.getHeatMap.bind(this)
    this.doSearch = this.doSearch.bind(this)
  }
  updateText (evt) {
    this.setState({ text: evt.target.value })
  }
  getHeatMap () {
    console.log('>>', _.split(this.state.text, '\n'))
    axios.post('/api/heatmap', {
      genes: _.split(this.state.text, '\n')
    })
      .then(resp => {
        this.setState({ data: resp.data })
      })
  }
  doSearch (evt) {
    if (evt.key === 'Enter' && evt.ctrlKey) {
      this.getHeatMap()
    }
  }
  render () {
    return (
      <Content style={styles.contentStyle}>
        <div style={styles.contentDivStyle}>
          <Row>
            <h1>Differential Multi-Gene Expression</h1>
          </Row>
          <Row>
            Enter a gene in each line. Press Ctrl + Enter or click on the search button to search.
          </Row>
          <Row>
            <TextArea
              rows={4}
              placeholder='Enter newline separated list of genes here.'
              onChange={this.updateText}
              onKeyUp={this.doSearch}
              style={{ width: '50%' }} />
          </Row>
          <Row>
            <Button type='primary' icon='search' onClick={this.getHeatMap}>Search</Button>
          </Row>
          <Row>
            <HeatMapChart />
          </Row>
          <Row>
            <Table
              dataSource={this.state.data}
              columns={columns}
              size={'small'}
              bordered
              pagination={false}
              style={{ width: '50%' }}
              locale={{ emptyText: 'Enter list of genes to show results' }}
            />
          </Row>
        </div>
      </Content>
    )
  }
}

export default HeatMap
