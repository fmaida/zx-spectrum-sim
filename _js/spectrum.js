var zx_vram;    // Array da 0 a 767 (pari a una matrice 32 x 24) che contiene per ogni byte dello schermo
                // il carattere contenuto, il colore di sfondo ed il colore di primo piano
var zx_refresh_border = false;  // Valore booleano che indica al programma se deve aggiornare il bordo dello schermo
var zx_refresh_screen_end;
var zx_border_color = "";   // Valore che indica il colore dello schermo, solitamente espresso nel formato #RRGGBB.
                            // Può anche contenere l'URL a una GIF Animata che simula il caricamento da nastro.
var zx_palette = new Array("#000000", "#0000c0", "#c00000", "#c000c0",  // Palette approssimativa dei colori
                           "#00c000", "#00c0c0", "#c0c000", "#c0c0c0",  // disponibili su di un vero ZX Spectrum
                           "#000000", "#0000ff", "#ff0000", "#ff00ff",
                           "#00ff00", "#00ffff", "#ffff00", "#ffffff");
var zx_mainCounter = 0; // Contatore
var zx_loopStillWorking = false;    // Valore booleano che indica se la precedente operazione è ancora in corso.
                                    // Viene utilizzato durante il refresh della pagina per assicurarsi prima di
                                    // cominciare che il precedente refresh sia terminato.

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

    // Inizializza l'array che conterrà per ogni byte dello schermo (32x24) il carattere contenuto, il colore di
    // sfondo ed il colore di primo piano
    zx_vram = new Array();
    zx_refresh_screen_end = -1;
    // Abbina all'evento di ridimensionamento della finestra la funzione che ridimensiona gli oggetti sullo schermo,
    // quindi la invoca subito per ridimensionare gli oggetti
    $(window).resize(function() {
        ridimensionaFinestra();
    });
    $(window).trigger("resize");
    // Inizia a creare 768 piccoli div che ospiteranno i byte necessari a riprodurre lo schermo dello ZX Spectrum.
    // Questi 768 div sullo schermo appariranno in 24 righe da 32 elementi (risoluzione testo 32x24, esattamente
    // come quella del vero ZX Spectrum
    var nRiga = 0;
    var nColonna = 0;
    var cID = "";
    while (nRiga < 24) {
        nColonna = 0;
        while (nColonna < 32) {
            // Prepara il codice ID dell'elemento div da aggiungere
            cID = "";
            if (nColonna < 10) cID += "0";
            cID += nColonna.toString();
            if (nRiga < 10) cID += "0";
            cID += nRiga.toString();
            // Aggiunge l'elemento div
            $("#zx_spectrum").append("<div id='" + cID + "' class='carattere'>" + String.fromCharCode(63 + nColonna) + "</div>");
            //$("#" + cID).on("hover", function () {
            //    $(this).toggleClass("highlight");
            //});
            // Inizializza anche nell'array il valore che avrà quel byte
            zx_vram.push({"char": "&nbsp;", "foreground": "#000", "background": "#fff"});
            // Passa alla colonna successiva
            nColonna += 1;
        }
        // Passa alla riga successiva
        nRiga += 1;
    }
    /* Imposta il loop principale che rinfrescherà lo schermo */
    setLoopPrincipale();

    //$.setText(0, 0, "01234567890123456789012345678901");
    $.setText(0, 22, "      -= START THE TAPE =-      ", 15, 0);
    $.setBorder(13);
    $.simulaInizioCaricamento(0, "KAIKO.it");
    $.scriviPagina(6000, "Benvenuti nel mio sito internet!\ne\' un piacere avervi qui, anche se a dire la verita\' non ho ancora\navuto modo di preparare molto da farvi vedere! per cui vi dovrete accontentare suppongo...");
    $.simulaTermineCaricamento(10000, false);
}

/**
 * Imposta il loop principale che rinfrescherà lo schermo a 8fps
 */
function setLoopPrincipale() {
    var zx_timerLoop = setInterval(function() {
        if (!zx_loopStillWorking) {
            zx_loopStillWorking = true;
            refreshSchermo();
            if (zx_refresh_border) {
                $("html").css("background", zx_border_color);
                zx_refresh_border = false;
            }
            zx_mainCounter += 1;
            zx_loopStillWorking = false;
        }
    }, 125); // Refresh a 8fps
}

/**
 * Restituisce il codice ID del div che contiene il byte-pixel specifico sullo schermo
 * @param P_nColonna    Colonna in cui si trova il pixel interessato
 * @param P_nRiga       Riga in cui si trova il pixel interessato
 * @return {*}          Una stringa contenente l'ID del div che contiene il byte-pixel
 */
