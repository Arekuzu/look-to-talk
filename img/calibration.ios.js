var PointCalibrate = 0;
var CalibrationPoints={};
var helpModal;


function ClearCanvas(){
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.setProperty('display', 'none');
  });
  var canvas = document.getElementById("plotting_canvas");
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function PopUpInstruction(){
  ClearCanvas();
  swal({
    title:"Calibraci�n Inicial",
    text: "Haz clic en cada uno de los 9 puntos de la pantalla, haciendo clic en cada punto 5 veces mientras lo miras fijamente hasta que cambie de color a amarillo. Esto calibrar� tu campo visual seg�n el tama�o de la pantalla de tu dispositivo.",
    buttons:{
      cancel: false,
      confirm: true
    }
  }).then(isConfirm => {
    ShowCalibrationPoint();
  });

}

function helpModalShow() {
    if(!helpModal) {
        helpModal = new bootstrap.Modal(document.getElementById('helpModal'))
    }
    helpModal.show();
}

function calcAccuracy() {
    swal({
        title: "Calibraci�n Final",
        text: "No mueva el mouse y mire el punto central durante los pr�ximos 5 segundos. Esto nos permitir� calcular la exactitud del Sistema.",
        closeOnEsc: false,
        allowOutsideClick: false,
        closeModal: true
    }).then( () => {
   
        store_points_variable(); 
    
        sleep(5000).then(() => {
                stop_storing_points_variable(); // stop storing the prediction points
                var past50 = webgazer.getStoredPoints(); // retrieve the stored points
                var precision_measurement = calculatePrecision(past50);
                var accuracyLabel = "<a>Exactitud | "+precision_measurement+"%</a>";
                document.getElementById("Accuracy").innerHTML = accuracyLabel; 
                swal({
                    title: "La precisi�n de Look to Talk es de " + precision_measurement + "%",
                    allowOutsideClick: false,
                    buttons: {
                        cancel: "Recalibrar",
                        confirm: true,
                    }
                }).then(isConfirm => {
                        if (isConfirm){
                            //clear the calibration & hide the last middle button
                            ClearCanvas();
                        } else {
                            //use restart function to restart the calibration
                            document.getElementById("Accuracy").innerHTML = "<a>No Calibrado</a>";
                            webgazer.clearData();
                            ClearCalibration();
                            ClearCanvas();
                            ShowCalibrationPoint();
                        }
                });
        });
    });
}

function calPointClick(node) {
    const id = node.id;

    if (!CalibrationPoints[id]){ // initialises if not done
        CalibrationPoints[id]=0;
    }
    CalibrationPoints[id]++; // increments values

    if (CalibrationPoints[id]==5){ //only turn to yellow after 5 clicks
        node.style.setProperty('background-color', 'yellow');
        node.setAttribute('disabled', 'disabled');
        PointCalibrate++;
    }else if (CalibrationPoints[id]<5){
        //Gradually increase the opacity of calibration points when click to give some indication to user.
        var opacity = 0.2*CalibrationPoints[id]+0.2;
        node.style.setProperty('opacity', opacity);
    }

    if (PointCalibrate == 8){
        document.getElementById('Pt5').style.removeProperty('display');
    }

    if (PointCalibrate >= 9){ 
        document.querySelectorAll('.Calibration').forEach((i) => {
            i.style.setProperty('display', 'none');
        });
        document.getElementById('Pt5').style.removeProperty('display');
        var canvas = document.getElementById("plotting_canvas");
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        calcAccuracy();
    }
}

function docLoad() {
  ClearCanvas();
  helpModalShow();
    
  // click event on the calibration buttons
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.addEventListener('click', () => {
      calPointClick(i);
    });
  });

  // click event on the cards
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {

    });
  });


const cards = document.querySelectorAll('.card');
const duration = 1500;
let currentCard = 0;
let elapsedTimeInQuadrant = 0; // Nuevo contador de tiempo para el cuadrante
const utterance = new SpeechSynthesisUtterance();
let previousMessage = null; // Variable para almacenar el mensaje previamente hablado

webgazer.setGazeListener((data, elapsedTime) => {
  if (data == null) {
    speechSynthesis.cancel();
    previousMessage = null;
    return;
  }

  const card = cards[currentCard];
  const quadrants = card.querySelectorAll('.quadrant');
  quadrants.forEach((quadrant, index) => {
    const rect = quadrant.getBoundingClientRect();
    if (
      data.x > rect.left &&
      data.x < rect.right &&
      data.y > rect.top &&
      data.y < rect.bottom
    ) {
      // Incrementar el contador de tiempo en el cuadrante
      elapsedTimeInQuadrant += 100; // Asumiendo que la funci�n se llama cada 100 ms

      if (elapsedTimeInQuadrant >= duration) {
        const changeToCard = quadrant.getAttribute('change');
        if (changeToCard) {
          const targetCard = document.getElementById(changeToCard);
          if (targetCard) {
            currentCard = Array.from(cards).indexOf(targetCard);
            showCurrentCard();
          }
        } else if (speechSynthesisEnabled) { // Verifica si la s�ntesis de voz est� habilitada
          const currentMessage = quadrant.getAttribute('messaje');
          if (currentMessage !== previousMessage) {
            utterance.text = currentMessage;
            speechSynthesis.speak(utterance);
            previousMessage = currentMessage;

            // Agregar un registro en la consola
            console.log(`Mensaje: "${currentMessage}" hablado despu�s de ${elapsedTimeInQuadrant} ms.`);
          }
        }
      }
    } else {
      // Resetear el contador de tiempo cuando el usuario mira hacia otro lugar
      elapsedTimeInQuadrant = 0;
    }
  });

  const faceFeedbackBox = document.getElementById('webgazerFaceFeedbackBox');
  const warningLayer = document.getElementById('warningLayer');
  if (faceFeedbackBox.style.borderColor === 'red' || faceFeedbackBox.style.borderColor === 'black') {
    warningLayer.style.display = 'block';
  } else {
    warningLayer.style.display = 'none';
  }
}).begin();

  function showCurrentCard() {
    cards.forEach((card, index) => {
      if (index === currentCard) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  showCurrentCard();
}

window.addEventListener('load', docLoad);
// codigo original


function ShowCalibrationPoint() {
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.removeProperty('display');
  });
  document.getElementById('Pt5').style.setProperty('display', 'none');
}

function ClearCalibration(){
  document.querySelectorAll('.Calibration').forEach((i) => {
    i.style.setProperty('background-color', 'red');
    i.style.setProperty('opacity', '0.2');
    i.removeAttribute('disabled');
  });

  CalibrationPoints = {};
  PointCalibrate = 0;
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}