var funnelChartItemMetaData = {
    bindings: [{
        propertyName: 'measureValue',
        dataItemType: 'Measure',
        displayName: 'Value'
    }, {
        propertyName: 'dimensionValue',
        dataItemType: 'Dimension',
        displayName: 'Argument',
        enableColoring: true,
        enableInteractivity: true
    }],
    interactivity: {
        filter: true
    },
    properties: [{
        propertyName: 'labelPositionProperty',
        editor: DevExpress.Dashboard.Metadata.editorTemplates.buttonGroup,
        displayName: 'Label Position',
        sectionName: 'Labels',
        values: {
            Inside: 'Inside',
            Outside: 'Outside'
        },
        defaultVal: 'Inside'
    }],

    icon: 'funnelChartItemIcon',
    title: 'Funnel Chart',
    index: 2
};

//...

var funnelChartItemViewer = (function (_base) {
    __extends(funnelChartItemViewer, _base);

    function funnelChartItemViewer(model, $container, options) {
        _base.call(this, model, $container, options);

        this.dxFunnelWidget = null;
        this.dxFunnelWidgetSettings = undefined;
    }

    funnelChartItemViewer.prototype._getDataSource = function () {
        var clientData = [];
        if (this.getBindingValue('measureValue').length > 0) {
            this.iterateData(function (dataRow) {
                clientData.push({
                    measureValue: dataRow.getValue('measureValue')[0],
                    dimensionValue: dataRow.getValue('dimensionValue')[0] || '',
                    dimensionDisplayText: dataRow.getDisplayText('dimensionValue')[0],
                    measureDisplayText: dataRow.getDisplayText('measureValue')[0],
                    dimensionColor: dataRow.getColor('dimensionValue')[0],
                    clientDataRow: dataRow
                });
            });
        }
        return clientData;
    };

    funnelChartItemViewer.prototype._getDxFunnelWidgetSettings = function () {
        var _this = this;
        return {
            dataSource: _this._getDataSource(),
            argumentField: "dimensionValue",
            valueField: "measureValue",
            colorField: "dimensionColor",
            selectionMode: "multiple",
            label: {
                customizeText: function (e) {
                    return e.item.data.dimensionDisplayText + ': ' + e.item.data.measureDisplayText;
                },
                position: _this.getPropertyValue('labelPositionProperty').toLowerCase()
            },
            onItemClick: function (e) {
                _this.setMasterFilter(e.item.data.clientDataRow);
            }
        };
    };

    funnelChartItemViewer.prototype.setSelection = function () {
        var _this = this;
        this.dxFunnelWidget.getAllItems().forEach(function (item) {
            item.select(_this.isSelected(item.data.clientDataRow));
        });
    };

    funnelChartItemViewer.prototype.clearSelection = function () {
        this.dxFunnelWidget.clearSelection();
    };

    funnelChartItemViewer.prototype.setSize = function (width, height) {
        _base.prototype.setSize.call(this, width, height);
        this.dxFunnelWidget.render();
    };

    funnelChartItemViewer.prototype.renderContent = function ($element, changeExisting) {
        if (!changeExisting) {
            $element.html('');
            var $div = $('<div/>');
            $element.append($div);
            this.dxFunnelWidget = new DevExpress.viz.dxFunnel($div, this._getDxFunnelWidgetSettings());
        } else {
            this.dxFunnelWidget.option(this._getDxFunnelWidgetSettings());
        }
    };

    return funnelChartItemViewer;
}(DevExpress.Dashboard.CustomItemViewer));

//...

function funnelChartItem(dashboardControl) {
    return {
        name: "funnelChartCustomItem",
        metaData: funnelChartItemMetaData,

        createViewerItem: function (model, $element, content) {
            return new funnelChartItemViewer(model, $element, content);
        }
    }
};