var Border = function (P_cTarget) {

    // Proprietà e metodi privati

    this.target = $(P_cTarget);

    this.refresh = false;  // Booleano che indica se c'è la necessità di cambiare il colore del bordo
    this.color = "";       // Colore del bordo, solitamente espresso nella forma #RRGGBB
    this.objPalette = new Palette();

};

Border.prototype = function () {

    /**
     * Restituisce il colore del bordo dello schermo
     *
     * @return {String}     Colore del bordo dello schermo, solitamente espresso nel formato #RRGGBB
     */
    var getBorder = function() {
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
                this.color = this.objPalette.getColor(P_nColore);
            } else {
                this.color = this.objPalette.getColor(5) + " url(_img/background_loading.gif) repeat left top";
            }
            this.refresh = true;
        },
        refreshScreen = function() {
            $(this.target).css("background", zx.objBorder.color);
            this.refresh = false;
        };

    return {
        // Metodi pubblici
        getBorder: getBorder,
        setBorder: setBorder,
        refreshScreen: refreshScreen
    }

}();