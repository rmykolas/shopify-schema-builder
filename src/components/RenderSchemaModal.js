import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Button } from "@shopify/polaris";
import "../css/styles.css";
import PropTypes from "prop-types";
import { cloneDeep } from "lodash";

class RenderFieldModal extends Component {
  state = {
    modalActive: false,
  };

  static propTypes = {
    activeFields: PropTypes.array,
  };

  handleModalChange = () => {
    this.setState(({ modalActive }) => ({ modalActive: !modalActive }));
  };

  addTransformStrings = (reorderedObject, fields) => {
    let objectWithTranslationStrings = cloneDeep(reorderedObject);

    // updating translation strings
    if (reorderedObject.name && reorderedObject.name.length > 0) {
      objectWithTranslationStrings.name = `t:sections.${reorderedObject.name}.name`;
    }

    // settings
    objectWithTranslationStrings.settings.map((settingsItem, index) => {
      // label
      if (settingsItem.label.length > 0) {
        objectWithTranslationStrings.settings[index].label = `t:sections.${fields.store.name}.settings.${settingsItem.id}.label`;
      }
      // info
      if (settingsItem.info.length > 0) {
        objectWithTranslationStrings.settings[index].info = `t:sections.${fields.store.name}.settings.${settingsItem.id}.info`;
      }
      // placeholder
      if (settingsItem.placeholder.length > 0) {
        objectWithTranslationStrings.settings[index].placeholder = `t:sections.${fields.store.name}.settings.${settingsItem.id}.placeholder`;
      }
    });

    // blocks
    if (objectWithTranslationStrings.blocks) {
      objectWithTranslationStrings.blocks.map((blockItem) => {
        blockItem.settings.map((blockItemSettingsItem) => {
          // label
          if (blockItemSettingsItem.label.length > 0) {
            blockItemSettingsItem.label = `t:sections.${fields.store.name}.blocks.${blockItemSettingsItem.id}.label`;
          }
          // info
          if (blockItemSettingsItem.info && blockItemSettingsItem.info.length > 0) {
            blockItemSettingsItem.info = `t:sections.${fields.store.name}.blocks.${blockItemSettingsItem.id}.info`;
          }
          // placeholder
          if (blockItemSettingsItem.placeholder.length > 0) {
            blockItemSettingsItem.placeholder = `t:sections.${fields.store.name}.blocks.${blockItemSettingsItem.id}.placeholder`;
          }
        });
      });
    }

    return objectWithTranslationStrings;
  };

  getFieldJSON = () => {
    const removeQuotesRegex = new RegExp(/"(min|max|step)": "(\d*)"/gi);
    const { fields, settings, blocks } = this.props;

    const reorderedBlocks =
      blocks.length === 0
        ? null
        : blocks.map(({ id }) => {
            return { ...fields[id], settings: settings[id] };
          });

    const presets =
      blocks.length === 0
        ? null
        : blocks.map(({ id }) => {
            return { type: fields[id].type };
          });

    const reorderedObject = {
      ...fields.store,
      settings: settings.store,
      ...(blocks.length > 0 && { blocks: reorderedBlocks, presets: [{ name: fields.store.name, blocks: [...presets] }] }),
    };

    let transformedItems = this.addTransformStrings(reorderedObject, fields);

    let stringifiedFieldItems = JSON.stringify(transformedItems, null, 2).replace(removeQuotesRegex, '"$1": $2');

    stringifiedFieldItems = `{% schema %}\n` + stringifiedFieldItems + `\n{% endschema %}`;

    return stringifiedFieldItems;
  };

  render() {
    const { modalActive } = this.state;
    const fieldItemsJSON = this.getFieldJSON();

    return (
      <div>
        Json go brr:
        <br />
        <textarea style={{ width: "100%" }} value={fieldItemsJSON} readOnly="readOnly"></textarea>
        {/* <Button onClick={this.handleModalChange}>Render JSON</Button>
        <Modal
          open={modalActive}
          onClose={this.handleModalChange}
          title="Schema Section JSON"
          primaryAction={{
            content: "Close",
            onAction: this.handleModalChange,
          }}
        >
          <Modal.Section>
            <textarea value={fieldItemsJSON} readOnly="readOnly"></textarea>
          </Modal.Section>
        </Modal> */}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  settings: state.settings,
  modal: state.modal,
  error: state.error,
  blocks: state.blocks,
  fields: state.fields,
});

export default connect(mapStateToProps)(RenderFieldModal);
