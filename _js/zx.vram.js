var Vram = function (P_objTarget) {

    this.objTarget = P_objTarget;

    // Inizializza l'array che conterrà per ogni byte dello schermo (32x24) il carattere contenuto, il colore di
    // sfondo ed il colore di primo piano
    this.vram = new Array(); // Array da 0 a 767 (pari a una matrice 32 x 24) che contiene per ogni byte dello schermo
                            // il carattere contenuto, il colore di sfondo ed il colore di primo piano
    this.refresh_screen_end = -1;
    this.objPalette = new Palette();

    /**
     * Costruttore della "classe"
     */

    var nRiga = 0;
    var nColonna = 0;
    var cID = "";
    var cTemp = "";

    while (nRiga < 24) {
        nColonna = 0;
        while (nColonna < 32) {
            // Prepara il codice ID dell'elemento div da aggiungere
            //cID = "";
            //if (nColonna < 10) cID += "0";
            //cID += nColonna.toString();
            //if (nRiga < 10) cID += "0";
            //cID += nRiga.toString();
            // Aggiunge l'elemento div
            //cTemp += "<span id='" + cID + "' class='carattere'>" + String.fromCharCode(63 + nColonna) + "</span>";
            //$("#" + cID).on("hover", function () {
            //    $(this).toggleClass("highlight");
            //});
            // Inizializza anche nell'array il valore che avrà quel byte
            this.vram.push({
                "char": "&nbsp;",
                "foreground": this.objPalette.getColor(0),
                "background": this.objPalette.getColor(15)
            });
            // Passa alla colonna successiva
            nColonna += 1;
        }
        //cTemp += "<br />";
        // Passa alla riga successiva
        nRiga += 1;
    }

};


Vram.prototype = function() {

    // Proprietà e metodi privati

    /**
     * Restituisce il codice ID del div che contiene il byte-pixel specifico sullo schermo
     * @param P_nColonna    Colonna in cui si trova il pixel interessato
     * @param P_nRiga       Riga in cui si trova il pixel interessato
     * @return {*}          Una stringa contenente l'ID del div che contiene il byte-pixel
     */
     var getID = function(P_nColonna, P_nRiga) {

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
    var setPixel = function(P_nCol, P_nRow, P_cChar, P_nColor, P_nBackground) {

        // Se l'utente non specifica un colore di primo piano e uno di sfondo, utilizza
        // quelli impostati di default (nero su bianco)
        if (P_nColor == null) P_nColor = 0;
        if (P_nBackground == null) P_nBackground = 15;

        // Imposta il byte-pixel con questi valori
        var nPos = P_nRow * 32 + P_nCol;
        this.vram[nPos]["char"] = P_cChar;
        this.vram[nPos]["foreground"] = this.objPalette.getColor(P_nColor);
        this.vram[nPos]["background"] = this.objPalette.getColor(P_nBackground);

        if (nPos > this.refresh_screen_end) this.refresh_screen_end = nPos;

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
    var setText = function(P_nCol, P_nRow, P_cText, P_nColor, P_nBackground) {

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
            this.setPixel.call(this, P_nCol + nInd, P_nRow, acChars[nInd], P_nColor, P_nBackground);
            nInd += 1;
        }
    };

    /**
     * Pulisce la VRAM e, di conseguenza, lo schermo
     */
    var clearScreen = function() {
        var nRiga = 0;
        var nColonna = 0;
        while (nRiga < 24) {
            nColonna = 0;
            while (nColonna < 32) {
                this.setPixel.call(this, nColonna, nRiga, " ");
                nColonna += 1;
            }
            nRiga += 1;
        }
    };

    /**
     * Rinfresca lo schermo quando ce n'è bisogno
     */
    var refreshScreen = function () {

        var nRiga = 0;
        var nColonna = 0;
        var nPos;


        if (this.refresh_screen_end >= 0) {
            //console.time("Refresh schermo");
            var acHTML = [];
            while (nRiga < 24) {
                nColonna = 0;
                while (nColonna < 32) {
                    nPos = nRiga * 32 + nColonna;
                    //if (nPos <= zx_refresh_screen_end) {
                    if (this.vram[nPos]["char"] == "" || this.vram[nPos]["char"] == " ") {
                        this.vram[nPos]["char"] = "&nbsp;";
                    }
                    acHTML += "<span style='color: " + this.vram[nPos]["foreground"] +
                        "; background-color: " + this.vram[nPos]["background"] +
                        ";'>" + this.vram[nPos]["char"] + "</span>";
                    nColonna += 1;
                }
                acHTML += "<br />";
                nRiga += 1;
            }
            $(this.objTarget).html(acHTML);
            //console.timeEnd("Refresh schermo");
            // Reimposta il valore di zx_refresh_screen_end, così se al prossimo ciclo non ci dovessero essere dei
            // byte-pixel da modificare, non eseguirà questo ciclo e quindi perderà meno tempo
            zx.refresh_screen_end = -1;
        }
    };

    // Metodi pubblici
    return {
        getID: getID,
        setPixel: setPixel,
        setText: setText,
        clearScreen: clearScreen,
        refreshScreen: refreshScreen
    }

}();