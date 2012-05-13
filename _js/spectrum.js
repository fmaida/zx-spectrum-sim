
/**
 * Definisce la palette dello ZX Spectrum
 */
palette = function() {

    // Proprietà e metodi privati
    var colors = new Array("#000000", "#0000c0", "#c00000", "#c000c0",   // Palette approssimativa dei colori
                           "#00c000", "#00c0c0", "#c0c000", "#c0c0c0",  // disponibili su di un vero ZX Spectrum
                           "#000000", "#0000ff", "#ff0000", "#ff00ff",
                           "#00ff00", "#00ffff", "#ffff00", "#ffffff");

    var getColor = function(P_nColor) {
        if (P_nColor < 0 || P_nColor > 15) P_nColor = 0;
        return colors[P_nColor];
    };

    return {
        // Metodi pubblici
        getColor: getColor
    }

}();

/**
 * Definisce il bordo
 */
border = function () {

    // Proprietà e metodi privati
    var refresh = false,  // Booleano che indica se c'è la necessità di cambiare il colore del bordo
        color = "",       // Colore del bordo, solitamente espresso nella forma #RRGGBB

        /**
         * Restituisce il colore del bordo dello schermo
         *
         * @return {String}     Colore del bordo dello schermo, solitamente espresso nel formato #RRGGBB
         */
        getBorder = function() {
            return color;
        },

        /**
         * Cambia il colore del bordo dello schermo
         *
         * @param P_nColore     Codice del colore (da 0 a 15) da utilizzare per colorare il bordo dello schermo.
         *                      Se è -1 visualizza una GIF animata che simula il caricamento da nastro.
         */
        setBorder = function(P_nColore) {
            if (P_nColore >= 0) {
                color = zx.palette.getColor(P_nColore);
            } else {
                color = zx.palette.getColor(5) + " url(_img/background_loading.gif) repeat left top";
            }
            refresh = true;
        };

        return {
            // Metodi pubblici
            getBorder: getBorder,
            setBorder: setBorder
        }

}();

