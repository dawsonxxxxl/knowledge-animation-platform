import React from 'react';
import type { AnimationElement, TextProperties, ShapeProperties, ImageProperties, ChartProperties, EquationProperties } from '../types';
import './ElementPanel.css';

interface ElementPanelProps {
  element: AnimationElement | null;
  onUpdateElement: (updates: Partial<AnimationElement>) => void;
}

export const ElementPanel: React.FC<ElementPanelProps> = ({
  element,
  onUpdateElement,
}) => {
  if (!element) {
    return (
      <div className="element-panel empty">
        <p>Select an element to edit its properties</p>
      </div>
    );
  }

  const handleTimeChange = (key: 'startTime' | 'endTime', value: number) => {
    onUpdateElement({ [key]: value });
  };

  return (
    <div className="element-panel">
      <div className="panel-header">
        <h3>{element.name}</h3>
        <span className="element-type-badge">{element.type}</span>
      </div>

      <div className="panel-section">
        <h4>Timing</h4>
        <div className="property-row">
          <label>Start (s)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={element.startTime}
            onChange={(e) => handleTimeChange('startTime', parseFloat(e.target.value))}
          />
        </div>
        <div className="property-row">
          <label>End (s)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={element.endTime}
            onChange={(e) => handleTimeChange('endTime', parseFloat(e.target.value))}
          />
        </div>
        <div className="property-row">
          <label>Duration (s)</label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={element.endTime - element.startTime}
            readOnly
          />
        </div>
      </div>

      <div className="panel-section">
        <h4>Properties</h4>
        {renderPropertyInputs(element)}
      </div>
    </div>
  );
};

const renderPropertyInputs = (element: AnimationElement) => {
  const props = element.properties;

  switch (element.type) {
    case 'text':
      return renderTextProperties(props as TextProperties, element);
    case 'shape':
      return renderShapeProperties(props as ShapeProperties, element);
    case 'image':
      return renderImageProperties(props as ImageProperties, element);
    case 'chart':
      return renderChartProperties(props as ChartProperties, element);
    case 'equation':
      return renderEquationProperties(props as EquationProperties, element);
    default:
      return <p>Unknown element type</p>;
  }
};

