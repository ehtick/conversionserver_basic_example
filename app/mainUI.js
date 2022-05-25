var mainUI;

class MainUI {

    
    constructor() {

        this.sideBars = [];

    }

    registerSideBars(div,width, callback) {
        this.sideBars[div] = {width:width, expanded:false, callback:callback};
    }

    collapseAll() {
        for (var i in this.sideBars)
        {
            $("#" + i).css({ "display": "none" });  
            this.sideBars[i].expanded = false;
       
        }

    }
    
    toggleExpansion(div){
        var sidebar = this.sideBars[div];
        if (!sidebar.expanded)
        {
            this.collapseAll();
            $("#content").css("margin-left", ""); 
            $("#content").css({ "width": "" });
            
            $("#" + div).css({ "display": "block" });         
            $("#" + div).css({ "width": sidebar.width + "px" });         
            var newwidth = $("#content").width() - (sidebar.width + 50);

            $("#content").css("margin-left", (sidebar.width + 50) + "px"); 
            $("#content").css({ "width": newwidth + "px" });
            sidebar.expanded = true;

        }
        else
        {
            this.collapseAll();
            $("#content").css("margin-left", ""); 
            $("#content").css({ "width": "" });
            sidebar.expanded = false;
        }
        if (sidebar.callback)
            sidebar.callback(sidebar.expanded);

        ui._toolbar.reposition();
        hwv.resizeCanvas();
    }

}