vram = function () {

    // Proprietà e metodi privati

    // Inizializza l'array che conterrà per ogni byte dello schermo (32x24) il carattere contenuto, il colore di
    // sfondo ed il colore di primo piano
    var vram = new Array(), // Array da 0 a 767 (pari a una matrice 32 x 24) che contiene per ogni byte dello schermo
                            // il carattere contenuto, il colore di sfondo ed il colore di primo piano

        refresh_screen_end = -1,

        loopStillWorking = false,    // Indica se il loop di RefreshSchermo sta ancora funzionando, per evitare che
                                     // si accavallino due richieste di refresh dello schermo

        /**
        * Restituisce il codice ID del div che contiene il byte-pixel specifico sullo schermo
        * @param P_nColonna    Colonna in cui si trova il pixel interessato
        * @param P_nRiga       Riga in cui si trova il pixel interessato
        * @return {*}          Una stringa contenente l'ID del div che contiene il byte-pixel
        */
        getID = function(P_nColonna, P_nRiga) {

            var cID = "#";

            if (P_nColonna < 10) cID += "0";
            cID += P_nColonna.toString();
            if (P_nRiga < 10) cID += "0";
            cID += P_nRiga.toString();

            return $(cID);

        },

        /**
        * Imposta uno specifico byte-pixel sullo schermo, in base alla posizione
        * @param P_nCol            Colonna in cui si trova il byte-pixel da modificare
        * @param P_nRow            Riga in cui si trova il byte-pixel da modificare
        * @param P_cChar           Carattere da inserire nel byte-pixel
        * @param P_nColor          Colore di primo piano da utilizzare
        * @param P_nBackground     Colore di sfondo da utilizzare
        */
        setPixel = function(P_nCol, P_nRow, P_cChar, P_nColor, P_nBackground) {

            // Se l'utente non specifica un colore di primo piano e uno di sfondo, utilizza
            // quelli impostati di default (nero su bianco)
            if (P_nColor == null) P_nColor = 0;
            if (P_nBackground == null) P_nBackground = 15;

            // Imposta il byte-pixel con questi valori
            var nPos = P_nRow * 32 + P_nCol;
            vram[nPos]["char"] = P_cChar;
            vram[nPos]["foreground"] = palette.getColor(P_nColor);
            vram[nPos]["background"] = palette.getColor(P_nBackground);

            if (nPos > refresh_screen_end) refresh_screen_end = nPos;

        },

        /**
        * Scrive del testo sullo schermo a partire da una certa colonna e da una certa riga
        *
        * @param P_nCol            Colonna da cui iniziare a scrivere il testo
        * @param P_nRow            Riga da cui iniziare a scrivere il testo
        * @param P_cText           Testo da scrivere
        * @param P_nColor          Colore di primo piano da utilizzare per il testo
        * @param P_nBackground     Colore di sfondo da utilizzare per il testo
        */
        setText = function(P_nCol, P_nRow, P_cText, P_nColor, P_nBackground) {

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
                setPixel(P_nCol + nInd, P_nRow, acChars[nInd], P_nColor, P_nBackground);
                nInd += 1;
            }
        },

        /**
         * Pulisce la VRAM e, di conseguenza, lo schermo
         */
        clearScreen = function() {
            var nRiga = 0;
            var nColonna = 0;
            while (nRiga < 24) {
                nColonna = 0;
                while (nColonna < 32) {
                    setPixel(nColonna, nRiga, " ");
                    nColonna += 1;
                }
                nRiga += 1;
            }
        };

        // Costruttore della "classe"
        var constructor = function() {

            var nRiga = 0;
            var nColonna = 0;
            var cID = "";
            var cTemp = "";

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
                    cTemp += "<span id='" + cID + "' class='carattere'>" + String.fromCharCode(63 + nColonna) + "</span>";
                    //$("#" + cID).on("hover", function () {
                    //    $(this).toggleClass("highlight");
                    //});
                    // Inizializza anche nell'array il valore che avrà quel byte
                    vram.push({"char": "&nbsp;", "foreground": "#000", "background": "#fff"});
                    // Passa alla colonna successiva
                    nColonna += 1;
                }
                cTemp += "<br />";
                // Passa alla riga successiva
                nRiga += 1;
            }

        }();

    return {
        // Metodi pubblici
        getID: getID,
        setPixel: setPixel,
        setText: setText,
        clearScreen: clearScreen
    }

}();


/**
 * Attende un certo numero di millisecondi e quindi esegue una funzione.
 * Non funziona troppo bene. Perlomeno non funziona ancora come io vorrei...
 *
 * @param P_nCicli      Tempo in millisecondi da attendere
 * @param P_funzione    Funzione da eseguire al termine dell'attesa
 * @return {Number}     Restituisce l'handler alla funzione di timer
 */
wait = function(P_nCicli, P_funzione) {
    return setTimeout(P_funzione, P_nCicli);
}();



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
    // Inizia a creare 768 piccoli div che ospiteranno i byte necessari a riprodurre lo schermo dello ZX Spectrum.
    // Questi 768 div sullo schermo appariranno in 24 righe da 32 elementi (risoluzione testo 32x24, esattamente
    // come quella del vero ZX Spectrum

    /* Imposta il loop principale che rinfrescherà lo schermo */
    setLoopPrincipale();

    //$.setText(0, 0, "01234567890123456789012345678901");
    vram.setText(0, 22, "      -= START THE TAPE =-      ", 15, 0);
    border.setBorder(13);
    $.simulaInizioCaricamento(0, "KAIKO.it");
    $.scriviPagina(6000, "Benvenuti nel mio sito internet!\ne\' un piacere avervi qui, anche se a dire la verita\' non ho ancora\navuto modo di preparare molto da farvi vedere! per cui vi dovrete accontentare suppongo...");
    $.simulaTermineCaricamento(10000, false);
}

/**
 * Imposta il loop principale che rinfrescherà lo schermo a 8fps
 */
