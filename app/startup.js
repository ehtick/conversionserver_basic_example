function msready() {

  // $("#content").css("top", "0px");
  setTimeout(function () {

    var newheight = $("#content").height() - 40;
    $("#content").css("top", "40px");
    $("#content").css({ "height": newheight + "px" });

    var op = hwv.operatorManager.getOperator(Communicator.OperatorId.Orbit);
    op.setOrbitFallbackMode(Communicator.OrbitFallbackMode.CameraTarget);

    hwv.view.setAmbientOcclusionEnabled(true);

    CsManagerClient.msready();

  }, 10);
}

function setupApp() {

  hwv.setCallbacks({
    modelStructureReady: msready,
  });

  var viewermenu = [   
    {
      name: 'Refresh',
      fun: async function () {
        csManagerClient.checkForNewModels();
      }
    },
  ];

  $('#viewermenu1button').contextMenu("menu", viewermenu, {
    'displayAround': 'trigger',
    verAdjust: 45,
    horAdjust: -35
  });

  mainUI = new MainUI();
  mainUI.registerSideBars("sidebar_models",450);
}

