/**
 * Namespace definition
 * @type {*}
 */
var zx = {

init: function(P_cTarget) {

    this.objTarget = $(P_cTarget);
    this.delay = 0;

    this.objBorder = new Border("html");
    this.objVRAM = new Vram(this.objTarget);

    this.clkMainLoop = setInterval(function() {
        if (!zx.loopStillWorking) {
            zx.loopStillWorking = true;
            zx.objVRAM.refreshScreen();
            if (zx.objBorder.refresh) zx.objBorder.refreshScreen();
            zx.loopStillWorking = false;
        }
    }, 125); // Refresh at 8fps

},

setBorder: function(P_nDelay, P_nColor) {

    this.delay += P_nDelay;
    return this.wait(this.delay, function() { return zx.objBorder.setBorder(P_nColor); });

},

setText: function(P_nDelay, P_nCol, P_nRow, P_cText, P_nColor, P_nBackground) {

    this.delay += P_nDelay;
    return this.wait(this.delay, function() {
        return zx.objVRAM.setText(P_nCol, P_nRow, P_cText, P_nColor, P_nBackground);
    });

},

/**
 * Attende un certo numero di millisecondi e quindi esegue una funzione.
 * Non funziona troppo bene. Perlomeno non funziona ancora come io vorrei...
 *
 * @param P_nCicli      Tempo in millisecondi da attendere
 * @param P_funzione    Funzione da eseguire al termine dell'attesa
 * @return {Number}     Restituisce l'handler alla funzione di timer
 */
wait: function(P_nCicli, P_funzione) {
    return setTimeout(P_funzione, P_nCicli);
}

};