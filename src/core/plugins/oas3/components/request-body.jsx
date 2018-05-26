import React from "react"
import PropTypes from "prop-types"
import ImPropTypes from "react-immutable-proptypes"
import { getSampleSchema } from "core/utils"
import Im, { Map, OrderedMap, List } from "immutable"

const RequestBody = ({
  requestBody,
  requestBodyValue,
  getComponent,
  getConfigs,
  specSelectors,
  contentType,
  isExecute,
  specPath,
  onChange
}) => {
  const handleFile = (e) => {
    onChange(e.target.files[0])
  }

  const Markdown = getComponent("Markdown")
  const ModelExample = getComponent("modelExample")
  const RequestBodyEditor = getComponent("RequestBodyEditor")

  const requestBodyDescription = (requestBody && requestBody.get("description")) || null
  const requestBodyContent = (requestBody && requestBody.get("content")) || new OrderedMap()
  contentType = contentType || requestBodyContent.keySeq().first()

  const mediaTypeValue = requestBodyContent.get(contentType)

  const isObjectContent = mediaTypeValue.getIn(["schema", "type"]) === "object"

  if(!mediaTypeValue) {
    return null
  }

  if(contentType === "application/octet-stream") {
    const Input = getComponent("Input")

    if(!isExecute) {
      return <i>
        Example values are not available for <code>application/octet-stream</code> media types.
      </i>
    }

    return <Input type={"file"} onChange={handleFile} />
  }

  if(
    isObjectContent &&
    (contentType === "application/x-www-form-urlencoded"
    || contentType.indexOf("multipart/") === 0))
  {
    const JsonSchemaForm = getComponent("JsonSchemaForm")
    const HighlightCode = getComponent("highlightCode")
    const bodyProperties = requestBody.getIn(["content", contentType, "schema", "properties"], OrderedMap())
    requestBodyValue = Map.isMap(requestBodyValue) ? requestBodyValue : OrderedMap()

    return <div className="table-container">
      <table>
        <tbody>
          {
            bodyProperties.map((prop, key) => {
              const required = prop.get("required")
              const type = prop.get("type")
              const format = prop.get("format")

              const isFile = type === "string" && (format === "binary" || format === "base64")

              return <tr key={key} className="parameters">
                <td className="col parameters-col_name">
                        <div className={required ? "parameter__name required" : "parameter__name"}>
                          { key }
                          { !required ? null : <span style={{color: "red"}}>&nbsp;*</span> }
                        </div>
                        <div className="parameter__type">
                          { type }
                          { format && <span className="prop-format">(${format})</span>}
                        </div>
                        <div className="parameter__deprecated">
                          { prop.get("deprecated") ? "deprecated": null }
                        </div>
                      </td>
                      <td className="col parameters-col_description">
                        {isExecute ?
                        <JsonSchemaForm
                          dispatchInitialValue={!isFile}
                          schema={prop}
                          getComponent={getComponent}
                          value={requestBodyValue.get(key) || getSampleSchema(prop)}
                          onChange={(value) => {
                            onChange(value, [key])
                          }}
                          />
                        : <HighlightCode className="example" value={ getSampleSchema(prop) } />}
                      </td>
                      </tr>
            })
          }
        </tbody>
      </table>
    </div>
  }

  return <div>
    { requestBodyDescription &&
      <Markdown source={requestBodyDescription} />
    }
    <ModelExample
      getComponent={ getComponent }
      getConfigs={ getConfigs }
      specSelectors={ specSelectors }
      expandDepth={1}
      isExecute={isExecute}
      schema={mediaTypeValue.get("schema")}
      specPath={specPath.push("content", contentType)}
      example={<RequestBodyEditor
        requestBody={requestBody}
        onChange={onChange}
        mediaType={contentType}
        getComponent={getComponent}
        isExecute={isExecute}
        specSelectors={specSelectors}
        />}
      />
  </div>
}

RequestBody.propTypes = {
  requestBody: ImPropTypes.orderedMap.isRequired,
  requestBodyValue: ImPropTypes.orderedMap.isRequired,
  getComponent: PropTypes.func.isRequired,
  getConfigs: PropTypes.func.isRequired,
  specSelectors: PropTypes.object.isRequired,
  contentType: PropTypes.string,
  isExecute: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  specPath: PropTypes.array.isRequired
}

export default RequestBody