function setLoopPrincipale() {
    var timerLoop = setInterval(function() {
        if (!zx.loopStillWorking) {
            zx.loopStillWorking = true;
            refreshSchermo();
            if (zx.border.refresh) {
                $("html").css("background", zx.border.color);
                zx.border.refresh = false;
            }
            zx.loopStillWorking = false;
        }
    }, 125); // Refresh a 8fps
}


$.scriviPagina = function(P_nRitardo, P_cPagina) {

    var cRighe = P_cPagina.split("\n");
    var nInd = 0;

    while (nInd < cRighe.length) {
        var s = "zx.writeText(0, " + nInd + ", '" + cRighe[nInd] + "');";
        zx.wait(P_nRitardo + nInd * 500, "zx.setText(0, " + nInd + ", '" + cRighe[nInd] + "');");
        nInd += 1;
    }

};

$.simulaInizioCaricamento = function(P_nRitardo, P_cNomeFile) {
    zx.wait(P_nRitardo, "zx.border.setBorder(5)");
    zx.wait(P_nRitardo + 600, "zx.border.setBorder(2)");
    zx.wait(P_nRitardo + 1200, "zx.border.setBorder(5)");
    zx.wait(P_nRitardo + 1400, "zx.border.setBorder(2)");
    zx.wait(P_nRitardo + 1600, "zx.border.setBorder(-1)");
    zx.wait(P_nRitardo + 2400, "zx.border.setBorder(2)");
    zx.wait(P_nRitardo + 2400, "zx.setText(0, 1, 'Program: " + P_cNomeFile + "');");
    zx.wait(P_nRitardo + 3000, "zx.border.setBorder(5)");
    zx.wait(P_nRitardo + 3400, "zx.border.setBorder(2)");
    zx.wait(P_nRitardo + 4000, "zx.border.setBorder(5)");
    zx.wait(P_nRitardo + 4100, "zx.border.setBorder(2)");
    zx.wait(P_nRitardo + 4200, "zx.border.setBorder(-1)");
};

$.simulaTermineCaricamento = function(P_nRitardo, P_lCaricamentoABuonFine) {
    zx.wait(P_nRitardo, "zx.border.setBorder(2)");
    if (P_lCaricamentoABuonFine) {
        zx.wait(P_nRitardo + 100, "zx.border.setBorder(0)");
        zx.wait(P_nRitardo + 300, "zx.border.setBorder(15)");
        zx.wait(P_nRitardo + 300, "zx.clearScreen()");
    } else {
        zx.wait(P_nRitardo + 100, "zx.border.setBorder(15)");
        zx.wait(P_nRitardo + 100, "zx.setText(0, 22, '                                ');");
        zx.wait(P_nRitardo + 100, "zx.setText(0, 23, 'R Tape loading error, 0:1');");
    }
};

/**
 * Rinfresca lo schermo quando ce n'è bisogno
 */
function refreshSchermo() {

    var nRiga = 0;
    var nColonna = 0;
    var nPos;


    if (zx.refresh_screen_end >= 0) {
        //console.time("Refresh schermo");
        var acHTML = [];
        while (nRiga < 24) {
            nColonna = 0;
            while (nColonna < 32) {
                nPos = nRiga * 32 + nColonna;
                //if (nPos <= zx_refresh_screen_end) {
                    if (zx.vram[nPos]["char"] == "" || zx.vram[nPos]["char"] == " ") {
                        zx.vram[nPos]["char"] = "&nbsp;";
                    }
                    acHTML += "<span style='color: " + zx.vram[nPos]["foreground"] +
                              "; background-color: " + zx.vram[nPos]["background"] +
                              ";'>" + zx.vram[nPos]["char"] + "</span>";
                nColonna += 1;
            }
            acHTML += "<br />";
            nRiga += 1;
        }
        $("#zx_spectrum").html(acHTML);
        //console.timeEnd("Refresh schermo");
        // Reimposta il valore di zx_refresh_screen_end, così se al prossimo ciclo non ci dovessero essere dei
        // byte-pixel da modificare, non eseguirà questo ciclo e quindi perderà meno tempo
        zx.refresh_screen_end = -1;
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