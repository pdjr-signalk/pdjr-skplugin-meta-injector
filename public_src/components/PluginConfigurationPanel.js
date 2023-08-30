import React, { useState } from 'react'
import { Card, CardHeader, CardBody, Input, Table, Row, Col, Form, FormGroup, Label, FormText, ButtonToolbar } from 'reactstrap'
import { Button, TextArea } from 'reactstrap'
import { useForm } from 'react-hook-form'
import Select from 'react-select';

export default (props) => {
  const options = [ { value: 'chocolate', label: 'Chocolate' }, { value: 'strawberry', label: 'Strawberry' }, { value: 'vanilla', label: 'Vanilla' } ];
  
  const saveConfig = (config) => { props.save(config); }

  return (
    <Card>
      <CardHeader>Metadata Configuration</CardHeader>
      <CardBody>
        <div>
          <div style={{ float: 'left', width: '49%' }}>
            <ConfigurationForm
              configuration = {props.configuration}
              save = {saveConfig}
            />
          </div>
          <div style={{ float: 'right', width: '49%' }}>
            <MetaDataEditorForm
              options = {options}
            /> 
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

const labelStyle = {
  lineHeight: '36px'
}

const FormField = ({ type, fieldName, label, value, setter, text }) => {
  return(
    <FormGroup row>
      <Col md='6'>
        <Label style={labelStyle} htmlFor={fieldName}>{label}</Label>
      </Col>
      <Col md='6'>
        {
          (type == 'checkbox')
          ? <Input type='checkbox' name={fieldName} onChange={e => setter(e.target.checked)} checked={value} />
          : ''
        }
        {
          (type == 'text')
          ? <Input type='text' name={fieldName} onChange={e => setter(e.target.value)} value={value} />
          : ''
        }
        <FormText color='muted'>{text}</FormText>
      </Col>
    </FormGroup>
  )
}

const ConfigurationForm = ({ configuration, save }) => {
  const [resourceType, setResourceType] = useState(configuration.resourceType);
  const [startDelay, setStartDelay] = useState(configuration.startDelay);
  const [excludePathsString, setExcludePathsString] = useState(() => configuration.excludePaths.sort().join(', '));
  const [persist, setPersist] = useState(configuration.persist);
  const [compose, setCompose] = useState(configuration.compose);
  const [snapshot, setSnapshot] = useState(configuration.snapshot);

  const onSubmit = () => {
    save({
      resourceType: resourceType,
      startDelay: startDelay,
      excludePaths: excludePathsString.split(/,/).map(i => i.trim()).sort(),
      persist: persist,
      compose: compose,
      snapshot: snapshot
    });
  }

  const onCancel = () => {
    setResourceType(configuration.resourceType);
    setStartDelay(configuration.startDelay);
    setExcludePathsString(configuration.excludePaths.sort().join(', '));
    setPersist(configuration.persist);
    setCompose(configuration.compose);
    setSnapshot(configuration.snapshot);
  }

  return(
    <Form className='square rounded border' style={{ padding: '5px' }}>
      <FormGroup row style={{ height: '60px' }}>
        <Col>
          <FormField type='text' fieldName='resourceType' label='Metadata resource type' value={resourceType} setter={setResourceType} text='' />
        </Col>
      </FormGroup>
      <FormGroup row style={{ height: '300px' }}>
        <Col>
          <FormField type='text' fieldName='startDelay' label='Start delay' value={startDelay} setter={setStartDelay} text='' />
          <FormField type='text' fieldName='excludePathsString' label='Exclude paths beginning with' value={excludePathsString} setter={setExcludePathsString} text='' />
          <FormField type='checkbox' fieldName='persist' label='Persist dynamic changes' value={persist} setter={setPersist} text='' />
          <FormField type='checkbox' fieldName='compose' label='Compose metadata' value={compose} setter={setCompose} text='' />
          <FormField type='checkbox' fieldName='snapshot' label='Take metadata snapshot' value={snapshot} setter={setSnapshot} text='' />
        </Col>
      </FormGroup>
      <FormGroup row>
        <Col>
          <ButtonToolbar style={{ justifyContent: 'space-between' }}>
            <Button size='sm' color='primary' onClick={(e) => { e.preventDefault(); onSubmit(); }}><i className='fa fa-save' /> Save </Button>
            <Button size='sm' color='secondary' onClick={(e) => { e.preventDefault(); onCancel(); }}><i className='fa fa-ban' /> Cancel </Button>
          </ButtonToolbar>
        </Col>
      </FormGroup>
    </Form>
  )
}

const MetaDataEditorForm = ({ options }) => {
  return(
    <Form className='square rounded border' style={{ padding: '5px' }}>
      <FormGroup>
        <FormGroup row style={{ height: '60px' }}>
          <Col md='6'>
            <Select options={options} />
          </Col>
          <Col md='6'>
            <Select options={options} />
          </Col>
        </FormGroup>
        <FormGroup row style={{ height: '300px' }}>
          <Col>
            <textarea rows='12' wrap='off' style={{ width: '100%' }} />
          </Col>
        </FormGroup>
        <FormGroup row>
          <Col>
            <ButtonToolbar style={{ justifyContent: 'space-between' }}>
              <ButtonToolbar>
                <Button
                  size='sm'
                  color='primary'
                  onClick={(e) => {
                    e.preventDefault()
                    props.save({
                      resourceType,
                      startDelay
                    })
                  }}>
                  <i className='fa fa-save' /> Save
                </Button>
                &nbsp;
                <Button
                  size='sm'
                  color='primary'
                  onClick={(e) => {
                    e.preventDefault()
                    props.save({
                      resourceType,
                      startDelay
                    })
                  }}>
                  <i className='fa fa-save' /> Save As
                </Button>
              </ButtonToolbar>
              <Button size='sm' color='danger' >
                <i className='fa fa-ban' /> Delete
              </Button>
            </ButtonToolbar>
          </Col>
        </FormGroup>
      </FormGroup>
    </Form>
  ) 
}