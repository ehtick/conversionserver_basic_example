var csManagerClient = null;

function msready() {

  setTimeout(function () {

    var newheight = $("#content").height() - 40;
    $("#content").css("top", "40px");
    $("#content").css({ "height": newheight + "px" });

    var op = hwv.operatorManager.getOperator(Communicator.OperatorId.Orbit);
    op.setOrbitFallbackMode(Communicator.OrbitFallbackMode.CameraTarget);

    hwv.view.setAmbientOcclusionEnabled(true);

    csManagerClient = new CsManagerClient();
    
    csManagerClient.initialize();


  }, 10);
}

function setupApp() {

  hwv.setCallbacks({
    modelStructureReady: msready,
  });

  mainUI = new MainUI();
  mainUI.registerSideBars("sidebar_models",450);
}

