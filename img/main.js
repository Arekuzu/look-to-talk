window.onload = async function() {

    await webgazer.setRegression('ridge') 
        .setGazeListener(function(data, clock) {
        })
        .saveDataAcrossSessions(true)
        .begin();
        webgazer.showVideoPreview(true) 
            .showPredictionPoints(true) 
            .applyKalmanFilter(true); 

    var setup = function() {
        var canvas = document.getElementById("plotting_canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'fixed';
    };
    setup();

};

window.saveDataAcrossSessions = true;
window.onbeforeunload = function() {
    webgazer.end();
}

function Restart(){
    document.getElementById("Accuracy").innerHTML = "<a>No Calibrado</a>";
    webgazer.clearData();
    ClearCalibration();
    PopUpInstruction();
}