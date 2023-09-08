import React, { createRef } from 'react'
import { Card, CardHeader, CardBody } from 'reactstrap'
import PluginConfigurator from './PluginConfigurator';
import MetadataEditor from './MetadataEditor';

/**
 * props.configuration = the plugin configuration from Signal K.
 * props.save = Signal K callback function which saves configuration.
 */
export default (props) => {

  return (
    <Card>
      <CardHeader>Metadata Configuration</CardHeader>
      <CardBody>
        <div>
          <div style={{ float: 'left', width: '44%' }}>
            <PluginConfigurator configuration = {props.configuration} save = {(config) => props.save(config)} />
          </div>
          <div style={{ float: 'right', width: '54%' }}>
            <MetadataEditor />
          </div>
        </div>
      </CardBody>
    </Card>
  );

}

