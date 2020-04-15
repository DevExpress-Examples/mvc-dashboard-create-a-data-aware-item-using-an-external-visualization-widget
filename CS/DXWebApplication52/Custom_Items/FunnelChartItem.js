﻿var FunnelChartItem = (function () {
    var Dashboard = DevExpress.Dashboard;
    var Designer = DevExpress.Dashboard.Designer;
    var dxFunnel = DevExpress.viz.dxFunnel;

    var svgIcon = '<svg id="funnelChartItemIcon" viewBox="0 0 24 24"><path stroke="#ffffff" fill="#f442ae" d="M12 2 L2 22 L22 22 Z" /></svg>';

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
        customProperties: [{
            ownerType: 'CustomItem',
            propertyName: 'labelPositionProperty',
            valueType: 'string',
            defaultValue: 'Inside'
        }],
        optionsPanelSections: [{
            title: 'Labels',
            items: [{
                dataField: 'labelPositionProperty',
                label: {
                    text: 'Label Position'
                },
                template: Designer.FormItemTemplates.buttonGroup,
                editorOptions: { 
                    items: [{ text: 'Inside' }, { text: 'Outside' }] 
                }
            }]
        }],
        icon: 'funnelChartItemIcon',
        title: 'Funnel Chart',
        index: 2
    };
    
    function FunnelChartItemViewer(model, $container, options) {
        var parent = Dashboard.CustomItemViewer.call(this, model, $container, options);

        this.dxFunnelWidget = null;
        this.dxFunnelWidgetSettings = undefined;

        this._getDataSource = function () {
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

        this._getDxFunnelWidgetSettings = function () {
            var _this = this;
            return {
                dataSource: this._getDataSource(),
                argumentField: "dimensionValue",
                valueField: "measureValue",
                colorField: "dimensionColor",
                selectionMode: "multiple",
                label: {
                    customizeText: function (e) {
                        return e.item.data.dimensionDisplayText + ': ' + e.item.data.measureDisplayText;
                    },
                    position: this.getPropertyValue('labelPositionProperty').toLowerCase()
                },
                onItemClick: function (e) {
                    _this.setMasterFilter(e.item.data.clientDataRow);
                }
            };
        };

        this.setSelection = function () {
            var _this = this;
            this.dxFunnelWidget.getAllItems().forEach(function (item) {
                item.select(_this.isSelected(item.data.clientDataRow));
            });
        };

        this.clearSelection = function () {
            this.dxFunnelWidget.clearSelection();
        };

        this.setSize = function (width, height) {
            Object.getPrototypeOf(this).setSize.call(this, width, height);
            this.dxFunnelWidget.render();
        };

        this.renderContent = function ($element, changeExisting) {
            if (!changeExisting) {
                var element = $element.jquery ? $element[0] : $element;

                while(element.firstChild)
                    element.removeChild(element.firstChild);

                var div = document.createElement('div');
                element.appendChild(div);

                this.dxFunnelWidget = new dxFunnel(div, this._getDxFunnelWidgetSettings());
            } else {
                this.dxFunnelWidget.option(this._getDxFunnelWidgetSettings());
            }
        };
    }
    FunnelChartItemViewer.prototype = Object.create(Dashboard.CustomItemViewer.prototype);
    
    function FunnelChartItem(dashboardControl) {
        Dashboard.ResourceManager.registerIcon(svgIcon);

        this.name = "funnelChartCustomItem",
        this.metaData = funnelChartItemMetaData,
        this.createViewerItem = function (model, $element, content) {
            return new FunnelChartItemViewer(model, $element, content);
        }
    };
    
    return FunnelChartItem;
})();