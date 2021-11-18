import React, { Component } from "react";
import { connect } from "react-redux";
import "../css/styles.css";
import PropTypes from "prop-types";
import { cloneDeep } from "lodash";

class RenderFieldModal extends Component {
  static propTypes = {
    activeFields: PropTypes.array,
  };

  transformString = (string = "", spaceModifier = "_") => string.toLowerCase().split(" ").join(spaceModifier);

  addTransformStrings = (reorderedObject) => {
    let objectWithTranslationStrings = cloneDeep(reorderedObject);

    let transformedName = "";

    if (reorderedObject.name) {
      transformedName = this.transformString(reorderedObject.name);
    }

    // updating translation strings
    if (reorderedObject.name && reorderedObject.name.length > 0) {
      objectWithTranslationStrings.name = `t:sections.${transformedName}.name`;

      if (objectWithTranslationStrings.presets) {
        objectWithTranslationStrings.presets[0].name = `t:sections.${transformedName}.presets.name`;
      }
    }

    // settings
    objectWithTranslationStrings.settings.map((settingsItem, index) => {
      let transformedId = this.transformString(settingsItem.id);

      // id
      if (settingsItem.id && settingsItem.id.length > 0) {
        settingsItem.id = transformedId;
      }

      // label
      if (settingsItem.label && settingsItem.label.length > 0) {
        objectWithTranslationStrings.settings[index].label = `t:sections.${transformedName}.settings.${transformedId}.label`;
      }
      // info
      if (settingsItem.info && settingsItem.info.length > 0) {
        objectWithTranslationStrings.settings[index].info = `t:sections.${transformedName}.settings.${transformedId}.info`;
      }
      // placeholder
      if (settingsItem.placeholder && settingsItem.placeholder.length > 0) {
        objectWithTranslationStrings.settings[index].placeholder = `t:sections.${transformedName}.settings.${transformedId}.placeholder`;
      }
    });

    // debugger;

    // blocks
    if (objectWithTranslationStrings.blocks) {
      objectWithTranslationStrings.blocks.map((blockItem) => {
        if (blockItem.name) {
          blockItem.name = this.transformString(blockItem.name);
        }

        blockItem.settings.map((blockItemSettingsItem) => {
          let transformedId = this.transformString(blockItemSettingsItem.id);

          // id
          if (blockItemSettingsItem.id && blockItemSettingsItem.id.length > 0) {
            blockItemSettingsItem.id = transformedId;
          }

          // label
          if (blockItemSettingsItem.label && blockItemSettingsItem.label.length > 0) {
            blockItemSettingsItem.label = `t:sections.${transformedName}.blocks.${transformedId}.label`;
          }
          // info
          if (blockItemSettingsItem.info && blockItemSettingsItem.info.length > 0) {
            blockItemSettingsItem.info = `t:sections.${transformedName}.blocks.${transformedId}.info`;
          }
          // placeholder
          if (blockItemSettingsItem.placeholder && blockItemSettingsItem.placeholder.length > 0) {
            blockItemSettingsItem.placeholder = `t:sections.${transformedName}.blocks.${transformedId}.placeholder`;
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

  getTranslationJSON = () => {
    const removeQuotesRegex = new RegExp(/"(min|max|step)": "(\d*)"/gi);
    const { fields, settings, blocks } = this.props;

    let transformedName = "";

    if (fields.store.name) {
      transformedName = this.transformString(fields.store.name);
    }

    const translationJSON = {
      name: fields.store.name,
      settings: {},
      blocks: {},
      presets: {
        name: fields.store.name,
      },
    };

    // setting
    settings.store.map((settingItem) => {
      translationJSON.settings[this.transformString(settingItem.id, "")] = {
        label: settingItem.label,
        placeholder: settingItem.placeholder,
      };
    });

    // blocks
    blocks.map((blockItem) => {
      translationJSON.blocks[this.transformString(fields[blockItem.id].type, "_")] = {
        name: fields[blockItem.id].name,
        settings: {},
      };

      let targetBlockSettings = settings[blockItem.id];

      targetBlockSettings.map((settingItem) => {
        translationJSON.blocks[this.transformString(fields[blockItem.id].type, "_")].settings[this.transformString(settingItem.id, "_")] = {
          label: settingItem.label,
          placeholder: settingItem.placeholder,
          info: settingItem.info,
        };
      });
    });

    let stringifiedFieldItems = `${transformedName}: {\n` + JSON.stringify(translationJSON, null, 2).replace(removeQuotesRegex, '"$1": $2') + "}";

    return stringifiedFieldItems;
  };

  render() {
    const fieldItemsJSON = this.getFieldJSON();

    const translationJSON = this.getTranslationJSON();

    return (
      <div>
        <textarea value={fieldItemsJSON} readOnly="readOnly"></textarea>
        <br />
        Translation json go here brr:
        <br />
        <textarea value={translationJSON} readOnly="readOnly"></textarea>
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
