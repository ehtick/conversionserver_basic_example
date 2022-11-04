const serveraddress = "https://csapi.techsoft3d.com";
//const serveraddress = "http://localhost:3001";
var globalSessionId;

class CsManagerClient {

   

    constructor() {
        this._updatedTime = undefined;
        this._modelHash = [];
     
    }

    initialize() {
        let myDropzone;

        myDropzone = new Dropzone("div#dropzonearea", { url: serveraddress + "/api/upload", timeout: 180000 });
        myDropzone.on("success", async function (file, response) {
            myDropzone.removeFile(file);
        });
        myDropzone.on("sending", async function (file, response, request) {

            let api_arg = { startPath: $("#modelpath").val() };

            if ($("#itemidspan").val() != "") {                
                api_arg.itemid = $("#itemidspan").val();
            }

            response.setRequestHeader('CS-API-Arg', JSON.stringify(api_arg));
            console.log("reached");
        });

        var _this = this;
        setInterval(async function () {
            await _this.checkForNewModels();
        }, 1000);

    }

    showUploadWindow() {
        $("#filedroparea").css("display", "block");
    }

    hideUploadWindow() {
        $("#filedroparea").css("display", "none");
    }

    async checkForNewModels() {
        var _this = this;

        let res = await fetch(serveraddress + '/api/updated');
        var data = await res.json();

        var newtime = Date.parse(data.lastUpdated);
        if (this._updatedTime == undefined || this._updatedTime != newtime)
        {
            let res = await fetch(serveraddress + '/api/items');
            let data = await res.json();
            this._updatedTime = newtime;
            await this._updateModelList(data.itemarray);
        }
    }

    async _updateModelList(data) {
      
        for (var i = 0; i < data.length; i++) {
            var part;
            var file = data[i].name.split(".")[0];
            if (data[i].conversionState == "SUCCESS" ) {

                let image = await fetch(serveraddress + '/api/file/' + data[i].storageID + "/" + "png");

                if (image && image.status == 200) {
                    let imageblob = await image.blob();
                    let urlCreator = window.URL || window.webkitURL;
                    part = urlCreator.createObjectURL(imageblob);
                }
                else {
                    part = "app/images/spinner.gif";
                }                
            }
            else
                part = "app/images/spinner.gif";

            if (part) {
                if (!this._modelHash[data[i].storageID]) {
                    this._modelHash[data[i].storageID] = { nodeid: null, name: data[i].name, tree: null, image: part, created: data[i].created };
                }
                this._modelHash[data[i].storageID].image = part;
            }
        }
        this._drawModelList("sidebar_modellist");
    }

    async _drawModelList(targetdiv) {

        $("[id^=modelmenubutton]").each(function (index) {
            $(this).contextMenu("destroy");
        });

        var html = "";
        $("#" + targetdiv).empty();
        html += '<button onclick=\'csManagerClient.showUploadWindow()\' class="userbutton usereditbutton"><i class="bx bx-upload"></i></button>';
        html += '<div style="top:40px;position:relative;">';

        for (var i in this._modelHash) {

            html += '<div id="' + i + '" class = "modelcard">';
            if (this._modelHash[i].image.indexOf("spinner.gif") != -1)
                html += '<img src="' + this._modelHash[i].image + '" class="modelcard_imagespinner"></img>';
            else
                html += '<img src="' + this._modelHash[i].image + '" class="modelcard_image"></img>';
            html += '<div class="modelcard_info">';
            html += '<span class="modelcard_title">' + this._modelHash[i].name + '</span><br>';

            if (this._modelHash[i].created)
                html += '<span class="modelcard_size">Created:' + moment(this._modelHash[i].created).format("MM/DD/YYYY h:mm:ss a") + '</span>';
            else
                html += '<span class="modelcard_size">Created:n/a</span>';
            
            html += '<br><span class="modelcard_size">ID:' + i + '</span>';                
            html += "</div>";
            html += '<label class="switch">';
            if (this._modelHash[i].nodeid) {
                html += '<input type="checkbox" checked onclick=\'csManagerClient.addModel(this,"' + i + '")\'><span class="slider round"></span></label>';
            }
            else
            {
                html += '<input type="checkbox" onclick=\'csManagerClient.addModel(this,"' + i + '")\'><span class="slider round"></span></label>';
            }
            html += '<button id="modelmenubutton_' + i + '" class="modelmenubutton"><i style="pointer-events:none" class="bx bx-dots-vertical"></i></button>';

            html += "</div>";
        }
        html += "</div>";

        $("#" + targetdiv).append(html);

        var viewermenu = [
            {
                name: 'Delete',
                fun: async function (item) {
                    //csManagerClient
                    var modelid = item.trigger[0].id.split("_")[1];

                    if (csManagerClient._modelHash[modelid].nodeid != null) {
                        hwv.model.deleteNode(csManagerClient._modelHash[modelid].nodeid);
                        csManagerClient._modelHash[modelid].nodeid = null;
                        csManagerClient._modelHash[modelid].tree.remove();
                    }
                    delete csManagerClient._modelHash[modelid];
                    await fetch(serveraddress + '/api/delete/' + modelid, { method: 'PUT'});

                }
            }
        ];

        $("[id^=modelmenubutton]").each(function (index) {
            $(this).contextMenu("menu", viewermenu, {
                'displayAround': 'trigger',
                'position': 'bottom',
                verAdjust: 0,
                horAdjust: 0
            });
        });

    }

    async addModel(o, modelid) {
        if (o.checked) {
            if (this._modelHash[modelid].nodeid == null) {


                // await fetch(serveraddress + '/api/enableStreamAccess/' + globalSessionId, { method: 'put', headers: { 'CS-API-Arg': JSON.stringify({subDirectory:"moto_parts" }), 'items': JSON.stringify(["dd727009-1ce4-4713-b652-30be1cae0d3d"]) } });
                // await fetch(serveraddress + '/api/enableStreamAccess/' + globalSessionId, { method: 'put', headers: { 'items': JSON.stringify(["7c9ccdcd-9fc0-4b74-8b39-d96c42202d3e"]) } });
                await fetch(serveraddress + '/api/enableStreamAccess/' + globalSessionId, { method: 'put', headers: { 'items': JSON.stringify([modelid]) } });
              
                var modelnode = hwv.model.createNode(modelid);
                var nodeids = await hwv.model.loadSubtreeFromModel(modelnode, this._modelHash[modelid].name);
                this._modelHash[modelid].nodeid = modelnode;
            }

        }
        else {           
            hwv.model.deleteNode(this._modelHash[modelid].nodeid);
            this._modelHash[modelid].nodeid = null;
        }
    }

    async _loadNewModel(modelid) {
        await hwv.model.clear();
        var res = await fetch(serveraddress + '/api/file/' +modelid + "/" + "scs");
        var ab = await res.arrayBuffer();
        var byteArray = new Uint8Array(ab);
        hwv.model.loadSubtreeFromScsBuffer(hwv.model.getRootNode(), byteArray);
    }

    async createEmpty() {

        let res = await fetch(serveraddress + '/api/create', { method: 'put',headers: { 'CS-API-Arg': JSON.stringify({itemname:"EmptyContainer" }) } });
        let resj = await res.json();
        $("#itemidspan").val(resj.itemid);
        
    }

}