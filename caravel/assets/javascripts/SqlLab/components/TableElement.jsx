import React from 'react';
import { ButtonGroup, Well } from 'react-bootstrap';
import Link from './Link';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as Actions from '../actions';
import shortid from 'shortid';
import ModalTrigger from '../../components/ModalTrigger';
import CopyToClipboard from '../../components/CopyToClipboard';

const propTypes = {
  table: React.PropTypes.object,
  queryEditor: React.PropTypes.object,
  actions: React.PropTypes.object,
};

const defaultProps = {
  table: null,
  actions: {},
};

class TableElement extends React.Component {
  setSelectStar() {
    this.props.actions.queryEditorSetSql(this.props.queryEditor, this.selectStar());
  }

  selectStar() {
    let cols = '';
    this.props.table.columns.forEach((col, i) => {
      cols += col.name;
      if (i < this.props.table.columns.length - 1) {
        cols += ', ';
      }
    });
    let tableName = this.props.table.name;
    if (this.props.table.schema) {
      tableName = this.props.table.schema + '.' + tableName;
    }
    return `SELECT ${cols}\nFROM ${tableName}`;
  }

  popSelectStar() {
    const qe = {
      id: shortid.generate(),
      title: this.props.table.name,
      dbId: this.props.table.dbId,
      autorun: true,
      sql: this.selectStar(),
    };
    this.props.actions.addQueryEditor(qe);
  }

  collapseTable(e) {
    e.preventDefault();
    this.props.actions.collapseTable(this.props.table);
  }

  expandTable(e) {
    e.preventDefault();
    this.props.actions.expandTable(this.props.table);
  }

  removeTable() {
    this.props.actions.removeTable(this.props.table);
  }

  render() {
    const table = this.props.table;
    let metadata = null;
    let buttonToggle;

    let header;
    if (table.partitions) {
      let partitionQuery;
      let partitionClipBoard;
      if (table.partitions.partitionQuery) {
        partitionQuery = table.partitions.partitionQuery;
        const tt = 'Copy partition query to clipboard';
        partitionClipBoard = (
          <CopyToClipboard
            text={partitionQuery}
            shouldShowText={false}
            tooltipText={tt}
            copyNode={<i className="fa fa-clipboard" />}
          />
        );
      }
      let latest = [];
      for (const k in table.partitions.latest) {
        latest.push(`${k}=${table.partitions.latest[k]}`);
      }
      latest = latest.join('/');
      header = (
        <Well bsSize="small">
          <div>
            <small>
              latest partition: {latest}
            </small> {partitionClipBoard}
          </div>
        </Well>
      );
    }
    if (table.expanded) {
      buttonToggle = (
        <a
          href="#"
          onClick={(e) => { this.collapseTable(e); }}
        >
          <strong>{table.name}</strong>
          <small className="m-l-5"><i className="fa fa-minus" /></small>
        </a>
      );
      metadata = (
        <div>
          {header}
          <div className="table-columns">
            {table.columns.map((col) => {
              let name = col.name;
              if (col.indexed) {
                name = <strong>{col.name}</strong>;
              }
              return (
                <div className="clearfix table-column" key={shortid.generate()}>
                  <div className="pull-left m-l-10">
                    {name}
                  </div>
                  <div className="pull-right text-muted">
                    <small> {col.type}</small>
                  </div>
                </div>);
            })}
            <hr />
          </div>
        </div>
      );
    } else {
      buttonToggle = (
        <a
          href="#"
          onClick={(e) => { this.expandTable(e); }}
        >
          {table.name}
          <small className="m-l-5"><i className="fa fa-plus" /></small>
        </a>
      );
    }
    let keyLink;
    if (table.indexes && table.indexes.length > 0) {
      keyLink = (
        <ModalTrigger
          modalTitle={
            <div>
              Keys for table <strong>{table.name}</strong>
            </div>
          }
          modalBody={
            <pre>{JSON.stringify(table.indexes, null, 4)}</pre>
          }
          triggerNode={
            <Link
              className="fa fa-key pull-left m-l-2"
              tooltip={`View indexes (${table.indexes.length})`}
            />
          }
        />
      );
    }
    return (
      <div className="TableElement">
        <div className="clearfix">
          <div className="pull-left">
            {buttonToggle}
          </div>
          <div className="pull-right">
            <ButtonGroup className="ws-el-controls pull-right">
              {keyLink}
              <Link
                className="fa fa-pencil pull-left m-l-2"
                onClick={this.setSelectStar.bind(this)}
                tooltip="Run query in this tab"
                href="#"
              />
              <Link
                className="fa fa-plus-circle pull-left  m-l-2"
                onClick={this.popSelectStar.bind(this)}
                tooltip="Run query in a new tab"
                href="#"
              />
              <Link
                className="fa fa-trash pull-left m-l-2"
                onClick={this.removeTable.bind(this)}
                tooltip="Remove from workspace"
                href="#"
              />
            </ButtonGroup>
          </div>
        </div>
        <div>
          {metadata}
        </div>
      </div>
    );
  }
}
TableElement.propTypes = propTypes;
TableElement.defaultProps = defaultProps;

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(Actions, dispatch),
  };
}
export default connect(null, mapDispatchToProps)(TableElement);
export { TableElement };
