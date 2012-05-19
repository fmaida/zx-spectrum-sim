var Palette = function() {
    //
}

Palette.prototype = function () {

    // Proprietà e metodi privati

    var colors = new Array("#000000", "#0000c0", "#c00000", "#c000c0",   // Palette approssimativa dei colori
                           "#00c000", "#00c0c0", "#c0c000", "#c0c0c0",   // disponibili su di un vero ZX Spectrum
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