$.getID = function(P_nColonna, P_nRiga) {

    var cID = "#";

    if (P_nColonna < 10) cID += "0";
    cID += P_nColonna.toString();
    if (P_nRiga < 10) cID += "0";
    cID += P_nRiga.toString();

    return $(cID);

};

/**
 * Imposta uno specifico byte-pixel sullo schermo, in base alla posizione
 * @param P_nCol            Colonna in cui si trova il byte-pixel da modificare
 * @param P_nRow            Riga in cui si trova il byte-pixel da modificare
 * @param P_cChar           Carattere da inserire nel byte-pixel
 * @param P_nColor          Colore di primo piano da utilizzare
 * @param P_nBackground     Colore di sfondo da utilizzare
 */
$.setPixel = function(P_nCol, P_nRow, P_cChar, P_nColor, P_nBackground) {

    // Se l'utente non specifica un colore di primo piano e uno di sfondo, utilizza
    // quelli impostati di default (nero su bianco)
    if (P_nColor == null) P_nColor = 0;
    if (P_nBackground == null) P_nBackground = 15;

    // Imposta il byte-pixel con questi valori
    var nPos = P_nRow * 32 + P_nCol;
    zx_vram[nPos]["char"] = P_cChar;
    zx_vram[nPos]["foreground"] = zx_palette[P_nColor];
    zx_vram[nPos]["background"] = zx_palette[P_nBackground];

    if (nPos > zx_refresh_screen_end) zx_refresh_screen_end = nPos;

};

/**
 * Cambia il colore del bordo dello schermo
 *
 * @param P_nColore     Codice del colore (da 0 a 15) da utilizzare per colorare il bordo dello schermo.
 *                      Se è -1 visualizza una GIF animata che simula il caricamento da nastro.
 */
$.setBorder = function(P_nColore) {
    if (P_nColore >= 0) {
        zx_border_color = zx_palette[P_nColore];
    } else {
        zx_border_color = zx_palette[5] + " url(_img/background_loading.gif) repeat left top";
    }
    zx_refresh_border = true;
};

/**
 * Scrive del testo sullo schermo a partire da una certa colonna e da una certa riga
 *
 * @param P_nCol            Colonna da cui iniziare a scrivere il testo
 * @param P_nRow            Riga da cui iniziare a scrivere il testo
 * @param P_cText           Testo da scrivere
 * @param P_nColor          Colore di primo piano da utilizzare per il testo
 * @param P_nBackground     Colore di sfondo da utilizzare per il testo
 */
$.setText = function(P_nCol, P_nRow, P_cText, P_nColor, P_nBackground) {

    // Se l'utente non specifica un colore di primo piano e uno di sfondo, utilizza
    // quelli impostati di default (nero su bianco)
    if (P_nColor == null) P_nColor = 0;
    if (P_nBackground == null) P_nBackground = 15;

    // Spezza la stringa contenente il testo in un array con tanti caratteri
    var acChars = P_cText.split("");
    // Inizia a modificare la VRAM un byte alla volta. Al prossimo refresh dello schermo (comandato dalla funzione
    // "refreshSchermo" la scritta apparirà sullo schermo)
    var nInd = 0;
    while (nInd < acChars.length) {
        $.setPixel(P_nCol + nInd, P_nRow, acChars[nInd], P_nColor, P_nBackground);
        nInd += 1;
    }
};

/**
 * Pulisce la VRAM e, di conseguenza, lo schermo
 */
$.clearScreen = function() {
    var nRiga = 0;
    var nColonna = 0;
    while (nRiga < 24) {
        nColonna = 0;
        while (nColonna < 32) {
            $.setPixel(nColonna, nRiga, " ");
            nColonna += 1;
        }
        nRiga += 1;
    }
};

/**
 * Attende un certo numero di millisecondi e quindi esegue una funzione.
 * Non funziona troppo bene. Perlomeno non funziona ancora come io vorrei...
 *
 * @param P_nCicli      Tempo in millisecondi da attendere
 * @param P_funzione    Funzione da eseguire al termine dell'attesa
 * @return {Number}     Restituisce l'handler alla funzione di timer
 */
$.wait = function(P_nCicli, P_funzione) {
    return setTimeout(P_funzione, P_nCicli);
};

