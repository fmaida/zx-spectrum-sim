// Quando il documento è pronto
$(document).ready(function () {

    inizializza();
    //$("body").writeText("Ciao a tutti, belli e brutti!\p\nIl mio nome e' Francesco e vivo a Venezia.\n\nScegli un opzione:\n=================\n\n1. METTITI A DIETA\n2. FAI DELLA GINNASTICA\n3. SPARATI UN COLPO")

});

// -=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-=-_-=-

/**
 * Inizializza le variabili e si prepara a simulare uno ZX Spectrum per offrire il sito internet in maniera originale
 */
function inizializza() {

    // Abbina all'evento di ridimensionamento della finestra la funzione che ridimensiona gli oggetti sullo schermo,
    // quindi la invoca subito per ridimensionare gli oggetti
    $(window).resize(function() {
        ridimensionaFinestra();
    });
    $(window).trigger("resize");

    /* Imposta il loop principale che rinfrescherà lo schermo */
    zx.init("#zx_spectrum");

    //$.setText(0, 0, "01234567890123456789012345678901");
    zx.objVRAM.setText(0, 22, "      -= START THE TAPE =-      ", 15, 0);
    zx.objBorder.setBorder(13);
    $.simulaInizioCaricamento(0, "KAIKO.it");
    zx.setBorder(1000, -1);
    $.scriviPagina("Benvenuti nel mio sito internet!\ne un piacere avervi qui, anche\nse a dire la verita non ho ancora\navuto modo di preparare molto da farvi vedere! per cui vi dovrete accontentare suppongo...");
    $.simulaTermineCaricamento(false);

}

/**
 * QUELLO CHE SEGUE E' DEPRECATO
 *
 */
$.scriviPagina = function(P_cPagina) {

    var cRighe = P_cPagina.split("\n");
    var cRiga;
    var nInd = 0, nInd2 = 0;

    while (nInd < cRighe.length) {
        cRiga = cRighe[nInd];
        nInd2 = 0;
        while (nInd2 < cRiga.length) {
            zx.setText(100, nInd2, nInd, cRiga.charAt(nInd2));
            nInd2 += 1;
        }
        nInd += 1;
    }

};

$.simulaInizioCaricamento = function(P_nRitardo, P_cNomeFile) {
    zx.setBorder(0, 5);
    zx.setBorder(600, 2);
    zx.setBorder(600, 5);
    zx.setBorder(200, 2);
    zx.setBorder(200, -1);
    zx.setBorder(800, 2);
    zx.setText(0, 0, 1, "Program: " + P_cNomeFile); // 2400
    zx.setBorder(600, 5);
    zx.setBorder(400, 2);
    zx.setBorder(600, 5);
    zx.setBorder(100, 2);
    zx.setBorder(100, -1);
};

$.simulaTermineCaricamento = function(P_lCaricamentoABuonFine) {
    zx.setBorder(0, 2);
    if (P_lCaricamentoABuonFine) {
        zx.setBorder(100, 0);
        zx.setBorder(200, 15);
        zx.clearScreen(300);
    } else {
        zx.setBorder(100, 15);
        zx.setText(0, 0, 22, "                                ");
        zx.setText(0, 0, 23, "R Tape loading error, 0:1       ");
    }
};

/**
 * Ridimensiona tutti gli oggetti sullo schermo in base alla dimensione attuale della finestra, in modo che
 * appaiano sempre in proporzione corretta
 */
function ridimensionaFinestra() {

    var nLarghezza = $(document).width();
    var nAltezza = $(document).height();
    var nDimensione;

    // In base alla dimensione della finestra, decide qual'è il lato più piccolo fra altezza e larghezza
    // della finestra. Deciso quello fissa in proporzione la dimensione del font. Tutto il resto è definito
    // nel file CSS sotto forma di elementi "em", perciò seguiranno in proporzione le dimensioni del font.
    // Utilizzo l'operatore ternario: [condizione] ? [Se è vera] : [Se è falsa]
    nAltezza < nLarghezza ? nDimensione = Math.floor(nAltezza / 30) : nDimensione = Math.floor(nLarghezza / 38);
    $("html").css("font-size", nDimensione);
    //$("#zx_spectrum").width(nDimensione * 30);
    //$("#zx_spectrum").height(nDimensione * 38);
}