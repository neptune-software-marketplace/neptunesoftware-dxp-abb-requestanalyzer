sap.ui.getCore().attachInit(function (startParams) {

    PanStats.addContent(ToolTopUrl);
    
    apiGetRequestFiles().then(function (res) {
        modelTabFiles.setData(res);
    });

    // Single field sorting
    const sorter = new sap.ui.model.Sorter("name", true, false);
    const binding = TabFiles.getBinding("items");
    binding.sort(sorter);

});