$.scriviPagina = function(P_nRitardo, P_cPagina) {

    var cRighe = P_cPagina.split("\n");
    var nInd = 0;

    while (nInd < cRighe.length) {
        var s = "$.writeText(0, " + nInd + ", '" + cRighe[nInd] + "');";
        $.wait(P_nRitardo + nInd * 500, "$.setText(0, " + nInd + ", '" + cRighe[nInd] + "');");
        nInd += 1;
    }

};

$.simulaInizioCaricamento = function(P_nRitardo, P_cNomeFile) {
    $.wait(P_nRitardo, "$.setBorder(5)");
    $.wait(P_nRitardo + 600, "$.setBorder(2)");
    $.wait(P_nRitardo + 1200, "$.setBorder(5)");
    $.wait(P_nRitardo + 1400, "$.setBorder(2)");
    $.wait(P_nRitardo + 1600, "$.setBorder(-1)");
    $.wait(P_nRitardo + 2400, "$.setBorder(2)");
    $.wait(P_nRitardo + 2400, "$.setText(0, 1, 'Program: " + P_cNomeFile + "');");
    $.wait(P_nRitardo + 3000, "$.setBorder(5)");
    $.wait(P_nRitardo + 3400, "$.setBorder(2)");
    $.wait(P_nRitardo + 4000, "$.setBorder(5)");
    $.wait(P_nRitardo + 4100, "$.setBorder(2)");
    $.wait(P_nRitardo + 4200, "$.setBorder(-1)");
};

$.simulaTermineCaricamento = function(P_nRitardo, P_lCaricamentoABuonFine) {
    $.wait(P_nRitardo, "$.setBorder(2)");
    if (P_lCaricamentoABuonFine) {
        $.wait(P_nRitardo + 100, "$.setBorder(0)");
        $.wait(P_nRitardo + 300, "$.setBorder(15)");
        $.wait(P_nRitardo + 300, "$.clearScreen()");
    } else {
        $.wait(P_nRitardo + 100, "$.setBorder(15)");
        $.wait(P_nRitardo + 100, "$.setText(0, 22, '                                ');");
        $.wait(P_nRitardo + 100, "$.setText(0, 23, 'R Tape loading error, 0:1');");
    }
};

/**
 * Rinfresca lo schermo quando ce n'è bisogno
 */
function refreshSchermo() {

    var nRiga = 0;
    var nColonna = 0;
    var nPos;


    if (zx_refresh_screen_end >= 0) {
    while (nRiga < 24) {
        nColonna = 0;
        while (nColonna < 32) {
            nPos = nRiga * 32 + nColonna;
            //if (nPos <= zx_refresh_screen_end) {
                if (zx_vram[nPos]["char"] == "" || zx_vram[nPos]["char"] == " ") {
                    zx_vram[nPos]["char"] = "&nbsp;";
                }
                $.getID(nColonna, nRiga).html(zx_vram[nPos]["char"]);
                $.getID(nColonna, nRiga).css({
                    "color": zx_vram[nPos]["foreground"],
                    "background-color": zx_vram[nPos]["background"]
                });
            //}
            nColonna += 1;
        }
        nRiga += 1;
    }
        // Reimposta il valore di zx_refresh_screen_end, così se al prossimo ciclo non ci dovessero essere dei
        // byte-pixel da modificare, non eseguirà questo ciclo e quindi perderà meno tempo
        zx_refresh_screen_end = -1;
    }
    //$(".carattere").html("-");
}




$.fn.writeText = function(content) {
    content = content.replace("\p", "\p\p\p\p\p\p\p\p\p\p\p\p\p\p\p\p\p\p\p\p\p\p\p\p");
    this.html("");
    var contentArray = content.split(""),
        current = 0,
        elem = this;
    var nLampeggi = 64;
    var nConteggioLampeggi = 0;
    var cCarattere;
    var gigio = setInterval(function() {
        if(current < contentArray.length) {
            if ((contentArray[current] == "\n")) contentArray[current] = "<br />";
            if ((contentArray[current] == "\p")) contentArray[current] = "";
            elem.html(elem.html().substr(0, elem.html().length - 1) + contentArray[current] + "&#216;");
            current++;
        } else {
            nConteggioLampeggi -= 1;
            if (nConteggioLampeggi < 0) {
                cCarattere == "&#216;" ? cCarattere = " " : cCarattere = "&#216;";
                nConteggioLampeggi = 8;
            }
            elem.html(elem.html().substr(0, elem.html().length - 1) + cCarattere);
            nLampeggi -= 1;
            if (nLampeggi == 0) {
                //elem.html(elem.html().substr(0, elem.html().length - 1));
                clearInterval(gigio);
            }
        }
    }, 33);
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