const renderTextProperties = (props: TextProperties, element: AnimationElement) => {
  const update = (key: string, value: unknown) => {
    element.properties = { ...props, [key]: value };
  };

  return (
    <>
      <div className="property-row">
        <label>Text</label>
        <textarea
          value={props.text}
          onChange={(e) => update('text', e.target.value)}
          rows={2}
        />
      </div>
      <div className="property-row">
        <label>Font Size</label>
        <input
          type="number"
          value={props.fontSize}
          onChange={(e) => update('fontSize', parseInt(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Font Family</label>
        <select
          value={props.fontFamily}
          onChange={(e) => update('fontFamily', e.target.value)}
        >
          <option value="sans-serif">Sans Serif</option>
          <option value="serif">Serif</option>
          <option value="monospace">Monospace</option>
          <option value="cursive">Cursive</option>
        </select>
      </div>
      <div className="property-row">
        <label>Color</label>
        <input
          type="color"
          value={props.color}
          onChange={(e) => update('color', e.target.value)}
        />
      </div>
      <div className="property-row">
        <label>Position X</label>
        <input
          type="number"
          value={props.x}
          onChange={(e) => update('x', parseInt(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Position Y</label>
        <input
          type="number"
          value={props.y}
          onChange={(e) => update('y', parseInt(e.target.value))}
        />
      </div>
    </>
  );
};

const renderShapeProperties = (props: ShapeProperties, element: AnimationElement) => {
  const update = (key: string, value: unknown) => {
    element.properties = { ...props, [key]: value };
  };

  return (
    <>
      <div className="property-row">
        <label>Shape Type</label>
        <select
          value={props.shapeType}
          onChange={(e) => update('shapeType', e.target.value)}
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="line">Line</option>
          <option value="arrow">Arrow</option>
        </select>
      </div>
      <div className="property-row">
        <label>Width</label>
        <input
          type="number"
          value={props.width}
          onChange={(e) => update('width', parseInt(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Height</label>
        <input
          type="number"
          value={props.height}
          onChange={(e) => update('height', parseInt(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Fill Color</label>
        <input
          type="color"
          value={props.fill}
          onChange={(e) => update('fill', e.target.value)}
        />
      </div>
      <div className="property-row">
        <label>Stroke Color</label>
        <input
          type="color"
          value={props.stroke}
          onChange={(e) => update('stroke', e.target.value)}
        />
      </div>
      <div className="property-row">
        <label>Stroke Width</label>
        <input
          type="number"
          value={props.strokeWidth}
          onChange={(e) => update('strokeWidth', parseInt(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Position X</label>
        <input
          type="number"
          value={props.x}
          onChange={(e) => update('x', parseInt(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Position Y</label>
        <input
          type="number"
          value={props.y}
          onChange={(e) => update('y', parseInt(e.target.value))}
        />
      </div>
    </>
  );
};

const renderImageProperties = (props: ImageProperties, element: AnimationElement) => {
  const update = (key: string, value: unknown) => {
    element.properties = { ...props, [key]: value };
  };

  return (
    <>
      <div className="property-row">
        <label>Image URL</label>
        <input
          type="text"
          value={props.src}
          onChange={(e) => update('src', e.target.value)}
          placeholder="Enter image URL"
        />
      </div>
      <div className="property-row">
        <label>Width</label>
        <input
          type="number"
          value={props.width}
          onChange={(e) => update('width', parseInt(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Height</label>
        <input
          type="number"
          value={props.height}
          onChange={(e) => update('height', parseInt(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Position X</label>
        <input
          type="number"
          value={props.x}
          onChange={(e) => update('x', parseInt(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Position Y</label>
        <input
          type="number"
          value={props.y}
          onChange={(e) => update('y', parseInt(e.target.value))}
        />
      </div>
    </>
  );
};

const renderChartProperties = (props: ChartProperties, element: AnimationElement) => {
  const update = (key: string, value: unknown) => {
    element.properties = { ...props, [key]: value };
  };

  return (
    <>
      <div className="property-row">
        <label>Chart Type</label>
        <select
          value={props.chartType}
          onChange={(e) => update('chartType', e.target.value)}
        >
          <option value="bar">Bar Chart</option>
          <option value="line">Line Chart</option>
          <option value="pie">Pie Chart</option>
        </select>
      </div>
      <div className="property-row">
        <label>Data</label>
        <div className="data-inputs">
          {props.data.map((item, index) => (
            <div key={index} className="data-item">
              <input
                type="text"
                value={item.label}
                onChange={(e) => {
                  const newData = [...props.data];
                  newData[index] = { ...item, label: e.target.value };
                  update('data', newData);
                }}
                placeholder="Label"
              />
              <input
                type="number"
                value={item.value}
                onChange={(e) => {
                  const newData = [...props.data];
                  newData[index] = { ...item, value: parseFloat(e.target.value) };
                  update('data', newData);
                }}
                placeholder="Value"
              />
            </div>
          ))}
          <button
            className="add-data-btn"
            onClick={() => {
              const newData = [...props.data, { label: 'New', value: 0 }];
              update('data', newData);
            }}
          >
            + Add Data Point
          </button>
        </div>
      </div>
    </>
  );
};

const renderEquationProperties = (props: EquationProperties, element: AnimationElement) => {
  const update = (key: string, value: unknown) => {
    element.properties = { ...props, [key]: value };
  };

  return (
    <>
      <div className="property-row">
        <label>LaTeX</label>
        <input
          type="text"
          value={props.latex}
          onChange={(e) => update('latex', e.target.value)}
          placeholder="E = mc^2"
        />
      </div>
      <div className="property-row">
        <label>Scale</label>
        <input
          type="number"
          step="0.1"
          value={props.scale}
          onChange={(e) => update('scale', parseFloat(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Position X</label>
        <input
          type="number"
          value={props.x}
          onChange={(e) => update('x', parseInt(e.target.value))}
        />
      </div>
      <div className="property-row">
        <label>Position Y</label>
        <input
          type="number"
          value={props.y}
          onChange={(e) => update('y', parseInt(e.target.value))}
        />
      </div>
    </>
  );
};

export default ElementPanel;